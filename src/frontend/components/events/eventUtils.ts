export const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function formatDueDate(d: string) {
  const [y, mo, day] = d.split("-");
  return `${MONTHS[parseInt(mo ?? "1", 10) - 1] ?? mo} ${day}, ${y}`;
}

export function getLastDayOfMonth(year: number, month: number): string {
  const lastDay = new Date(year, month, 0);
  return `${year}-${String(month).padStart(2, "0")}-${String(lastDay.getDate()).padStart(2, "0")}`;
}
