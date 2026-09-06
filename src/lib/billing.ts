export function billableMinutes(actualDurationSeconds: number): number {
  return Math.ceil(actualDurationSeconds / 60);
}

export function totalCost(actualDurationSeconds: number, pricePerMinute: number): number {
  return billableMinutes(actualDurationSeconds) * pricePerMinute;
}

export function elapsedSeconds(startTimestamp: string, now: number = Date.now()): number {
  const start = new Date(startTimestamp).getTime();
  return Math.max(0, Math.floor((now - start) / 1000));
}

export function formatDuration(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

export function formatPKR(amount: number): string {
  return `PKR ${Math.round(amount).toLocaleString('en-PK')}`;
}

/**
 * Local calendar-day key (YYYY-MM-DD) for an ISO timestamp — not the UTC date. A game
 * that ends at 11pm in Pakistan (UTC+5) is still "today" locally even though its UTC
 * timestamp has already rolled into tomorrow's date; grouping by `.slice(0, 10)` on the
 * raw ISO string would silently misfile it. This matches the calendar date an
 * `<input type="date">` and `toLocaleDateString()` both show the user.
 */
export function toLocalDateKey(iso: string | Date): string {
  const d = typeof iso === 'string' ? new Date(iso) : iso;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/**
 * Parses a YYYY-MM-DD key (e.g. from an `<input type="date">`) as local midnight.
 * `new Date("2026-09-07")` parses as UTC midnight instead, which display-formats as
 * the wrong calendar day in any timezone behind UTC — this avoids that.
 */
export function localDateFromKey(dateKey: string): Date {
  const [y, m, d] = dateKey.split('-').map(Number);
  return new Date(y, m - 1, d);
}
