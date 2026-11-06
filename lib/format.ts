export function dateSortValue(dateStr: string): string {
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateStr)) {
    const [day, month, year] = dateStr.split("/");
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }
  return dateStr;
}

export function compareDatesDesc(a: string, b: string): number {
  return dateSortValue(b).localeCompare(dateSortValue(a));
}

// Malaysia is a fixed UTC+8 offset (no DST), so a constant shift is enough.
// Using the server's local date would lag by 8h on a UTC container and hide
// Friday's khutbah until Saturday morning.
const MYT_OFFSET_MS = 8 * 60 * 60 * 1000;

export function todayISO(): string {
  return new Date(Date.now() + MYT_OFFSET_MS).toISOString().slice(0, 10);
}

/** True when the sermon date is later than today in Malaysia. */
export function isUpcoming(dateStr: string): boolean {
  return dateSortValue(dateStr) > todayISO();
}

/**
 * ISO date of the current week's Friday in Malaysia: today when today is
 * Friday, otherwise the most recent Friday. Matches a Mon–Sun week, so the
 * highlight survives Saturday through Thursday and moves when Friday comes.
 */
export function currentFridayISO(): string {
  const now = new Date(Date.now() + MYT_OFFSET_MS);
  const daysSinceFriday = (now.getUTCDay() - 5 + 7) % 7;
  now.setUTCDate(now.getUTCDate() - daysSinceFriday);
  return now.toISOString().slice(0, 10);
}

/** True when the sermon is this week's Friday khutbah. */
export function isCurrentWeek(dateStr: string): boolean {
  return dateSortValue(dateStr) === currentFridayISO();
}

export function formatDate(dateStr: string): string {
  let date: Date;
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateStr)) {
    const [day, month, year] = dateStr.split("/").map(Number);
    date = new Date(year, month - 1, day);
  } else {
    date = new Date(`${dateStr}T00:00:00`);
  }
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString("en-MY", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
