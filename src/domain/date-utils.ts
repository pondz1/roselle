import type { ISODate, Locale } from './types';

const ISO_DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
const MS_PER_DAY = 86_400_000;

export function isValidISODate(value: string): boolean {
  const match = ISO_DATE_RE.exec(value);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return false;
  const dt = new Date(Date.UTC(year, month - 1, day));
  return (
    dt.getUTCFullYear() === year &&
    dt.getUTCMonth() === month - 1 &&
    dt.getUTCDate() === day
  );
}

export function parseISODate(date: ISODate): { year: number; month: number; day: number } {
  const match = ISO_DATE_RE.exec(date);
  if (!match) {
    throw new Error(`Invalid ISO date: ${date}`);
  }
  return {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
  };
}

export function formatISODate(year: number, month: number, day: number): ISODate {
  const y = String(year).padStart(4, '0');
  const m = String(month).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function toUTCTimestamp(date: ISODate): number {
  const { year, month, day } = parseISODate(date);
  return Date.UTC(year, month - 1, day);
}

export function addDays(date: ISODate, days: number): ISODate {
  const dt = new Date(toUTCTimestamp(date) + days * MS_PER_DAY);
  return formatISODate(dt.getUTCFullYear(), dt.getUTCMonth() + 1, dt.getUTCDate());
}

export function diffDays(from: ISODate, to: ISODate): number {
  return Math.round((toUTCTimestamp(to) - toUTCTimestamp(from)) / MS_PER_DAY);
}

export function compareDates(a: ISODate, b: ISODate): number {
  if (a === b) return 0;
  return a < b ? -1 : 1;
}

export function todayISO(now: Date = new Date()): ISODate {
  return formatISODate(now.getFullYear(), now.getMonth() + 1, now.getDate());
}

export function addMonths(
  year: number,
  month: number,
  delta: number,
): { year: number; month: number } {
  const total = year * 12 + (month - 1) + delta;
  const nextYear = Math.floor(total / 12);
  const nextMonth = (((total % 12) + 12) % 12) + 1;
  return { year: nextYear, month: nextMonth };
}

export function getMonthGrid(
  year: number,
  month: number,
): Array<{ date: ISODate; inCurrentMonth: boolean }> {
  const firstOfMonth = formatISODate(year, month, 1);
  const firstDayOfWeek = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
  const gridStart = addDays(firstOfMonth, -firstDayOfWeek);
  const cells: Array<{ date: ISODate; inCurrentMonth: boolean }> = [];
  for (let i = 0; i < 42; i += 1) {
    const date = addDays(gridStart, i);
    const parsed = parseISODate(date);
    cells.push({
      date,
      inCurrentMonth: parsed.year === year && parsed.month === month,
    });
  }
  return cells;
}

function toNoonUTCDate(date: ISODate): Date {
  const { year, month, day } = parseISODate(date);
  return new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
}

export function formatMonthYear(year: number, month: number, locale: Locale): string {
  const dt = new Date(Date.UTC(year, month - 1, 15, 12, 0, 0));
  return new Intl.DateTimeFormat(locale === 'th' ? 'th-TH' : 'en-US', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(dt);
}

export function formatFullDate(date: ISODate, locale: Locale): string {
  return new Intl.DateTimeFormat(locale === 'th' ? 'th-TH' : 'en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(toNoonUTCDate(date));
}

export function formatShortDate(date: ISODate, locale: Locale): string {
  return new Intl.DateTimeFormat(locale === 'th' ? 'th-TH' : 'en-US', {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  }).format(toNoonUTCDate(date));
}
