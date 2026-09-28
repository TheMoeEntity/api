const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** A timestamp `days` days before `from`. Used by seeds and tests. */
export function daysAgo(days: number, from: Date = new Date()): Date {
  return new Date(from.getTime() - days * MS_PER_DAY);
}

/** Whole days elapsed between two instants (floored, never negative). */
export function daysBetween(earlier: Date, later: Date): number {
  return Math.max(0, Math.floor((later.getTime() - earlier.getTime()) / MS_PER_DAY));
}
