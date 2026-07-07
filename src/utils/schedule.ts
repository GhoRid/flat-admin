import { eachDayOfInterval, endOfMonth, endOfWeek, startOfMonth, startOfWeek } from "date-fns";
import { formatToYYYYMMDD, formatToYmd, parseYYYYMMDDToDate, parseYYYYMMToDate } from "./format";

export const SCHEDULE_WEEK_STARTS_ON: 0 | 1 = 0;

export const formatScheduleDate = (value: string, fallback: string) => {
  if (!value) return fallback;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;

  try {
    return formatToYmd(value);
  } catch {
    return fallback;
  }
};

export const getScheduleDateKeys = (startTime: string, endTime: string, fallback: string) => {
  const startKey = formatScheduleDate(startTime, fallback);
  const endKey = formatScheduleDate(endTime, startKey);
  const start = parseYYYYMMDDToDate(startKey);
  const end = parseYYYYMMDDToDate(endKey);

  if (!start || !end || end < start) return [startKey];

  return eachDayOfInterval({ start, end }).map(formatToYYYYMMDD);
};

export function getCalendarFetchRange(monthKey: string) {
  const base = parseYYYYMMToDate(monthKey) ?? new Date();
  const monthStart = startOfMonth(base);
  const monthEnd = endOfMonth(base);

  const gridStart = startOfWeek(monthStart, { weekStartsOn: SCHEDULE_WEEK_STARTS_ON });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: SCHEDULE_WEEK_STARTS_ON });

  return {
    monthDate: monthStart,
    startDate: formatToYYYYMMDD(gridStart),
    endDate: formatToYYYYMMDD(gridEnd),
  };
}
