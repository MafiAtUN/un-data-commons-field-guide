/**
 * Say something to screen-reader users without moving their focus: "Link
 * copied", "Progress cleared". The page carries one polite status region
 * (#fg-status, in Base.astro) and everything speaks through it.
 */
export function announce(message: string): void {
  const region = document.getElementById('fg-status');
  if (!region) return;
  // Clearing first makes a repeated message ("Copied", "Copied") be read again.
  region.textContent = '';
  window.setTimeout(() => {
    region.textContent = message;
  }, 50);
}
