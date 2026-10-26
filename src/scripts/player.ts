/**
 * The lesson player.
 *
 * At rest it is a still from this site and a button: nothing is requested from
 * YouTube until someone presses play, which is the privacy promise the old site
 * made and this one keeps. Pressing play swaps in YouTube's privacy-enhanced
 * player, already playing.
 *
 * Chapters and the transcript drive it, and it drives them back. That needs the
 * player's current time, which YouTube's embed reports over postMessage once a
 * page says it is listening. That message format is the one YouTube's own
 * IFrame API script uses, but it is not documented as a public contract, so it
 * is confined to this file. If it never answers, the video still plays and a
 * chapter still jumps (by reloading the embed at that time); only the
 * follow-along highlight and the progress saving go quiet.
 */
import { announce } from './announce';
import { read, update } from './progress';

const ORIGIN = 'https://www.youtube-nocookie.com';
/** Set by the page before it moves on to the next lesson, when autoplay is on. */
const HANDOFF = 'fg-autoplay-next';

function runtime(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

function storedFlag(key: string, fallback: boolean): boolean {
  try {
    const value = localStorage.getItem(key);
    return value === null ? fallback : value === '1';
  } catch {
    return fallback;
  }
}

function storeFlag(key: string, value: boolean): void {
  try {
    localStorage.setItem(key, value ? '1' : '0');
  } catch {
    // not remembered
  }
}

function reducedMotion(): boolean {
  return matchMedia('(prefers-reduced-motion: reduce)').matches;
}

interface PlayerMessage {
  event?: string;
  info?: unknown;
}

class FgPlayer extends HTMLElement {
  private iframe: HTMLIFrameElement | null = null;
  private startAt = 0;
  private heard = false;
  private lastSaved = 0;
  private duration = 0;
  private now = 0;
  private countdown = 0;
  private captionsQuietUntil = 0;
  private captionsAskedAt = 0;

  connectedCallback(): void {
    this.duration = Number(this.dataset.seconds) || 0;
    window.addEventListener('message', this.onMessage);
    if (!this.dataset.video) return;

    const params = new URLSearchParams(location.search);
    // An old link may carry ?autoplay=1. It never starts the video by itself:
    // only a press of play, or the autoplay switch a visitor turned on, does.
    if (params.has('autoplay')) {
      params.delete('autoplay');
      const query = params.toString();
      history.replaceState(history.state, '', `${location.pathname}${query ? `?${query}` : ''}${location.hash}`);
    }

    const asked = Number(params.get('t'));
    const entry = read()[this.dataset.lessonId ?? ''];
    if (asked > 0 && asked < this.duration) {
      this.setStart(asked, 'Play from');
    } else if (entry && !entry.done && entry.t > 5 && entry.t < this.duration - 5) {
      this.setStart(entry.t, 'Resume at');
    }

    this.querySelectorAll('[data-play]').forEach((button) =>
      button.addEventListener('click', () => this.play(this.startAt)),
    );
    this.querySelector('[data-up-next-close]')?.addEventListener('click', () => this.hideUpNext());

    let handedOff = false;
    try {
      handedOff = sessionStorage.getItem(HANDOFF) === location.pathname;
      if (handedOff) sessionStorage.removeItem(HANDOFF);
    } catch {
      handedOff = false;
    }
    if (handedOff) this.play(this.startAt);
  }

  disconnectedCallback(): void {
    window.removeEventListener('message', this.onMessage);
  }

  /** Where the next press of play starts, and what the buttons say about it. */
  setStart(seconds: number, verb: string): void {
    this.startAt = Math.max(0, seconds);
    this.querySelectorAll<HTMLElement>('[data-play-text]').forEach((text) => {
      text.textContent = seconds > 0 ? `${verb} ${runtime(seconds)}` : 'Play';
    });
  }

  get currentTime(): number {
    return this.iframe ? this.now : this.startAt;
  }

  private embedUrl(from: number): string {
    const src = new URL(`${ORIGIN}/embed/${encodeURIComponent(this.dataset.video ?? '')}`);
    src.search = new URLSearchParams({
      autoplay: '1',
      rel: '0',
      playsinline: '1',
      enablejsapi: '1',
      origin: location.origin,
      start: String(Math.floor(from)),
    }).toString();
    return src.href;
  }

  play(from: number): void {
    if (this.iframe) {
      this.seek(from);
      return;
    }
    const stage = this.querySelector<HTMLElement>('[data-stage]');
    if (!this.dataset.video || !stage) return;

    const iframe = document.createElement('iframe');
    iframe.src = this.embedUrl(from);
    iframe.title = this.dataset.title ?? 'Lesson video';
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen';
    iframe.allowFullscreen = true;
    iframe.className = 'absolute inset-0 size-full border-0';
    iframe.addEventListener('load', () => this.listen());

    this.querySelectorAll('[data-play]').forEach((button) => button.remove());
    stage.querySelector('[data-chapter-bar]')?.remove();
    stage.append(iframe);
    this.iframe = iframe;
    this.now = from;
    this.dataset.state = 'playing';
    iframe.focus();
  }

  seek(seconds: number): void {
    if (!this.iframe) {
      this.play(seconds);
    } else if (this.heard) {
      this.command('seekTo', [seconds, true]);
      this.command('playVideo');
      this.now = seconds;
    } else {
      // The embed never answered, so it cannot be told to seek: load it again
      // at the chosen moment.
      this.iframe.src = this.embedUrl(seconds);
      this.now = seconds;
    }
    this.hideUpNext();
    const box = this.getBoundingClientRect();
    if (box.top < 64 || box.bottom > window.innerHeight) {
      this.scrollIntoView({ block: 'start', behavior: reducedMotion() ? 'auto' : 'smooth' });
    }
  }

  private listen(): void {
    // The embed starts reporting once it hears that someone is listening. It may
    // not be ready for the first message, so ask a few times.
    let tries = 0;
    const ask = () => {
      if (this.heard || tries++ > 24) return;
      this.post({ event: 'listening', id: 1, channel: 'widget' });
      window.setTimeout(ask, 250);
    };
    ask();
  }

  private post(message: Record<string, unknown>): void {
    this.iframe?.contentWindow?.postMessage(JSON.stringify(message), ORIGIN);
  }

  private command(func: string, args: unknown[] = []): void {
    this.post({ event: 'command', func, args, id: 1, channel: 'widget' });
  }

  private onMessage = (event: MessageEvent): void => {
    if (event.origin !== ORIGIN || !this.iframe || event.source !== this.iframe.contentWindow) return;
    let data: PlayerMessage;
    try {
      data = (typeof event.data === 'string' ? JSON.parse(event.data) : event.data) as PlayerMessage;
    } catch {
      return;
    }
    if (!data || typeof data.event !== 'string') return;
    this.heard = true;

    if (data.event === 'infoDelivery' && data.info && typeof data.info === 'object') {
      const info = data.info as { currentTime?: unknown; playerState?: unknown };
      // Captions are switched off from the moment the video is actually playing.
      if (info.playerState === 1 && !this.captionsQuietUntil) this.captionsQuietUntil = Date.now() + 8000;
      this.quietCaptions();
      if (typeof info.currentTime === 'number') this.tick(info.currentTime);
      if (info.playerState === 0) this.ended();
    } else if (data.event === 'onStateChange' && data.info === 0) {
      this.ended();
    }
  };

  /**
   * The captions are already in the picture, so YouTube's own track would print
   * the same words a second time on top of them. Its caption module loads a
   * moment after playback starts, so the request is repeated for a few seconds.
   * The CC button still brings the track back for anyone who wants it.
   */
  private quietCaptions(): void {
    if (this.dataset.captions !== 'burned-in' || !this.captionsQuietUntil || Date.now() > this.captionsQuietUntil) return;
    if (Date.now() - this.captionsAskedAt < 900) return;
    this.captionsAskedAt = Date.now();
    this.command('unloadModule', ['captions']);
  }

  private tick(seconds: number): void {
    this.now = seconds;
    this.dispatchEvent(new CustomEvent('fg:time', { detail: seconds, bubbles: true }));
    const id = this.dataset.lessonId;
    if (!id || Date.now() - this.lastSaved < 4000) return;
    this.lastSaved = Date.now();
    const wasDone = Boolean(read()[id]?.done);
    const finished = this.duration > 0 && seconds >= this.duration * 0.9;
    update(id, { t: Math.floor(seconds), done: wasDone || finished });
    if (finished && !wasDone) this.dispatchEvent(new CustomEvent('fg:progress', { bubbles: true }));
  }

  private ended(): void {
    const id = this.dataset.lessonId;
    if (id) update(id, { t: this.duration, done: true });
    this.dispatchEvent(new CustomEvent('fg:progress', { bubbles: true }));
    const panel = this.querySelector<HTMLElement>('[data-up-next]');
    const next = this.dataset.nextHref;
    if (!panel || !next || !panel.hidden) return;
    panel.hidden = false;
    panel.querySelector<HTMLElement>('[data-up-next-link]')?.focus();
    const label = panel.querySelector<HTMLElement>('[data-countdown]');
    if (!storedFlag('fg-autoplay', false)) return;
    announce('This lesson is finished. The next one starts in 6 seconds.');
    let left = 6;
    const step = () => {
      if (panel.hidden || !storedFlag('fg-autoplay', false)) {
        if (label) label.textContent = '';
        return;
      }
      if (label) label.textContent = `Starting in ${left}…`;
      if (left-- <= 0) {
        try {
          sessionStorage.setItem(HANDOFF, new URL(next, location.origin).pathname);
        } catch {
          // Without storage the next lesson simply waits for a press of play.
        }
        location.href = next;
        return;
      }
      this.countdown = window.setTimeout(step, 1000);
    };
    step();
  }

  private hideUpNext(): void {
    window.clearTimeout(this.countdown);
    const panel = this.querySelector<HTMLElement>('[data-up-next]');
    if (panel) panel.hidden = true;
  }
}

if (!customElements.get('fg-player')) customElements.define('fg-player', FgPlayer);

const player = document.querySelector<FgPlayer>('fg-player');

// Chapters and transcript lines seek the player.
document.addEventListener('click', (event) => {
  const target = (event.target as HTMLElement | null)?.closest<HTMLElement>('[data-seek]');
  if (!target || !player || !player.dataset.video) return;
  event.preventDefault();
  player.seek(Number(target.dataset.seek) || 0);
});

// Follow along: the line being spoken, and the chapter it is in.
const transcript = document.querySelector<HTMLElement>('[data-transcript]');
const lines = Array.from(transcript?.querySelectorAll<HTMLElement>('[data-at]') ?? []);
const chapters = Array.from(document.querySelectorAll<HTMLElement>('[data-chapter]'));
const follow = document.querySelector<HTMLInputElement>('[data-follow]');
if (follow) {
  follow.checked = storedFlag('fg-follow', true);
  follow.addEventListener('change', () => storeFlag('fg-follow', follow.checked));
}

function current(items: HTMLElement[], seconds: number, attr: string): HTMLElement | undefined {
  let found: HTMLElement | undefined;
  for (const item of items) {
    if (Number(item.getAttribute(attr)) <= seconds + 0.25) found = item;
  }
  return found;
}

function markCurrent(items: HTMLElement[], active: HTMLElement | undefined): void {
  for (const item of items) {
    const on = item === active;
    item.toggleAttribute('data-now', on);
    if (on) item.setAttribute('aria-current', 'time');
    else item.removeAttribute('aria-current');
  }
}

document.addEventListener('fg:time', (event) => {
  const seconds = (event as CustomEvent<number>).detail;
  const line = current(lines, seconds, 'data-at');
  markCurrent(lines, line);
  markCurrent(chapters, current(chapters, seconds, 'data-chapter'));
  if (line && transcript && follow?.checked && transcript.scrollHeight > transcript.clientHeight) {
    const top = line.offsetTop - transcript.offsetTop - transcript.clientHeight / 3;
    transcript.scrollTo({ top, behavior: reducedMotion() ? 'auto' : 'smooth' });
  }
});

// Arriving from search: highlight the words in the transcript and start there.
// Search matches word stems ("citing" for "cite"), so a word that is not found
// whole is tried again by its first five letters.
const query = new URLSearchParams(location.search).get('q')?.trim().toLowerCase();
if (query && lines.length) {
  const textOf = (line: HTMLElement) => line.querySelector('[data-line-text]')?.textContent?.toLowerCase() ?? '';
  const words = query.split(/\s+/).filter((w) => w.length > 2);
  const found = words.map((w) => (lines.some((l) => textOf(l).includes(w)) ? w : w.slice(0, 5))).filter((w) => w.length > 2);
  const hits = lines.filter((line) => found.some((w) => textOf(line).includes(w)));
  const pattern = new RegExp(`(${found.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi');
  for (const line of hits) {
    const span = line.querySelector<HTMLElement>('[data-line-text]');
    if (!span || !found.length) continue;
    const parts = (span.textContent ?? '').split(pattern);
    span.replaceChildren(
      ...parts.map((part, i) => {
        if (i % 2 === 0) return document.createTextNode(part);
        const mark = document.createElement('mark');
        mark.textContent = part;
        return mark;
      }),
    );
  }
  const first = hits[0];
  if (first) {
    markCurrent(lines, first);
    if (transcript) transcript.scrollTop = first.offsetTop - transcript.offsetTop - 12;
    if (!new URLSearchParams(location.search).get('t')) player?.setStart(Number(first.dataset.at) || 0, 'Play from');
  }
}

// Mark as done, by hand. The label stays the same; the pressed state says it.
const doneButton = document.querySelector<HTMLButtonElement>('[data-mark-done]');
function paintDone() {
  const id = player?.dataset.lessonId;
  if (!doneButton || !id) return;
  doneButton.setAttribute('aria-pressed', String(Boolean(read()[id]?.done)));
}
doneButton?.addEventListener('click', () => {
  const id = player?.dataset.lessonId;
  if (!id) return;
  const done = !read()[id]?.done;
  update(id, { done });
  paintDone();
  announce(done ? 'Marked as done.' : 'No longer marked as done.');
});
document.addEventListener('fg:progress', paintDone);
document.addEventListener('fg:cleared', paintDone);
paintDone();

// Copy a link that opens this lesson at the current moment.
const shareButton = document.querySelector<HTMLButtonElement>('[data-share]');
const shareLabel = shareButton?.querySelector<HTMLElement>('[data-label]');
let copiedUntil = 0;
document.addEventListener('fg:time', (event) => {
  const seconds = (event as CustomEvent<number>).detail;
  if (shareLabel && seconds > 1 && Date.now() > copiedUntil) shareLabel.textContent = `Copy link at ${runtime(seconds)}`;
});
shareButton?.addEventListener('click', async () => {
  const seconds = Math.floor(player?.currentTime ?? 0);
  const link = new URL(location.pathname, location.origin);
  if (seconds > 1) link.searchParams.set('t', String(seconds));
  try {
    await navigator.clipboard.writeText(link.href);
    copiedUntil = Date.now() + 1800;
    if (shareLabel) shareLabel.textContent = 'Link copied';
    announce('Link copied.');
    window.setTimeout(() => {
      if (shareLabel && Date.now() >= copiedUntil) {
        shareLabel.textContent = seconds > 1 ? `Copy link at ${runtime(player?.currentTime ?? seconds)}` : 'Copy link';
      }
    }, 1850);
  } catch {
    window.prompt('Copy this link', link.href);
  }
});

// Play the next lesson when this one ends: off unless chosen.
document.querySelectorAll<HTMLInputElement>('[data-autoplay]').forEach((box) => {
  box.checked = storedFlag('fg-autoplay', false);
  box.addEventListener('change', () => {
    storeFlag('fg-autoplay', box.checked);
    document.querySelectorAll<HTMLInputElement>('[data-autoplay]').forEach((other) => (other.checked = box.checked));
  });
});
