import { onlyDigits } from "./format";

type DateTimeSep = "-" | ":";

export const DATE_PART_SIZES = [4, 2, 2];
export const TIME_PART_SIZES = [2, 2];

export const toScheduleLocalDateTime = (date: string, time: string) => `${date}T${time}:00`;

export const splitDateTimeValue = (raw: string, sep: DateTimeSep, sizes: number[]) => {
  const parts = (raw ?? "").split(sep);
  while (parts.length < sizes.length) parts.push("");
  return parts.slice(0, sizes.length);
};

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

const toInt = (s: string, fallback: number) => {
  const d = onlyDigits(s);
  return d.length ? Number(d) : fallback;
};

const isLeapYear = (y: number) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;

const daysInMonth = (y: number, m: number) => {
  if (m === 2) return isLeapYear(y) ? 29 : 28;
  if ([4, 6, 9, 11].includes(m)) return 30;
  return 31;
};

export const normalizeScheduleDateValue = (value: string) => {
  const [yRaw = "", mRaw = "", dRaw = ""] = value.split("-");

  const y = clamp(toInt(yRaw, new Date().getFullYear()), 1900, 2099);
  const m = clamp(toInt(mRaw, 1), 1, 12);
  const d = clamp(toInt(dRaw, 1), 1, daysInMonth(y, m));

  return [String(y).padStart(4, "0"), String(m).padStart(2, "0"), String(d).padStart(2, "0")].join(
    "-",
  );
};

export const normalizeScheduleTimeValue = (value: string) => {
  const [hRaw = "", mRaw = ""] = value.split(":");

  const h = clamp(toInt(hRaw, 0), 0, 23);
  const m = clamp(toInt(mRaw, 0), 0, 59);

  return [String(h).padStart(2, "0"), String(m).padStart(2, "0")].join(":");
};

export const formatTimeKoreanView = (time: string) => {
  const [hour = "0", minute = "00"] = time.split(":");
  return `${Number(hour)}:${minute}`;
};
