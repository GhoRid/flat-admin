import CalendarIcon from "@svgs/common/Calendar.svg?react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { formatDateHyphen, onlyDigits, parseYmd8ToDate, toYmd8 } from "../../utils/format";
import DatePickerModal from "../modal/DatePickerModal";

type DateSectionProps = {
  id?: string;
  title?: string;
  placeholder: string;
  value: string;
  onChange: (next: string) => void;
  allowFutureDate?: boolean;
};

export default function DateSection({
  id,
  title,
  placeholder,
  value,
  onChange,
  allowFutureDate = false,
}: DateSectionProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);

  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date | null>(null);

  const [rawDigits, setRawDigits] = useState("");

  const [anchor, setAnchor] = useState<{ top: number; right: number }>({
    top: 0,
    right: 0,
  });

  const updateAnchor = useCallback(() => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    setAnchor({ top: rect.top, right: rect.right });
  }, []);

  useEffect(() => {
    updateAnchor();
  }, [updateAnchor]);

  // (선택) 스크롤/리사이즈 시 앵커 갱신
  useEffect(() => {
    const onWin = () => updateAnchor();
    window.addEventListener("resize", onWin);
    window.addEventListener("scroll", onWin, true);
    return () => {
      window.removeEventListener("resize", onWin);
      window.removeEventListener("scroll", onWin, true);
    };
  }, [updateAnchor]);

  const error = useMemo(() => {
    const s = rawDigits;

    if (s.length === 0) return undefined;

    if (s.length !== 8) return "8자리로 입력해주세요 (YYYYMMDD)";

    const y = +s.slice(0, 4),
      m = +s.slice(4, 6),
      d = +s.slice(6, 8);

    const now = new Date(),
      CY = now.getFullYear();

    if (y < 1900 || (!allowFutureDate && y > CY)) return "올바른 연도를 입력해주세요";
    if (m < 1 || m > 12) return "올바른 월을 입력해주세요 (01-12)";

    const last = new Date(y, m, 0).getDate();
    if (d < 1 || d > last) return "올바른 일을 입력해주세요";

    if (!allowFutureDate && new Date(y, m - 1, d) > now) return "미래 날짜는 입력할 수 없습니다";

    return undefined;
  }, [allowFutureDate, rawDigits]);

  const onChangeDate = (next: string) => {
    const s = onlyDigits(next).slice(0, 8);
    setRawDigits(s);

    onChange(formatDateHyphen(s));

    // 8자리 + 유효하면 date도 동기화(달력 기본값/선택값으로 쓰기 위함)
    if (s.length === 8) {
      const dt = parseYmd8ToDate(s);
      setDate(dt);
    } else {
      setDate(null);
    }
  };

  const onPickFromCalendar = (d: Date) => {
    setDate(d);
    const s = toYmd8(d);
    setRawDigits(s);

    onChange(formatDateHyphen(s));

    setOpen(false);
  };

  return (
    <section id={id ?? title?.replace(/\s+/g, "-").toLowerCase()}>
      {title && <h3 className="mb-2.5 text-14 text-app-gray500">{title}</h3>}

      <div>
        <div
          className={[
            "flex h-10 w-full items-center justify-between rounded-[10px] border px-2.5 [&_svg]:size-[22px] [&_svg]:text-app-gray500 [&_svg]:opacity-50",
            error ? "border-app-red" : "border-app-gray100",
          ].join(" ")}
        >
          <input
            className="w-full bg-transparent text-14 text-app-black outline-none placeholder:text-app-gray500 placeholder:opacity-50"
            type="text"
            inputMode="numeric"
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChangeDate(e.target.value)}
          />
          <button
            ref={buttonRef}
            type="button"
            aria-label="달력 아이콘"
            onClick={() => {
              updateAnchor();
              setOpen(true);
            }}
          >
            <CalendarIcon />
          </button>
        </div>

        {!!error && <p className="mt-1.5 text-12 text-app-red">{error}</p>}
      </div>

      <DatePickerModal
        isOpen={open}
        onClose={() => setOpen(false)}
        value={date}
        onChange={onPickFromCalendar}
        maxDate={allowFutureDate ? undefined : new Date()}
        anchor={anchor}
      />
    </section>
  );
}
