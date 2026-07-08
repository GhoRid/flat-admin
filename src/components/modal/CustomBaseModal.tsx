import type { ReactNode } from 'react'
import ReactModal from 'react-modal'

type CustomBaseModalProps = {
  isOpen: boolean
  onClose: () => void
  animated?: boolean
  closeTimeoutMS?: number
  children: ReactNode
  className?: string
  contentRef?: (instance: HTMLDivElement) => void

  overlayBackgroundColor?: string
  overlayZIndex?: number
}

const cn = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(' ')

export default function CustomBaseModal({
  isOpen,
  onClose,
  animated = false,
  closeTimeoutMS,
  children,
  className,
  contentRef,
  overlayBackgroundColor = 'transparent',
  overlayZIndex,
}: CustomBaseModalProps) {
  const resolvedCloseTimeoutMS = closeTimeoutMS ?? (animated ? 180 : 0)

  return (
    <ReactModal
      isOpen={isOpen}
      onRequestClose={onClose}
      closeTimeoutMS={resolvedCloseTimeoutMS}
      ariaHideApp={false}
      contentRef={contentRef}
      className={cn(
        'absolute left-1/2 top-1/2 z-99999999999 rounded-[10px] bg-app-white shadow-[0_2px_20px_rgba(0,0,0,0.03),0_2px_8px_rgba(0,0,0,0.08)] outline-none',
        animated
          ? cn(
              'opacity-0 translate-x-[-50%] translate-y-[-48%] scale-[0.98]',
              'transition-[opacity,transform] duration-180 ease-in-out will-change-[transform,opacity]',
              '[&.ReactModal__Content--after-open]:translate-y-[-50%]',
              '[&.ReactModal__Content--after-open]:scale-100',
              '[&.ReactModal__Content--after-open]:opacity-100',
              '[&.ReactModal__Content--before-close]:translate-y-[-48%]',
              '[&.ReactModal__Content--before-close]:scale-[0.98]',
              '[&.ReactModal__Content--before-close]:opacity-0',
            )
          : 'translate-x-[-50%] translate-y-[-50%] opacity-100 transition-none',
        className,
      )}
      style={{
        overlay: {
          backgroundColor: overlayBackgroundColor,
          zIndex: overlayZIndex,
        },
      }}
    >
      {children}
    </ReactModal>
  )
}
