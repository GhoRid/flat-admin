import {
  addMonths,
  endOfMonth,
  format,
  getDay,
  isAfter,
  isBefore,
  isSameDay,
  isToday,
  startOfMonth,
  subMonths,
} from 'date-fns'
import React, { useMemo } from 'react'
import Modal from 'react-modal'
import CaretIcon from '../CaretIcon'

type AnchorPos = {
  top: number
  left?: number
  right: number
}

type DateRange = {
  startDate: Date | null
  endDate: Date | null
}

type DatePickerModalBaseProps = {
  isOpen: boolean
  onClose: () => void

  baseMonth?: Date
  minDate?: Date
  maxDate?: Date

  /** 아이콘 아래로 띄우기 위한 좌표 */
  anchor: AnchorPos
}

type DatePickerModalProps =
  | (DatePickerModalBaseProps & {
      mode?: 'single'
      value: Date | null
      onChange: (next: Date) => void
      rangeValue?: never
      onRangeConfirm?: never
    })
  | (DatePickerModalBaseProps & {
      mode: 'range'
      value?: Date | null
      onChange?: never
      rangeValue: DateRange
      onRangeConfirm: (next: { startDate: Date; endDate: Date }) => void
    })

const WEEK_STARTS_ON = 0
const MODAL_WIDTH = 275

const cn = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(' ')

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

export default function DatePickerModal({
  isOpen,
  onClose,
  value,
  onChange,
  mode = 'single',
  rangeValue,
  onRangeConfirm,
  baseMonth,
  minDate,
  maxDate,
  anchor,
}: DatePickerModalProps) {
  const isRangeMode = mode === 'range'

  const currentBase = useMemo(() => {
    const seed = baseMonth ?? rangeValue?.startDate ?? value ?? new Date()
    return startOfMonth(seed)
  }, [baseMonth, rangeValue?.startDate, value])

  const [viewMonth, setViewMonth] = React.useState<Date>(currentBase)

  const [draftRange, setDraftRange] = React.useState<DateRange>({
    startDate: rangeValue?.startDate ?? null,
    endDate: rangeValue?.endDate ?? null,
  })

  React.useEffect(() => {
    if (isOpen) {
      setViewMonth(currentBase)
    }
  }, [isOpen, currentBase])

  React.useEffect(() => {
    if (!isOpen || !isRangeMode) return

    setDraftRange({
      startDate: rangeValue?.startDate ?? null,
      endDate: rangeValue?.endDate ?? null,
    })
  }, [isOpen, isRangeMode, rangeValue?.endDate, rangeValue?.startDate])

  const canSelect = (d: Date) => {
    if (minDate && startOfDay(d) < startOfDay(minDate)) return false
    if (maxDate && startOfDay(d) > startOfDay(maxDate)) return false
    return true
  }

  const handlePick = (d: Date) => {
    if (!canSelect(d)) return

    if (isRangeMode) {
      setDraftRange((prev) => {
        if (!prev.startDate || prev.endDate) {
          return { startDate: d, endDate: null }
        }

        if (isBefore(d, prev.startDate)) {
          return { startDate: d, endDate: prev.startDate }
        }

        return { startDate: prev.startDate, endDate: d }
      })
      return
    }

    if (!onChange) return

    onChange(d)
    onClose()
  }

  const handleRangeConfirm = () => {
    if (!draftRange.startDate || !draftRange.endDate || !onRangeConfirm) return

    onRangeConfirm({
      startDate: draftRange.startDate,
      endDate: draftRange.endDate,
    })

    onClose()
  }

  const goPrev = () => setViewMonth((m) => subMonths(m, 1))
  const goNext = () => setViewMonth((m) => addMonths(m, 1))

  const cells: Array<Date | null> = useMemo(() => {
    const first = startOfMonth(viewMonth)
    const last = endOfMonth(viewMonth)

    const firstDow = getDay(first)
    const leading = (firstDow - WEEK_STARTS_ON + 7) % 7

    const totalDays = last.getDate()
    const result: Array<Date | null> = []

    for (let i = 0; i < leading; i++) {
      result.push(null)
    }

    for (let day = 1; day <= totalDays; day++) {
      result.push(new Date(first.getFullYear(), first.getMonth(), day))
    }

    while (result.length % 7 !== 0) {
      result.push(null)
    }

    return result
  }, [viewMonth])

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      shouldCloseOnOverlayClick
      shouldCloseOnEsc
      ariaHideApp={false}
      closeTimeoutMS={180}
      className={cn(
        'absolute rounded-[10px] bg-app-white shadow-[0_2px_20px_rgba(0,0,0,0.03),0_2px_8px_rgba(0,0,0,0.08)] outline-none',
        'opacity-0 -translate-y-2 scale-[0.98] transition-[opacity,transform] duration-[180ms] ease-in-out will-change-[transform,opacity]',
        '[&.ReactModal__Content--after-open]:translate-y-0 [&.ReactModal__Content--after-open]:scale-100 [&.ReactModal__Content--after-open]:opacity-100',
        '[&.ReactModal__Content--before-close]:-translate-y-1.5 [&.ReactModal__Content--before-close]:scale-[0.98] [&.ReactModal__Content--before-close]:opacity-0',
      )}
      style={{
        overlay: {
          backgroundColor: 'transparent',
        },
        content: {
          top: `${anchor.top + 35}px`,
          left: `${anchor.left ?? anchor.right - MODAL_WIDTH + 10}px`,
        },
      }}
    >
      <div className="w-[275px] rounded-[10px] bg-app-white p-2.5">
        <div className="flex items-center justify-center gap-2.5 py-2.5">
          <button
            type="button"
            onClick={goPrev}
            aria-label="이전 달"
            className="flex size-6 items-center justify-center rounded-full bg-transparent text-16 leading-none text-app-gray500 hover:bg-app-gray50 [&_svg]:size-[22px]"
          >
            <CaretIcon direction="left" color="#C1C3C7" />
          </button>

          <div className="text-center text-16 font-medium">
            {format(viewMonth, 'yyyy.MM')}
          </div>

          <button
            type="button"
            onClick={goNext}
            aria-label="다음 달"
            className="flex size-6 items-center justify-center rounded-full bg-transparent text-16 leading-none text-app-gray500 hover:bg-app-gray50 [&_svg]:size-[22px]"
          >
            <CaretIcon direction="right" color="#C1C3C7" />
          </button>
        </div>

        <div className="grid grid-cols-7 py-2.5">
          {cells.map((d, idx) => {
            if (!d) {
              return <div key={`e-${idx}`} className="h-[35px]" />
            }

            const isSelected = value ? isSameDay(d, value) : false

            const isRangeStart = draftRange.startDate
              ? isSameDay(d, draftRange.startDate)
              : false

            const isRangeEnd = draftRange.endDate
              ? isSameDay(d, draftRange.endDate)
              : false

            const isSingleDayRange =
              draftRange.startDate &&
              draftRange.endDate &&
              isSameDay(draftRange.startDate, draftRange.endDate) &&
              isSameDay(d, draftRange.startDate)

            const rangeEdge =
              isRangeMode && draftRange.endDate && !isSingleDayRange
                ? isRangeStart
                  ? 'start'
                  : isRangeEnd
                    ? 'end'
                    : undefined
                : undefined

            const inRange =
              draftRange.startDate &&
              draftRange.endDate &&
              isAfter(d, draftRange.startDate) &&
              isBefore(d, draftRange.endDate)

            const today = isToday(d)
            const enabled = canSelect(d)

            const selected = isRangeMode
              ? isRangeStart || isRangeEnd
              : isSelected

            return (
              <button
                key={d.toISOString()}
                type="button"
                onClick={() => enabled && handlePick(d)}
                disabled={!enabled}
                className={cn(
                  'box-border flex h-[35px] w-full items-center justify-center bg-transparent text-14 text-app-gray500 disabled:opacity-25',
                  inRange || rangeEdge ? 'rounded-none' : 'rounded-full',
                  'hover:bg-app-gray50',
                  today && !selected && 'outline-2 outline-[rgba(0,0,0,0.08)]',
                  selected && 'text-app-black',
                  isRangeMode &&
                    Boolean(inRange) &&
                    'bg-app-gray50 text-app-black',
                  rangeEdge === 'start' &&
                    'bg-[linear-gradient(to_right,transparent_50%,#F5F5F5_50%)] text-app-black',
                  rangeEdge === 'end' &&
                    'bg-[linear-gradient(to_right,#F5F5F5_50%,transparent_50%)] text-app-black',
                )}
              >
                <span
                  className={cn(
                    'box-border flex size-[35px] items-center justify-center rounded-full',
                    selected && 'bg-app-primary',
                    isRangeMode &&
                      Boolean(isSingleDayRange) &&
                      'border-4 border-[#D7F212]',
                  )}
                >
                  {format(d, 'd')}
                </span>
              </button>
            )
          })}
        </div>

        {isRangeMode ? (
          <div className="grid grid-cols-2 gap-2.5 pt-2.5">
            <button
              type="button"
              onClick={onClose}
              className="h-[38px] cursor-pointer rounded-lg bg-app-gray50 text-14 font-medium text-app-black"
            >
              취소
            </button>

            <button
              type="button"
              disabled={!draftRange.startDate || !draftRange.endDate}
              onClick={handleRangeConfirm}
              className="h-[38px] cursor-pointer rounded-lg bg-app-primary text-14 font-medium text-app-black disabled:cursor-not-allowed disabled:bg-app-gray50 disabled:text-app-gray500"
            >
              확인
            </button>
          </div>
        ) : null}
      </div>
    </Modal>
  )
}
