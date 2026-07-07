import MoveIcon from '@svgs/common/Move.svg?react'
import type { ReactNode } from 'react'

type SummaryCardIconVariant = 'black' | 'orange' | 'blue' | 'mint' | 'red'

type SummaryCardProps = {
  title: string
  count: number
  unit?: string
  icon: ReactNode
  iconVariant: SummaryCardIconVariant
  onClick?: () => void
}

const iconVariantClassName: Record<SummaryCardIconVariant, string> = {
  black: 'bg-app-black/10 text-app-black',
  orange: 'bg-app-orange/10 text-app-orange',
  blue: 'bg-app-blue/10 text-app-blue',
  mint: 'bg-app-mint/10 text-app-mint',
  red: 'bg-app-red/10 text-app-red',
}

export default function SummaryCard({
  title,
  count,
  unit = '건',
  icon,
  iconVariant,
  onClick,
}: SummaryCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full flex-col items-start justify-between gap-5 rounded-xl border border-app-gray100 bg-white p-5 text-left"
    >
      <div className="flex w-full items-center justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-md ${iconVariantClassName[iconVariant]}`}
          >
            {icon}
          </div>

          <span className="truncate text-16 font-medium text-app-black">
            {title}
          </span>
        </div>

        <MoveIcon aria-hidden="true" />
      </div>

      <p className="text-18 font-medium text-app-black">
        {count}
        {unit}
      </p>
    </button>
  )
}
