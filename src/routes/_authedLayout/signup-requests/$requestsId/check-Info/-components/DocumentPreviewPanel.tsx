import type { PointerEvent } from 'react'
import { useEffect, useRef, useState } from 'react'

export type DocumentTab = 'business-license' | 'bankbook-copy'

type DocumentPreviewPanelProps = {
  activeTab: DocumentTab
  onTabChange: (tab: DocumentTab) => void
  businessLicenseFileUrl: string
  bankbookCopyFileUrl: string
}

const DOCUMENT_TABS: Array<{
  label: string
  value: DocumentTab
}> = [
  {
    label: '사업자등록증',
    value: 'business-license',
  },
  {
    label: '통장 사본',
    value: 'bankbook-copy',
  },
]

export default function DocumentPreviewPanel({
  activeTab,
  onTabChange,
  businessLicenseFileUrl,
  bankbookCopyFileUrl,
}: DocumentPreviewPanelProps) {
  const previewRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [dragStart, setDragStart] = useState<{
    pointerId: number
    x: number
    y: number
  } | null>(null)

  const activeFileUrl =
    activeTab === 'business-license'
      ? businessLicenseFileUrl
      : bankbookCopyFileUrl

  useEffect(() => {
    setScale(1)
    setPosition({ x: 0, y: 0 })
    setDragStart(null)
  }, [activeFileUrl])

  useEffect(() => {
    const preview = previewRef.current
    if (!preview) return

    const handleWheel = (event: globalThis.WheelEvent) => {
      event.preventDefault()
      event.stopPropagation()

      if (!activeFileUrl) return

      setScale((prev) => {
        const next = event.deltaY > 0 ? prev - 0.1 : prev + 0.1

        return Math.min(4, Math.max(0.5, Number(next.toFixed(2))))
      })
    }

    preview.addEventListener('wheel', handleWheel, { passive: false })

    return () => {
      preview.removeEventListener('wheel', handleWheel)
    }
  }, [activeFileUrl])

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!activeFileUrl) return

    event.currentTarget.setPointerCapture(event.pointerId)
    setDragStart({
      pointerId: event.pointerId,
      x: event.clientX - position.x,
      y: event.clientY - position.y,
    })
  }

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!dragStart || dragStart.pointerId !== event.pointerId) return

    setPosition({
      x: event.clientX - dragStart.x,
      y: event.clientY - dragStart.y,
    })
  }

  const handlePointerEnd = () => {
    setDragStart(null)
  }

  return (
    <div
      ref={previewRef}
      className="relative flex min-h-170 h-full touch-none flex-col overflow-hidden rounded-2xl bg-app-gray700 p-3"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
    >
      <div
        className="relative z-10 grid h-10 shrink-0 grid-cols-2 rounded-[10px] bg-app-gray100 p-1"
        onPointerDown={(event) => event.stopPropagation()}
      >
        {DOCUMENT_TABS.map((tab) => {
          const isActive = activeTab === tab.value

          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => onTabChange(tab.value)}
              className={[
                'h-full rounded-[10px] text-14 font-normal transition-colors duration-150',
                isActive
                  ? 'bg-white text-app-black'
                  : 'bg-transparent text-app-black',
              ].join(' ')}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      {activeFileUrl && (
        <img
          src={activeFileUrl}
          alt=""
          draggable={false}
          className="absolute left-1/2 top-1/2 max-h-[calc(100%-88px)] max-w-[calc(100%-48px)] select-none object-contain"
          style={{
            transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px)) scale(${scale})`,
            cursor: dragStart ? 'grabbing' : 'grab',
          }}
        />
      )}
    </div>
  )
}
