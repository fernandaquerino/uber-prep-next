/**
 * Day difference between two ISO calendar dates ("YYYY-MM-DD"), measured as
 * `to - from`. Parsed in UTC to avoid DST/timezone drift.
 */
export function diffCalendarDays(from: string, to: string): number {
  const f = Date.parse(`${from.slice(0, 10)}T00:00:00Z`);
  const t = Date.parse(`${to.slice(0, 10)}T00:00:00Z`);
  return Math.round((t - f) / 86_400_000);
}

/**
 * Human-friendly pt-BR relative label for a calendar date compared to today.
 * Examples: "hoje", "ontem", "amanhã", "há 3 dias", "em 2 dias".
 */
export function formatCalendarDateRelative(date: string, today: string): string {
  const delta = diffCalendarDays(today, date); // date - today
  if (delta === 0) return "hoje";
  if (delta === 1) return "amanhã";
  if (delta === -1) return "ontem";
  if (delta > 1) return `em ${delta} dias`;
  return `há ${Math.abs(delta)} dias`;
}
