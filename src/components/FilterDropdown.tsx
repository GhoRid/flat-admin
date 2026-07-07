import FilterIcon from '@svgs/common/Filter.svg?react'
import type { ReactNode } from 'react'
import { useEffect, useMemo, useState } from 'react'
import OverlayDropdown from './OverlayDropdown'

export type FilterOption<T> = {
  value: T
  label: string
  disabled?: boolean
}

type Align = 'center' | 'left' | 'right'

type FilterDropdownProps<T> = {
  /** controlled */
  value?: T
  /** uncontrolled */
  defaultValue?: T

  onChange?: (next: T) => void

  options: FilterOption<T>[]

  placeholder?: string
  disabled?: boolean
  className?: string

  /** 아이콘 커스텀 */
  icon?: ReactNode

  /** "선택 안함" 상태일 때 isOn 판단 기준 */
  offValue?: T

  /** offValue 대신, 직접 켜짐 여부를 제어하고 싶을 때 */
  isOn?: (selected: T | undefined) => boolean

  /** 메뉴 정렬 */
  align?: Align

  /** 메뉴 너비 (기본: 내용 기준) */
  menuWidth?: number | string

  /** 메뉴 위쪽 간격 */
  menuGap?: number

  /** 접근성 라벨 */
  ariaLabel?: string
}

const cn = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(' ')

export default function FilterDropdown<T>({
  value,
  defaultValue,
  onChange,
  options,
  placeholder = '전체',
  disabled = false,
  className,
  icon,
  offValue,
  isOn,
  align = 'right',
  menuWidth = 'max-content',
  menuGap = 10,
  ariaLabel = '필터',
}: FilterDropdownProps<T>) {
  const isControlled = value !== undefined

  const [innerValue, setInnerValue] = useState<T | undefined>(
    isControlled ? value : defaultValue,
  )

  const selected = isControlled ? value : innerValue

  const selectedLabel = useMemo(() => {
    const found = options.find((o) => o.value === selected)
    return found?.label ?? ''
  }, [options, selected])

  const isActive = useMemo(() => {
    if (isOn) return isOn(selected)
    if (offValue !== undefined) return selected !== offValue
    return false
  }, [isOn, offValue, selected])

  const [open, setOpen] = useState(false)

  const close = () => setOpen(false)

  const select = (next: T) => {
    if (!isControlled) setInnerValue(next)
    onChange?.(next)
    close()
  }

  useEffect(() => {
    if (!isControlled) return
    setInnerValue(value)
  }, [isControlled, value])

  const active = isActive || open

  return (
    <div className={cn('relative h-full', className)}>
      <button
        type="button"
        onClick={() => !disabled && setOpen((v) => !v)}
        disabled={disabled}
        aria-label={ariaLabel}
        aria-haspopup="menu"
        aria-expanded={open}
        className={cn(
          'relative z-[41] flex h-full items-center gap-[3px] rounded-full border px-2.5 transition-all duration-150 select-none',
          'disabled:cursor-not-allowed disabled:opacity-60',
          'enabled:cursor-pointer enabled:hover:border-app-gray50 enabled:hover:bg-app-gray50 enabled:hover:text-app-black',
          '[&_span]:text-14',
          active
            ? 'border-app-gray50 bg-app-gray50 text-app-black'
            : 'border-app-gray100 bg-app-white text-app-gray300',
        )}
      >
        {icon ?? <FilterIcon aria-hidden="true" />}
        <span>{selectedLabel || placeholder}</span>
      </button>

      <OverlayDropdown
        open={open}
        items={options}
        getItemKey={(item) => item.label}
        getItemLabel={(item) => item.label}
        isItemSelected={(item) => item.value === selected}
        isItemDisabled={(item) => item.disabled ?? false}
        onItemClick={(item) => select(item.value)}
        onClose={close}
        marginTop={menuGap}
        role="menu"
        ariaLabel={ariaLabel}
        align={align}
        menuWidth={menuWidth}
        animate
      />
    </div>
  )
}
