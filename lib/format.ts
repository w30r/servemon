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
