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
