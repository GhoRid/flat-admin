import { format, isValid, parse } from 'date-fns'

// 숫자 포매팅
export const onlyDigits = (v: string) => v.replace(/\D+/g, '')

export const isValidTime = (t: string) => /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(t)

export const formatScheduleTime = (value: string) => {
  const timeOnly = value.match(/^\d{2}:\d{2}/)?.[0]
  if (timeOnly) return timeOnly

  const localDateTime = value.match(/T(\d{2}:\d{2})/)?.[1]
  if (localDateTime) return localDateTime

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Seoul',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(date)

  const hour = parts.find((part) => part.type === 'hour')?.value ?? '00'
  const minute = parts.find((part) => part.type === 'minute')?.value ?? '00'

  return `${hour}:${minute}`
}

const YYYY_MM_REGEX = /^\d{4}-\d{2}$/
const YYYY_MM_DD_REGEX = /^\d{4}-\d{2}-\d{2}$/
const YYYYMMDD_REGEX = /^\d{8}$/

const parseStrictDate = (value: string, dateFormat: string) => {
  const parsed = parse(value, dateFormat, new Date())
  return isValid(parsed) && format(parsed, dateFormat) === value ? parsed : null
}

export const formatBusinessNumber = (value: string) => {
  const digits = onlyDigits(value).slice(0, 10)
  if (digits.length <= 3) return digits
  if (digits.length <= 5) return `${digits.slice(0, 3)}-${digits.slice(3)}`
  if (digits.length <= 10)
    return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`
  return digits
}

export const isYYYYMMDD = (s: string) => parseYYYYMMDDToDate(s) !== null

export const isYYYYMM = (s: string) => parseYYYYMMToDate(s) !== null

export const formatToYYYYMM = (date: Date) => format(date, 'yyyy-MM')

export const formatToYYYYMMDD = (date: Date) => format(date, 'yyyy-MM-dd')

export const parseYYYYMMToDate = (value: string): Date | null => {
  if (!YYYY_MM_REGEX.test(value)) return null

  return parseStrictDate(value, 'yyyy-MM')
}

export const parseYYYYMMDDToDate = (value: string): Date | null => {
  if (!YYYY_MM_DD_REGEX.test(value)) return null

  return parseStrictDate(value, 'yyyy-MM-dd')
}

export const getSearchMonth = (value: unknown, fallback = new Date()) =>
  typeof value === 'string' && parseYYYYMMToDate(value)
    ? value
    : formatToYYYYMM(fallback)

export const getSearchDate = (value: unknown, fallback = new Date()) =>
  typeof value === 'string' && parseYYYYMMDDToDate(value)
    ? value
    : formatToYYYYMMDD(fallback)

// 날짜 하이픈 포매팅 (예: 2023-12-29)
export const formatDateHyphen = (s: string, maxLen = 8) => {
  const d = s.replace(/\D/g, '').slice(0, maxLen)
  if (d.length <= 4) return d
  if (d.length <= 6) return `${d.slice(0, 4)}-${d.slice(4)}`
  return `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6)}`
}

export const formatDateKorean = (s: string, maxLen = 8) => {
  const d = s.replace(/\D/g, '').slice(0, maxLen)
  if (d.length <= 4) return d
  if (d.length <= 6) return `${d.slice(0, 4)}년 ${d.slice(4)}월`
  return `${d.slice(0, 4)}년 ${d.slice(4, 6)}월 ${d.slice(6)}일`
}

// "2026-01-23" -> (로컬 00:00) ISO
export const ymdHyphenToIsoLocal = (ymd: string): string | null => {
  const digits = onlyDigits(ymd) // "20260123"
  const dt = parseYmd8ToDate(digits)
  if (!dt) return null

  return format(dt, "yyyy-MM-dd'T'HH:mm:ss")
}

// 날짜를 YYYYMMDD 형식 문자열로 변환
export const toYmd8 = (dt: Date) => format(dt, 'yyyyMMdd')

// YYYYMMDD 형식 문자열을 Date 객체로 변환
export const parseYmd8ToDate = (s8: string): Date | null => {
  if (!YYYYMMDD_REGEX.test(s8)) return null

  return parseStrictDate(s8, 'yyyyMMdd')
}

// 한국 원화 포매팅
export const formatKrw = (value: number) => value.toLocaleString('ko-KR')

// 전화번호 포매팅 (예: 010-1234-5678)
export const formatPhone = (v: string) => {
  const d = onlyDigits(v).slice(0, 11) // cap to 11 digits
  if (d.length <= 3) return d
  if (d.length <= 7) return `${d.slice(0, 3)}-${d.slice(3)}`
  return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`
}

// 날짜를 YYMMDD(예: 251229) 형식으로 변환
export const formatToYYMMDD = (date: Date) => format(date, 'yyMMdd')

/**
 * ISO 문자열/Date를 "YYYY-MM-DD"로 포맷한다.
 * 기본 타임존은 Asia/Seoul.
 */
export function formatToYmd(
  input: string | number | Date,
  opts: { timeZone?: string } = { timeZone: 'Asia/Seoul' },
): string {
  const { timeZone = 'Asia/Seoul' } = opts

  const date = input instanceof Date ? input : new Date(input)
  if (isNaN(date.getTime())) {
    throw new Error('Invalid date input')
  }

  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })

  // "YYYY-MM-DD" 형식 문자열 반환
  return fmt.format(date) // en-CA locale은 기본이 "YYYY-MM-DD"
}

/**
 * ISO 문자열/Date를 "YYYY-MM-DD HH:mm:ss"로 포맷한다.
 * 기본 타임존은 Asia/Seoul.
 */
export function formatToYmdHms(
  input: string | number | Date,
  opts: { timeZone?: string } = { timeZone: 'Asia/Seoul' },
): string {
  const { timeZone = 'Asia/Seoul' } = opts

  const date = input instanceof Date ? input : new Date(input)
  if (isNaN(date.getTime())) {
    throw new Error('Invalid date input')
  }

  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })

  // 안전하게 조각(parts)으로 받아 조합
  const parts = fmt.formatToParts(date)
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? ''

  const yyyy = get('year')
  const mm = get('month')
  const dd = get('day')
  const HH = get('hour')
  const MM = get('minute')
  const SS = get('second')

  return `${yyyy}-${mm}-${dd} ${HH}:${MM}:${SS}`
}

/**
 * NV-CAT 스타일 일시 문자열(예: "251031154412")을
 * "YYYY-MM-DD HH:mm" 형식으로 변환한다.
 *
 * 형식: YYMMDDHHmm[ss]
 *   - 앞 2자리: 연(20xx 기준)
 *   - 다음 2자리: 월
 *   - 다음 2자리: 일
 *   - 다음 2자리: 시
 *   - 다음 2자리: 분
 *   - 나머지 2자리는(있다면) 초로 취급하지만 출력에는 사용하지 않는다.
 */
export function formatYYMMDDHHSSToYmdHm(raw: string): string {
  const d = onlyDigits(raw)

  // 최소 YYMMDDHHmm(10자리)는 있어야 함
  if (d.length < 10) {
    return '-'
  }

  const yy = d.slice(0, 2)
  const MM = d.slice(2, 4)
  const dd = d.slice(4, 6)
  const HH = d.slice(6, 8)
  const mm = d.slice(8, 10)

  const yyyy = `20${yy}`

  return `${yyyy}-${MM}-${dd} ${HH}:${mm}`
}

export const secToDhms = (totalSeconds: number, lang = 'eng') => {
  const days = Math.floor(totalSeconds / (3600 * 24))
  const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  const pad = (n: number) => String(n).padStart(2, '0')

  if (lang !== 'kor') {
    if (days >= 1) {
      return `${days}D ${pad(hours)}:${pad(minutes)}`
    }
  } else {
    if (days >= 1) {
      return `${days}일 ${pad(hours)}시 ${pad(minutes)}분`
    }
  }

  // days가 0이면 "23:10:22" 형태 (시:분:초)
  if (lang === 'kor') {
    return `${pad(hours)}시 ${pad(minutes)}분 ${pad(seconds)}초`
  }
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
}
