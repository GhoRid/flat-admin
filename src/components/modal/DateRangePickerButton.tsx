import CalendarIcon from '@svgs/common/Calendar.svg?react'
import { useMemo, useRef, useState } from 'react'
import { formatToYYYYMMDD, parseYYYYMMDDToDate } from '../../utils/format'
import DatePickerModal from './DatePickerModal'

type DateRange = {
  startDate: string
  endDate: string
}

type AnchorPos = {
  top: number
  right: number
}

type Props = {
  value: DateRange
  onConfirm: (next: DateRange) => void
  minDate?: Date
  maxDate?: Date
}

const toShortDate = (value: string) => value.slice(2).replaceAll('-', '.')
const toMonthDay = (value: string) => value.slice(5).replaceAll('-', '.')
const getYear = (value: string) => value.slice(0, 4)

export default function DateRangePickerButton({
  value,
  onConfirm,
  minDate,
  maxDate,
}: Props) {
  const buttonRef = useRef<HTMLButtonElement>(null)

  const [isOpen, setIsOpen] = useState(false)
  const [anchor, setAnchor] = useState<AnchorPos>({
    top: 0,
    right: 0,
  })

  const rangeValue = useMemo(
    () => ({
      startDate: parseYYYYMMDDToDate(value.startDate),
      endDate: parseYYYYMMDDToDate(value.endDate),
    }),
    [value.endDate, value.startDate],
  )

  const openPicker = () => {
    const el = buttonRef.current
    if (!el) return

    const rect = el.getBoundingClientRect()

    setAnchor({
      top: rect.top,
      right: rect.right,
    })

    setIsOpen(true)
  }

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={openPicker}
        aria-label="기간 선택"
        className="inline-flex h-full cursor-pointer items-center gap-2 whitespace-nowrap rounded-3xl border border-app-gray50 bg-app-gray50 px-2.5 text-app-black [&_span]:text-14 [&_span]:font-normal [&_svg]:size-[22px]"
      >
        <CalendarIcon />

        <span>
          {toShortDate(value.startDate)} ~{' '}
          {getYear(value.startDate) === getYear(value.endDate)
            ? toMonthDay(value.endDate)
            : toShortDate(value.endDate)}
        </span>
      </button>

      <DatePickerModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        mode="range"
        rangeValue={rangeValue}
        baseMonth={rangeValue.endDate ?? rangeValue.startDate ?? undefined}
        onRangeConfirm={(next) =>
          onConfirm({
            startDate: formatToYYYYMMDD(next.startDate),
            endDate: formatToYYYYMMDD(next.endDate),
          })
        }
        anchor={anchor}
        minDate={minDate}
        maxDate={maxDate}
      />
    </>
  )
}
