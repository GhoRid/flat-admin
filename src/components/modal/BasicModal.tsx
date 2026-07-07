import CancelIcon from '@svgs/common/Cancel.svg?react'
import type { CSSProperties, ReactNode } from 'react'
import CustomBaseModal from './CustomBaseModal'

export type ModalAction = {
  label?: string
  onClick?: () => void
  disabled?: boolean

  /** 버튼 스타일 커스텀 */
  bg?: string
  color?: string
  hoverBg?: string
}

export type BasicModalProps = {
  isOpen: boolean
  onClose: () => void

  title: string
  description: ReactNode | string

  closeButtonVisible?: boolean
  closeTimeoutMS?: number

  actions?: [ModalAction] | [ModalAction, ModalAction]
}

const cn = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(' ')

export default function BasicModal({
  isOpen,
  onClose,
  title,
  description,
  closeButtonVisible = true,
  closeTimeoutMS = 180,
  actions,
}: BasicModalProps) {
  const resolvedActions: [ModalAction] | [ModalAction, ModalAction] =
    actions ?? [
      {
        label: '확인',
        onClick: onClose,
      },
    ]

  const isTwo = resolvedActions.length === 2

  return (
    <CustomBaseModal
      isOpen={isOpen}
      onClose={onClose}
      closeTimeoutMS={closeTimeoutMS}
      overlayZIndex={99999999998}
    >
      <div className="flex h-[280px] w-[440px] flex-col justify-between p-5">
        <div className="relative flex items-center justify-center">
          <p className="text-18 font-medium">{title}</p>

          {closeButtonVisible && (
            <button
              type="button"
              onClick={onClose}
              aria-label="닫기"
              className="absolute right-0 top-0"
            >
              <CancelIcon />
            </button>
          )}
        </div>

        <div className="text-center">
          <div className="whitespace-pre-wrap text-15 leading-[1.5]">
            {description ?? ' '}
          </div>
        </div>

        <div
          className={cn('grid gap-2.5', isTwo ? 'grid-cols-2' : 'grid-cols-1')}
        >
          {resolvedActions.map((action, idx) => {
            const customStyle = {
              '--modal-action-bg': action.bg ?? '#e0ff00',
              '--modal-action-color': action.color ?? '#191919',
              '--modal-action-hover-bg':
                action.hoverBg ?? action.bg ?? '#e0ff00',
            } as CSSProperties

            return (
              <button
                key={`${action.label}-${idx}`}
                type="button"
                disabled={action.disabled}
                style={customStyle}
                onClick={() => (action.onClick ? action.onClick() : onClose())}
                className={cn(
                  'h-14 rounded-[14px] border-0 text-16 font-medium transition-opacity duration-150',
                  'bg-[var(--modal-action-bg)] text-[var(--modal-action-color)]',
                  'enabled:cursor-pointer enabled:hover:bg-[var(--modal-action-hover-bg)] enabled:hover:opacity-92',
                  'disabled:cursor-not-allowed disabled:bg-app-gray50 disabled:text-app-gray500 disabled:opacity-100',
                )}
              >
                {action.label ?? '확인'}
              </button>
            )
          })}
        </div>
      </div>
    </CustomBaseModal>
  )
}
