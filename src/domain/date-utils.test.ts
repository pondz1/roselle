import {
  addDays,
  addMonths,
  compareDates,
  diffDays,
  formatFullDate,
  formatISODate,
  formatMonthYear,
  formatShortDate,
  getMonthGrid,
  isValidISODate,
  parseISODate,
  todayISO,
} from './date-utils';

describe('date-utils', () => {
  it('validates real calendar ISO dates and rejects invalid ones', () => {
    expect(isValidISODate('2026-11-19')).toBe(true);
    expect(isValidISODate('2024-02-29')).toBe(true);
    expect(isValidISODate('2025-02-29')).toBe(false);
    expect(isValidISODate('2026-13-01')).toBe(false);
    expect(isValidISODate('2026-04-31')).toBe(false);
    expect(isValidISODate('2026-1-5')).toBe(false);
    expect(isValidISODate('not-a-date')).toBe(false);
  });

  it('adds and diffs days accurately across leap years and year boundaries', () => {
    expect(addDays('2024-02-28', 1)).toBe('2024-02-29');
    expect(addDays('2024-02-29', 1)).toBe('2024-03-01');
    expect(addDays('2026-12-30', 3)).toBe('2027-01-02');
    expect(addDays('2027-01-02', -3)).toBe('2026-12-30');
    expect(diffDays('2026-11-01', '2026-11-19')).toBe(18);
    expect(diffDays('2026-11-19', '2026-11-01')).toBe(-18);
    expect(diffDays('2024-02-28', '2024-03-01')).toBe(2);
  });

  it('compares and formats dates cleanly', () => {
    expect(compareDates('2026-11-01', '2026-11-02')).toBe(-1);
    expect(compareDates('2026-11-02', '2026-11-02')).toBe(0);
    expect(compareDates('2026-11-03', '2026-11-02')).toBe(1);
    expect(parseISODate('2026-11-19')).toEqual({ year: 2026, month: 11, day: 19 });
    expect(formatISODate(2026, 3, 5)).toBe('2026-03-05');
    expect(todayISO(new Date(2026, 10, 19, 23, 59))).toBe('2026-11-19');
  });

  it('navigates months across year boundaries', () => {
    expect(addMonths(2026, 12, 1)).toEqual({ year: 2027, month: 1 });
    expect(addMonths(2026, 1, -1)).toEqual({ year: 2025, month: 12 });
  });

  it('builds a complete 42-cell Sunday-first month grid', () => {
    const grid = getMonthGrid(2026, 11);
    expect(grid).toHaveLength(42);
    expect(grid[0]).toEqual({ date: '2026-11-01', inCurrentMonth: true });
    expect(grid[29]).toEqual({ date: '2026-11-30', inCurrentMonth: true });
    expect(grid[30]).toEqual({ date: '2026-12-01', inCurrentMonth: false });
  });

  it('formats localized Thai and English labels without throwing', () => {
    expect(formatMonthYear(2026, 11, 'en')).toContain('2026');
    expect(formatMonthYear(2026, 11, 'th')).toContain('2569');
    expect(formatFullDate('2026-11-19', 'en')).toContain('19');
    expect(formatShortDate('2026-11-19', 'th')).toContain('19');
  });
});
