/**
 * Format a date-only string (YYYY-MM-DD) for display.
 * Appends T12:00:00 to avoid timezone shifts—parsing "2025-11-29" as UTC midnight
 * would display as 11/28 in US timezones.
 */
export function formatDateOnly(dateStr: string): string {
  if (!dateStr) return "";
  return new Date(dateStr + "T12:00:00").toLocaleDateString();
}

export const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
