import CheckIcon from '@svgs/common/Check.svg?react'
import EditIcon from '@svgs/common/Edit.svg?react'

export type CheckListStatus = 'before' | 'progress' | 'done'

export type CheckListItem = {
  id: string
  title: string
  status: CheckListStatus
  onEditClick: () => void
}

type CheckListCardProps = {
  title: string
  status: CheckListStatus
  onEditClick: () => void
}

const STATUS_STYLE: Record<
  CheckListStatus,
  {
    circleClassName: string
    icon: React.ReactNode
  }
> = {
  before: {
    circleClassName: 'bg-app-gray100 text-app-gray500',
    icon: <DotsIcon />,
  },
  progress: {
    circleClassName: 'bg-app-red/10 text-app-red',
    icon: <DotsIcon />,
  },
  done: {
    circleClassName: 'bg-app-primary text-app-black',
    icon: <CheckIcon />,
  },
}

export default function CheckListCard({
  title,
  status,
  onEditClick,
}: CheckListCardProps) {
  const statusStyle = STATUS_STYLE[status]

  return (
    <div className="flex h-16 items-center justify-between rounded-[10px] border border-app-gray100 bg-white px-4">
      <div className="flex min-w-0 items-center gap-3">
        <span
          className={[
            'flex size-6 shrink-0 items-center justify-center rounded-full',
            statusStyle.circleClassName,
          ].join(' ')}
        >
          {statusStyle.icon}
        </span>

        <span className="truncate text-14 font-normal text-app-black">
          {title}
        </span>
      </div>

      <button
        type="button"
        className="flex size-10 shrink-0 items-center justify-center rounded-[10px] border border-app-gray100 text-app-gray300 transition-colors hover:border-app-gray300 hover:text-app-gray500"
        onClick={onEditClick}
      >
        <EditIcon />
      </button>
    </div>
  )
}

function DotsIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="4" cy="8" r="1.3" fill="currentColor" />
      <circle cx="8" cy="8" r="1.3" fill="currentColor" />
      <circle cx="12" cy="8" r="1.3" fill="currentColor" />
    </svg>
  )
}
