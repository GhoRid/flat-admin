import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent,
  type UIEvent,
} from 'react'
import { normalizeScheduleTimeValue } from '../../utils/scheduleDateTime'
import CustomBaseModal from './CustomBaseModal'

type TimePickerModalProps = {
  isOpen: boolean
  value: string
  onClose: () => void
  onChange: (next: string) => void
}

type Period = '오전' | '오후'
type WheelItem = string | number

const HOURS = Array.from({ length: 12 }, (_, idx) => idx + 1)
const MINUTES = Array.from({ length: 60 }, (_, idx) => idx)
const PERIODS: readonly Period[] = ['오전', '오후']

const WHEEL_ITEM_HEIGHT = 42
const WHEEL_VISIBLE_HEIGHT = 210
const WHEEL_EDGE_SPACER = (WHEEL_VISIBLE_HEIGHT - WHEEL_ITEM_HEIGHT) / 2
const WHEEL_LOOP_COUNT = 21
const WHEEL_MIDDLE_LOOP = Math.floor(WHEEL_LOOP_COUNT / 2)
const WHEEL_SETTLE_DELAY = 110
const PROGRAMMATIC_SCROLL_MS = 220
const PROGRAMMATIC_SCROLL_DURATION = 180
const DRAG_CLICK_THRESHOLD = 4

const cn = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(' ')

const easeOutCubic = (value: number) => 1 - Math.pow(1 - value, 3)

const toParts = (value: string) => {
  const normalized = normalizeScheduleTimeValue(value)
  const [hourRaw = '0', minuteRaw = '0'] = normalized.split(':')

  const hour24 = Number(hourRaw)
  const minute = Number(minuteRaw)
  const period: Period = hour24 < 12 ? '오전' : '오후'
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12

  return { hour: hour12, minute, period }
}

const toTimeValue = (hour: number, minute: number, period: Period) => {
  const hour24 = period === '오전' ? hour % 12 : (hour % 12) + 12

  return `${String(hour24).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
}

type WheelColumnProps = {
  label: string
  items: readonly WheelItem[]
  value: WheelItem
  onChange: (next: WheelItem) => void
  format?: (item: WheelItem) => string
  loop?: boolean
}

function WheelColumn({
  label,
  items,
  value,
  onChange,
  format = (item: WheelItem) => String(item),
  loop = false,
}: WheelColumnProps) {
  const columnRef = useRef<HTMLDivElement>(null)
  const internalChangeRef = useRef(false)
  const settleTimerRef = useRef<number | null>(null)
  const programmaticScrollTimerRef = useRef<number | null>(null)
  const programmaticScrollRef = useRef(false)
  const animationFrameRef = useRef<number | null>(null)

  const dragRef = useRef({
    active: false,
    moved: false,
    pointerId: null as number | null,
    startY: 0,
    startScrollTop: 0,
  })

  const loopCount = loop ? WHEEL_LOOP_COUNT : 1

  const displayItems = useMemo(
    () => Array.from({ length: loopCount }, () => items).flat(),
    [items, loopCount],
  )

  const selectedValueIndex = Math.max(
    0,
    items.findIndex((item) => item === value),
  )

  const initialIndex =
    (loop ? WHEEL_MIDDLE_LOOP * items.length : 0) + selectedValueIndex

  const [selectedIndex, setSelectedIndex] = useState(initialIndex)

  const normalizeIndex = (rawIndex: number) => {
    const positiveIndex =
      ((rawIndex % items.length) + items.length) % items.length
    return positiveIndex
  }

  const setInternalValue = (itemIndex: number) => {
    const nextValue = items[itemIndex]
    if (nextValue === value) return

    internalChangeRef.current = true
    onChange(nextValue)

    window.setTimeout(() => {
      internalChangeRef.current = false
    }, 0)
  }

  const getInitialIndex = (rawIndex: number) => {
    const itemIndex = normalizeIndex(rawIndex)
    return loop ? WHEEL_MIDDLE_LOOP * items.length + itemIndex : itemIndex
  }

  const recenterIfNeeded = (rawIndex: number) => {
    if (!loop || !columnRef.current) return rawIndex

    const minIndex = items.length * 2
    const maxIndex = items.length * (WHEEL_LOOP_COUNT - 2)

    if (rawIndex >= minIndex && rawIndex <= maxIndex) return rawIndex

    const centeredIndex =
      WHEEL_MIDDLE_LOOP * items.length + normalizeIndex(rawIndex)
    columnRef.current.scrollTop = centeredIndex * WHEEL_ITEM_HEIGHT
    setSelectedIndex(centeredIndex)

    return centeredIndex
  }

  const markProgrammaticScroll = () => {
    programmaticScrollRef.current = true

    if (programmaticScrollTimerRef.current) {
      window.clearTimeout(programmaticScrollTimerRef.current)
    }

    programmaticScrollTimerRef.current = window.setTimeout(() => {
      programmaticScrollRef.current = false
      programmaticScrollTimerRef.current = null
    }, PROGRAMMATIC_SCROLL_MS)
  }

  const stopProgrammaticScroll = () => {
    if (animationFrameRef.current) {
      window.cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }

    programmaticScrollRef.current = false

    if (programmaticScrollTimerRef.current) {
      window.clearTimeout(programmaticScrollTimerRef.current)
      programmaticScrollTimerRef.current = null
    }
  }

  const animateToTop = (targetTop: number) => {
    if (!columnRef.current) return

    stopProgrammaticScroll()
    markProgrammaticScroll()

    const startTop = columnRef.current.scrollTop
    const delta = targetTop - startTop
    const startTime = performance.now()

    if (Math.abs(delta) < 1) {
      columnRef.current.scrollTop = targetTop
      stopProgrammaticScroll()
      return
    }

    const tick = (now: number) => {
      if (!columnRef.current) return

      const progress = Math.min(
        1,
        (now - startTime) / PROGRAMMATIC_SCROLL_DURATION,
      )
      columnRef.current.scrollTop = startTop + delta * easeOutCubic(progress)

      if (progress < 1) {
        animationFrameRef.current = window.requestAnimationFrame(tick)
        return
      }

      columnRef.current.scrollTop = targetTop
      setSelectedIndex(Math.round(targetTop / WHEEL_ITEM_HEIGHT))
      stopProgrammaticScroll()
    }

    animationFrameRef.current = window.requestAnimationFrame(tick)
  }

  const moveToIndex = (rawIndex: number, smooth = false) => {
    const nextIndex = loop ? rawIndex : getInitialIndex(rawIndex)
    const itemIndex = normalizeIndex(nextIndex)
    const targetTop = nextIndex * WHEEL_ITEM_HEIGHT

    setSelectedIndex(nextIndex)
    setInternalValue(itemIndex)

    if (!columnRef.current) return

    if (smooth) {
      animateToTop(targetTop)
      return
    }

    stopProgrammaticScroll()
    columnRef.current.scrollTop = targetTop
  }

  const getPointerIndex = (clientY: number) => {
    if (!columnRef.current) return null

    const rect = columnRef.current.getBoundingClientRect()
    const contentY =
      columnRef.current.scrollTop + clientY - rect.top - WHEEL_EDGE_SPACER
    const rawIndex = Math.floor(contentY / WHEEL_ITEM_HEIGHT)

    return Math.min(displayItems.length - 1, Math.max(0, rawIndex))
  }

  const settleToNearest = () => {
    if (!columnRef.current) return

    const rawIndex = Math.round(columnRef.current.scrollTop / WHEEL_ITEM_HEIGHT)
    moveToIndex(recenterIfNeeded(rawIndex), true)
  }

  const scheduleSettle = () => {
    if (settleTimerRef.current) {
      window.clearTimeout(settleTimerRef.current)
    }

    settleTimerRef.current = window.setTimeout(() => {
      settleTimerRef.current = null
      settleToNearest()
    }, WHEEL_SETTLE_DELAY)
  }

  useEffect(() => {
    if (internalChangeRef.current) return
    if (!columnRef.current) return

    const nextIndex = getInitialIndex(selectedValueIndex)
    setSelectedIndex(nextIndex)
    columnRef.current.scrollTop = nextIndex * WHEEL_ITEM_HEIGHT
  }, [items.length, loop, selectedValueIndex])

  useEffect(
    () => () => {
      if (settleTimerRef.current) {
        window.clearTimeout(settleTimerRef.current)
      }

      if (programmaticScrollTimerRef.current) {
        window.clearTimeout(programmaticScrollTimerRef.current)
      }

      if (animationFrameRef.current) {
        window.cancelAnimationFrame(animationFrameRef.current)
      }
    },
    [],
  )

  const handleScroll = (e: UIEvent<HTMLDivElement>) => {
    const rawIndex = Math.round(e.currentTarget.scrollTop / WHEEL_ITEM_HEIGHT)
    const itemIndex = normalizeIndex(rawIndex)

    setSelectedIndex(rawIndex)
    setInternalValue(itemIndex)

    if (!dragRef.current.active && !programmaticScrollRef.current) {
      scheduleSettle()
    }
  }

  const endDrag = () => {
    if (!dragRef.current.active) return

    dragRef.current.active = false
    dragRef.current.pointerId = null
    settleToNearest()
  }

  useEffect(() => {
    const handlePointerEnd = () => endDrag()

    window.addEventListener('pointerup', handlePointerEnd)
    window.addEventListener('pointercancel', handlePointerEnd)
    window.addEventListener('blur', handlePointerEnd)

    return () => {
      window.removeEventListener('pointerup', handlePointerEnd)
      window.removeEventListener('pointercancel', handlePointerEnd)
      window.removeEventListener('blur', handlePointerEnd)
    }
  })

  const handlePointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (!columnRef.current) return

    stopProgrammaticScroll()

    dragRef.current = {
      active: true,
      moved: false,
      pointerId: e.pointerId,
      startY: e.clientY,
      startScrollTop: columnRef.current.scrollTop,
    }

    columnRef.current.setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.active || !columnRef.current) return

    const deltaY = e.clientY - dragRef.current.startY

    if (Math.abs(deltaY) > DRAG_CLICK_THRESHOLD) {
      dragRef.current.moved = true
    }

    columnRef.current.scrollTop = dragRef.current.startScrollTop - deltaY
  }

  const finishDrag = (e: PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.active || !columnRef.current) return

    const wasMoved = dragRef.current.moved
    const clickedIndex = getPointerIndex(e.clientY)

    if (columnRef.current.hasPointerCapture(e.pointerId)) {
      columnRef.current.releasePointerCapture(e.pointerId)
    }

    dragRef.current.active = false
    dragRef.current.pointerId = null

    if (!wasMoved && clickedIndex !== null) {
      moveToIndex(clickedIndex, true)
      return
    }

    settleToNearest()
  }

  const selectIndex = (displayIndex: number) => {
    if (dragRef.current.moved) {
      dragRef.current.moved = false
      return
    }

    const itemIndex = normalizeIndex(displayIndex)

    internalChangeRef.current = true
    onChange(items[itemIndex])

    if (!columnRef.current) {
      window.setTimeout(() => {
        internalChangeRef.current = false
      }, 0)
      return
    }

    const nextIndex = loop ? displayIndex : itemIndex

    setSelectedIndex(nextIndex)
    animateToTop(nextIndex * WHEEL_ITEM_HEIGHT)

    window.setTimeout(() => {
      internalChangeRef.current = false
    }, 0)
  }

  return (
    <div
      ref={columnRef}
      aria-label={label}
      onScroll={handleScroll}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={finishDrag}
      onPointerCancel={finishDrag}
      onLostPointerCapture={endDrag}
      className="relative z-[1] h-[210px] cursor-grab touch-none select-none overflow-y-auto active:cursor-grabbing [&::-webkit-scrollbar]:w-0"
    >
      <div aria-hidden="true" className="h-[84px] shrink-0" />

      {displayItems.map((item, idx) => {
        const selected = selectedIndex === idx

        return (
          <button
            key={`${label}-${idx}-${item}`}
            type="button"
            onClick={() => selectIndex(idx)}
            className={cn(
              'h-[42px] w-full border-0 bg-transparent',
              selected
                ? 'text-16 font-medium text-app-black'
                : 'text-14 font-normal text-app-gray300',
            )}
          >
            {format(item)}
          </button>
        )
      })}

      <div aria-hidden="true" className="h-[84px] shrink-0" />
    </div>
  )
}

export default function TimePickerModal({
  isOpen,
  value,
  onClose,
  onChange,
}: TimePickerModalProps) {
  const valueParts = useMemo(() => toParts(value), [value])

  const [hour, setHour] = useState(valueParts.hour)
  const [minute, setMinute] = useState(valueParts.minute)
  const [period, setPeriod] = useState<Period>(valueParts.period)

  useEffect(() => {
    if (!isOpen) return

    setHour(valueParts.hour)
    setMinute(valueParts.minute)
    setPeriod(valueParts.period)
  }, [isOpen, valueParts.hour, valueParts.minute, valueParts.period])

  const apply = () => {
    onChange(toTimeValue(hour, minute, period))
    onClose()
  }

  return (
    <CustomBaseModal
      isOpen={isOpen}
      onClose={onClose}
      overlayBackgroundColor="transparent"
      overlayZIndex={70}
      className="w-[320px] rounded-[10px] border border-app-gray100"
    >
      <div className="px-3 pb-3 pt-5">
        <div className="relative mb-4 grid h-[210px] grid-cols-[1fr_auto_1fr_1fr] items-center gap-2 overflow-hidden before:pointer-events-none before:absolute before:left-0 before:right-0 before:top-[84px] before:h-[42px] before:rounded-[10px] before:bg-app-gray50 before:content-['']">
          <WheelColumn
            label="시간"
            items={HOURS}
            value={hour}
            onChange={(next) => setHour(Number(next))}
            loop
          />

          <span
            aria-hidden="true"
            className="relative z-[1] text-16 font-medium text-app-black"
          >
            :
          </span>

          <WheelColumn
            label="분"
            items={MINUTES}
            value={minute}
            onChange={(next) => setMinute(Number(next))}
            format={(item) => String(item).padStart(2, '0')}
            loop
          />

          <WheelColumn
            label="오전 오후"
            items={PERIODS}
            value={period}
            onChange={(next) => setPeriod(next as Period)}
          />
        </div>

        <button
          type="button"
          onClick={apply}
          className="h-[50px] w-full rounded-[10px] border-0 bg-app-primary text-15 text-app-black"
        >
          적용
        </button>
      </div>
    </CustomBaseModal>
  )
}
