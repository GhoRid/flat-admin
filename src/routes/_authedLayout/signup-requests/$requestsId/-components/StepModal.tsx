import CustomBaseModal from '#/components/modal/CustomBaseModal'
import CancelIcon from '@svgs/common/Cancel.svg?react'
import type { CSSProperties } from 'react'
import { useEffect, useState } from 'react'

export type StepStatus = 'before' | 'progress' | 'done'

export type ModalAction = {
  label?: string
  onClick?: () => void
  disabled?: boolean
  bg?: string
  color?: string
  hoverBg?: string
}

type StepModalProps = {
  isOpen: boolean
  onClose: () => void

  title: string
  status: StepStatus
  onStatusChange: (status: StepStatus) => void

  closeButtonVisible?: boolean
  closeTimeoutMS?: number

  actions?: [ModalAction] | [ModalAction, ModalAction]
}

const STEP_OPTIONS: Array<{
  label: string
  value: StepStatus
}> = [
  {
    label: '진행 전',
    value: 'before',
  },
  {
    label: '진행 중',
    value: 'progress',
  },
  {
    label: '완료',
    value: 'done',
  },
]

const ACTIVE_STEP_CLASS: Record<StepStatus, string> = {
  before: 'border-app-gray100 bg-app-gray50 text-app-black',
  progress: 'border-app-red/10 bg-app-red/10 text-app-red',
  done: 'border-app-primary bg-app-primary text-app-black',
}

const cn = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(' ')

export default function StepModal({
  isOpen,
  onClose,
  title,
  status,
  onStatusChange,
  closeButtonVisible = true,
  closeTimeoutMS = 180,
  actions,
}: StepModalProps) {
  const [draftStatus, setDraftStatus] = useState(status)

  useEffect(() => {
    setDraftStatus(status)
  }, [status, isOpen])

  const resolvedActions: [ModalAction] | [ModalAction, ModalAction] =
    actions ?? [
      {
        label: '취소',
        onClick: onClose,
        bg: '#f5f5f5',
        color: '#191919',
      },
      {
        label: '저장',
        onClick: () => {
          onStatusChange(draftStatus)
          onClose()
        },
        bg: '#e0ff00',
        color: '#191919',
      },
    ]

  const isTwo = resolvedActions.length === 2

  return (
    <CustomBaseModal
      isOpen={isOpen}
      onClose={onClose}
      closeTimeoutMS={closeTimeoutMS}
      overlayZIndex={99999999998}
      overlayBackgroundColor="rgba(0, 0, 0, 0.35)"
    >
      <div className="flex w-137 flex-col gap-8 p-5">
        <div className="relative flex h-10 items-center justify-center">
          <p className="text-20 font-semibold text-app-black">{title}</p>

          {closeButtonVisible && (
            <button
              type="button"
              onClick={onClose}
              aria-label="닫기"
              className="absolute right-0 top-1/2 -translate-y-1/2"
            >
              <CancelIcon />
            </button>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-16 font-medium text-app-gray500">상태</p>

          <div className="flex gap-2">
            {STEP_OPTIONS.map((option) => {
              const isActive = draftStatus === option.value

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setDraftStatus(option.value)}
                  className={cn(
                    'h-9 rounded-[10px] border px-4 text-15 font-medium transition-colors duration-150',
                    isActive
                      ? ACTIVE_STEP_CLASS[option.value]
                      : 'border-app-gray100 bg-white text-app-gray300',
                  )}
                >
                  {option.label}
                </button>
              )
            })}
          </div>
        </div>

        <div
          className={cn('grid gap-2.5', isTwo ? 'grid-cols-2' : 'grid-cols-1')}
        >
          {resolvedActions.map((action, idx) => {
            const customStyle = {
              '--modal-action-bg': action.bg ?? 'var(--color-app-primary)',
              '--modal-action-color': action.color ?? 'var(--color-app-black)',
              '--modal-action-hover-bg':
                action.hoverBg ?? action.bg ?? 'var(--color-app-primary)',
            } as CSSProperties

            return (
              <button
                key={`${action.label}-${idx}`}
                type="button"
                disabled={action.disabled}
                style={customStyle}
                onClick={() => (action.onClick ? action.onClick() : onClose())}
                className={cn(
                  'h-12.5 rounded-[10px] border-0 text-16 font-medium transition-opacity duration-150',
                  'bg-(--modal-action-bg) text-(--modal-action-color)',
                  'enabled:cursor-pointer enabled:hover:bg-(--modal-action-hover-bg)enabled:hover:opacity-92',
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
