export function toDateKey(date = new Date()) {
  return date.toLocaleDateString('en-CA'); // YYYY-MM-DD in local time
}

export function subtractDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() - days);
  return d;
}

export function isToday(dateKey) {
  return dateKey === toDateKey();
}
