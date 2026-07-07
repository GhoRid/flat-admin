import CheckIcon from '@svgs/common/Check.svg?react'
import { useEffect, useState } from 'react'

type Align = 'center' | 'left' | 'right'

type OverlayDropdownProps<T> = {
  open: boolean
  items: T[]
  getItemKey: (item: T) => string | number
  getItemLabel: (item: T) => string
  isItemSelected?: (item: T) => boolean
  isItemDisabled?: (item: T) => boolean
  onItemClick: (item: T) => void
  emptyText?: string
  className?: string
  marginTop?: number
  onClose?: () => void
  showBackdrop?: boolean
  menuMaxHeight?: number
  role?: string
  ariaLabel?: string
  align?: Align
  menuWidth?: number | string
  animate?: boolean
  checkIconVisible?: boolean
}

export default function OverlayDropdown<T>({
  open,
  items,
  getItemKey,
  getItemLabel,
  isItemSelected,
  isItemDisabled,
  onItemClick,
  emptyText,
  className,
  marginTop = 10,
  onClose,
  showBackdrop = true,
  menuMaxHeight,
  role,
  ariaLabel,
  align = 'left',
  menuWidth = 'max-content',
  animate = false,
  checkIconVisible = false,
}: OverlayDropdownProps<T>) {
  const [shouldRender, setShouldRender] = useState(open)

  useEffect(() => {
    if (!open || !onClose) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  useEffect(() => {
    if (open) {
      setShouldRender(true)
      return
    }

    if (!animate) {
      setShouldRender(false)
      return
    }

    const timer = window.setTimeout(() => setShouldRender(false), 160)
    return () => window.clearTimeout(timer)
  }, [animate, open])

  if (!shouldRender) return null

  const width = typeof menuWidth === 'number' ? `${menuWidth}px` : menuWidth
  const alignClass =
    align === 'left'
      ? 'left-0'
      : align === 'right'
        ? 'right-0'
        : 'left-1/2 -translate-x-1/2'

  return (
    <>
      {showBackdrop ? (
        <div
          className={[
            'fixed inset-0 z-40 bg-transparent',
            open ? 'pointer-events-auto' : 'pointer-events-none',
          ].join(' ')}
          onClick={open ? onClose : undefined}
        />
      ) : null}
      <div
        className={[
          'absolute z-[60] transition-all duration-150 ease-out',
          open ? 'translate-y-0 opacity-100' : '-translate-y-1.5 opacity-0',
          alignClass,
          className ?? '',
        ].join(' ')}
        style={{ top: `calc(100% + ${marginTop}px)`, width }}
      >
        <div
          className="flex min-w-full flex-col gap-2.5 overflow-x-hidden rounded-[10px] border border-app-gray100 bg-app-white p-2.5 shadow-sm"
          role={role}
          aria-label={ariaLabel}
          style={{
            width: 'max-content',
            maxHeight: menuMaxHeight,
            overflowY: menuMaxHeight === undefined ? undefined : 'auto',
          }}
        >
          {items.length === 0 ? (
            <button
              className="w-full whitespace-nowrap rounded-[10px] bg-app-white p-2.5 text-left text-14 text-app-gray500 opacity-50"
              type="button"
              disabled
            >
              {emptyText}
            </button>
          ) : (
            items.map((item) => {
              const selected = isItemSelected?.(item) ?? false
              const disabled = isItemDisabled?.(item) ?? false

              return (
                <button
                  className={[
                    'flex w-full items-center justify-between rounded-[10px] p-2.5 text-left text-14 font-normal whitespace-nowrap hover:bg-app-gray50',
                    selected
                      ? 'bg-app-gray50 text-app-black'
                      : 'text-app-gray500',
                    disabled ? 'cursor-not-allowed opacity-45' : '',
                  ].join(' ')}
                  key={getItemKey(item)}
                  type="button"
                  onClick={() => {
                    if (disabled) return
                    onItemClick(item)
                  }}
                  role={role === 'listbox' ? 'option' : undefined}
                  aria-selected={role === 'listbox' ? selected : undefined}
                  disabled={disabled}
                >
                  {getItemLabel(item)}
                  {selected && checkIconVisible && <CheckIcon />}
                </button>
              )
            })
          )}
        </div>
      </div>
    </>
  )
}
