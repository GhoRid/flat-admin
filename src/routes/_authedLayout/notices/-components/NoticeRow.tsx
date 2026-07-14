import Badge from '#/components/Badge'
import { hexToRgba } from '#/utils/style'
import EditIcon from '@svgs/common/Edit.svg?react'
import TrashIcon from '@svgs/common/Trash.svg?react'

export type NoticeType = 'notice' | 'inspection' | 'update'

export type Notice = {
  id: number
  type: NoticeType
  title: string
  createdAt: string
  isImportant?: boolean
}

type NoticeRowProps = {
  notice: Notice
  hasBorder: boolean
  onEdit: () => void
  onDelete: () => void
}

const NOTICE_TYPE_LABEL: Record<NoticeType, string> = {
  notice: '공지',
  inspection: '점검',
  update: '업데이트',
}

const NOTICE_BADGE_COLORS: Record<
  NoticeType,
  { color: string; backgroundColor: string }
> = {
  notice: {
    color: 'var(--color-app-gray700)',
    backgroundColor: 'var(--color-app-gray50)',
  },
  inspection: {
    color: 'var(--color-app-orange)',
    backgroundColor: hexToRgba('#ff8a3d', 0.1),
  },
  update: {
    color: 'var(--color-app-blue)',
    backgroundColor: hexToRgba('#4f84ff', 0.1),
  },
}

export default function NoticeRow({
  notice,
  hasBorder,
  onEdit,
  onDelete,
}: NoticeRowProps) {
  const badgeColors =
    notice.type === 'notice' && notice.isImportant
      ? {
          color: 'var(--color-app-black)',
          backgroundColor: 'var(--color-app-primary)',
        }
      : NOTICE_BADGE_COLORS[notice.type]

  return (
    <div
      className={[
        'flex items-center gap-6 p-5',
        hasBorder ? 'border-b border-app-gray100' : '',
      ].join(' ')}
    >
      <div className="flex min-w-0 flex-1 items-center gap-4">
        <Badge
          color={badgeColors.color}
          backgroundColor={badgeColors.backgroundColor}
          height={25}
          padding="0 8px"
          borderRadius={10}
          fontWeight={400}
        >
          {NOTICE_TYPE_LABEL[notice.type]}
        </Badge>

        <span className="min-w-0 truncate text-15 text-app-gray700">
          {notice.title}
        </span>
      </div>

      <time className="shrink-0 text-14 text-app-gray500">
        {notice.createdAt}
      </time>

      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={onEdit}
          aria-label={`${notice.title} 수정`}
          className="flex size-10 items-center justify-center rounded-[10px] border border-app-gray100 text-app-gray300 transition-colors hover:bg-app-gray50 hover:text-app-black"
        >
          <EditIcon />
        </button>

        <button
          type="button"
          onClick={onDelete}
          aria-label={`${notice.title} 삭제`}
          className="flex size-10 items-center justify-center rounded-[10px] border border-app-gray100 text-app-gray300 transition-colors hover:bg-app-red10 hover:text-app-red"
        >
          <TrashIcon />
        </button>
      </div>
    </div>
  )
}
