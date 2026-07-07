import CancelIcon from '@svgs/common/Cancel.svg?react'
import { useEffect, useMemo, useState } from 'react'
import Modal from 'react-modal'
import CaretIcon from '../CaretIcon'

type AnchorPos = {
  top: number
  left: number
}

type Props = {
  isOpen: boolean
  onClose: () => void
  value: Date
  onConfirm: (next: Date) => void
  anchor: AnchorPos
}

const MODAL_WIDTH = 300
const MODAL_OFFSET = 8
const VIEWPORT_MARGIN = 12

const MONTHS = Array.from({ length: 12 }, (_, index) => index)

const cn = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(' ')

export default function MonthPickerModal({
  isOpen,
  onClose,
  value,
  onConfirm,
  anchor,
}: Props) {
  const [viewYear, setViewYear] = useState(value.getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(value.getMonth())

  const today = useMemo(() => new Date(), [])
  const currentYear = today.getFullYear()
  const currentMonth = today.getMonth()

  useEffect(() => {
    if (!isOpen) return

    setViewYear(value.getFullYear())
    setSelectedMonth(value.getMonth())
  }, [isOpen, value])

  const isFutureMonth = (month: number) => {
    if (viewYear > currentYear) return true
    if (viewYear < currentYear) return false

    return month > currentMonth
  }

  const selectedDate = new Date(viewYear, selectedMonth, 1)
  const isSelectedFuture = isFutureMonth(selectedMonth)

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
        '[&.ReactModal__Content--after-open]:translate-y-0',
        '[&.ReactModal__Content--after-open]:scale-100',
        '[&.ReactModal__Content--after-open]:opacity-100',
        '[&.ReactModal__Content--before-close]:-translate-y-1.5',
        '[&.ReactModal__Content--before-close]:scale-[0.98]',
        '[&.ReactModal__Content--before-close]:opacity-0',
      )}
      style={{
        overlay: {
          backgroundColor: 'transparent',
        },
        content: {
          top: `${anchor.top + 35 + MODAL_OFFSET}px`,
          left: `clamp(${VIEWPORT_MARGIN}px, ${anchor.left}px, calc(100vw - ${MODAL_WIDTH}px - ${VIEWPORT_MARGIN}px))`,
        },
      }}
    >
      <div className="w-[300px] rounded-[10px] bg-app-white p-5">
        <div className="relative flex items-center justify-center">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              aria-label="이전 년도"
              onClick={() => setViewYear((year) => year - 1)}
              className="flex size-6 cursor-pointer items-center justify-center rounded-full bg-transparent hover:bg-app-gray50"
            >
              <CaretIcon direction="left" color="#C1C3C7" />
            </button>

            <div className="min-w-12 text-center text-16 font-semibold text-app-black">
              {viewYear}
            </div>

            <button
              type="button"
              aria-label="다음 년도"
              onClick={() => setViewYear((year) => year + 1)}
              disabled={viewYear >= currentYear}
              className="flex size-6 cursor-pointer items-center justify-center rounded-full bg-transparent hover:bg-app-gray50 disabled:cursor-not-allowed disabled:opacity-30"
            >
              <CaretIcon direction="right" color="#C1C3C7" />
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="absolute right-0 size-6"
          >
            <CancelIcon />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-1.5 py-6">
          {MONTHS.map((month) => {
            const disabled = isFutureMonth(month)
            const selected = month === selectedMonth

            return (
              <button
                key={month}
                type="button"
                disabled={disabled}
                onClick={() => setSelectedMonth(month)}
                className={cn(
                  'h-10 cursor-pointer rounded-lg border border-app-gray50 bg-transparent text-14 text-app-gray500',
                  selected && 'border-app-gray500 text-app-black',
                  'disabled:cursor-not-allowed disabled:bg-app-gray50 disabled:opacity-50',
                )}
              >
                {month + 1}월
              </button>
            )
          })}
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="h-11 cursor-pointer rounded-[10px] bg-app-gray50 text-15 font-medium text-app-black"
          >
            취소
          </button>

          <button
            type="button"
            disabled={isSelectedFuture}
            onClick={() => {
              onConfirm(selectedDate)
              onClose()
            }}
            className="h-11 cursor-pointer rounded-[10px] bg-app-primary text-15 font-medium text-app-black disabled:cursor-not-allowed disabled:bg-app-gray50 disabled:text-app-gray500"
          >
            확인
          </button>
        </div>
      </div>
    </Modal>
  )
}
