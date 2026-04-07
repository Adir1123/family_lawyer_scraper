// Schedule frequency presets
export const SCHEDULE_PRESETS = [
  { value: 2, label: "Every 2 hours" },
  { value: 4, label: "Every 4 hours" },
  { value: 6, label: "Every 6 hours" },
  { value: 8, label: "Every 8 hours" },
  { value: 12, label: "Every 12 hours" },
  { value: 24, label: "Once daily" },
] as const;

// Hour options for time window (00:00 to 23:00)
export const HOUR_OPTIONS = Array.from({ length: 24 }, (_, i) => ({
  value: i,
  label: `${String(i).padStart(2, "0")}:00`,
}));

/**
 * Build a cron expression from frequency + time window.
 * Supports wrapping past midnight (e.g., from=6 to=0 means 06:00→00:00).
 * E.g., every 2h from 06:00 to 22:00 → "0 6,8,10,12,14,16,18,20,22 * * *"
 * E.g., every 2h from 06:00 to 00:00 → "0 6,8,10,12,14,16,18,20,22,0 * * *"
 * If from=0 and to=23 (all day), use simple "0 *\/N * * *" format.
 */
export function buildCron(frequencyHours: number, fromHour: number, toHour: number): string {
  // Full day — use simple interval
  if (fromHour === 0 && toHour === 23) {
    if (frequencyHours === 24) return "0 0 * * *";
    return `0 */${frequencyHours} * * *`;
  }

  // Once daily within window
  if (frequencyHours === 24) {
    return `0 ${fromHour} * * *`;
  }

  // Build list of hours within the window (supports wrapping past midnight)
  const hours: number[] = [];
  let h = fromHour;
  const endHour = fromHour <= toHour ? toHour : toHour + 24;
  while (h <= endHour) {
    hours.push(h % 24);
    h += frequencyHours;
  }
  if (hours.length === 0) hours.push(fromHour);

  return `0 ${hours.join(",")} * * *`;
}
