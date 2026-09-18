/** Minimal fetch wrapper: timeouts, typed errors, and a recorded request trace. */

import { LIVE_REQUEST_TIMEOUT_MS } from './config';

export class UndcRequestError extends Error {
  constructor(
    message: string,
    readonly detail: { url: string; status?: number; cause?: unknown },
  ) {
    super(message);
    this.name = 'UndcRequestError';
  }
}

/**
 * A description of the call that produced a value, kept alongside the data so the
 * UI can show readers the exact request rather than paraphrasing it.
 */
export interface RequestTrace {
  method: 'GET' | 'POST';
  url: string;
  body?: unknown;
}

export interface Traced<T> {
  data: T;
  trace: RequestTrace;
}

interface RequestOptions {
  signal?: AbortSignal;
  timeoutMs?: number;
}

async function request<T>(trace: RequestTrace, options: RequestOptions = {}): Promise<Traced<T>> {
  const { signal, timeoutMs = LIVE_REQUEST_TIMEOUT_MS } = options;

  // Compose the caller's signal with our own deadline so either can cancel.
  const timeout = AbortSignal.timeout(timeoutMs);
  const composed = signal ? AbortSignal.any([signal, timeout]) : timeout;

  let response: Response;
  try {
    response = await fetch(trace.url, {
      method: trace.method,
      signal: composed,
      ...(trace.body === undefined
        ? {}
        : { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(trace.body) }),
    });
  } catch (cause) {
    const reason = timeout.aborted ? `timed out after ${timeoutMs}ms` : 'network request failed';
    throw new UndcRequestError(reason, { url: trace.url, cause });
  }

  if (!response.ok) {
    throw new UndcRequestError(`responded ${response.status}`, {
      url: trace.url,
      status: response.status,
    });
  }

  try {
    return { data: (await response.json()) as T, trace };
  } catch (cause) {
    throw new UndcRequestError('response was not valid JSON', { url: trace.url, cause });
  }
}

export function getJson<T>(
  url: string,
  params?: Record<string, string | readonly string[]>,
  options?: RequestOptions,
): Promise<Traced<T>> {
  const full = params ? `${url}?${toSearchParams(params)}` : url;
  return request<T>({ method: 'GET', url: full }, options);
}

export function postJson<T>(
  url: string,
  body: unknown,
  options?: RequestOptions,
): Promise<Traced<T>> {
  return request<T>({ method: 'POST', url, body }, options);
}

/**
 * Build a query string, repeating keys for array values.
 *
 * The REST v2 API takes repeated `select=` keys and expects relation expressions
 * (`->`, `<-`, `{typeOf:Country}`) percent-encoded; `URLSearchParams` does both.
 */
export function toSearchParams(params: Record<string, string | readonly string[]>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (Array.isArray(value)) {
      for (const item of value) search.append(key, item);
    } else {
      search.append(key, value as string);
    }
  }
  return search.toString();
}
