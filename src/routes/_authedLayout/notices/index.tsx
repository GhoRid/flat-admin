import { fetchNoticesList } from '#/apis/api/notices/notices'
import FilterChipTabs, { type FilterTabItem } from '#/components/FilterChipTabs'
import SearchBar from '#/components/SearchBar'
import PluseIcon from '@svgs/common/Plus.svg?react'
import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import EditNoticeModal, {
  type NoticeFormValues,
} from './-components/EditNoticeModal'
import NoticeRow, {
  type Notice,
  type NoticeType,
} from './-components/NoticeRow'

const fetchNoticesListQueryOptions = () =>
  queryOptions({
    queryKey: ['noticesList'],
    queryFn: async () => fetchNoticesList(),
    select: (res) => res.data,
  })

export const Route = createFileRoute('/_authedLayout/notices/')({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(fetchNoticesListQueryOptions()),
  component: RouteComponent,
})

type NoticeFilter = 'all' | NoticeType
type NoticeWithContent = Notice & {
  content?: string
}

const DEFAULT_NOTICE_FORM_VALUES: NoticeFormValues = {
  type: 'notice',
  title: '',
  content: '',
}

const INITIAL_NOTICES: NoticeWithContent[] = [
  {
    id: 1,
    type: 'notice',
    title: '학원비 내려',
    createdAt: '2026-06-24',
    isImportant: true,
  },
  {
    id: 2,
    type: 'inspection',
    title: '점검 알림',
    createdAt: '2026-06-24',
  },
  {
    id: 3,
    type: 'notice',
    title: '점검 알림',
    createdAt: '2026-06-24',
  },
  {
    id: 4,
    type: 'update',
    title: '점검 알림',
    createdAt: '2026-06-24',
  },
]

const FILTER_TABS: FilterTabItem<NoticeFilter>[] = [
  {
    value: 'notice',
    label: '공지',
    count: 70,
  },
  {
    value: 'inspection',
    label: '점검',
    count: 3,
  },
  {
    value: 'update',
    label: '업데이트',
    count: 11,
  },
  {
    value: 'all',
    label: '전체',
    count: 84,
  },
]

function RouteComponent() {
  const [notices, setNotices] = useState(INITIAL_NOTICES)
  const [activeTab, setActiveTab] = useState<NoticeFilter>('notice')
  const [keyword, setKeyword] = useState('')
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingNoticeId, setEditingNoticeId] = useState<number | null>(null)

  useSuspenseQuery(fetchNoticesListQueryOptions())

  const noticeForm = useForm<NoticeFormValues>({
    mode: 'onSubmit',
    defaultValues: DEFAULT_NOTICE_FORM_VALUES,
  })

  const filteredNotices = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase()

    return notices.filter((notice) => {
      const matchesTab = activeTab === 'all' || notice.type === activeTab

      const matchesKeyword =
        normalizedKeyword.length === 0 ||
        notice.title.toLowerCase().includes(normalizedKeyword)

      return matchesTab && matchesKeyword
    })
  }, [activeTab, keyword, notices])

  const handleCreate = () => {
    setEditingNoticeId(null)
    noticeForm.reset(DEFAULT_NOTICE_FORM_VALUES)
    setIsEditModalOpen(true)
  }

  const handleEdit = (noticeId: number) => {
    const notice = notices.find((item) => item.id === noticeId)

    if (!notice) return

    setEditingNoticeId(noticeId)
    noticeForm.reset({
      type: notice.type,
      title: notice.title,
      content: notice.content ?? '',
    })
    setIsEditModalOpen(true)
  }

  const handleDelete = (noticeId: number) => {
    setNotices((previous) =>
      previous.filter((notice) => notice.id !== noticeId),
    )
  }

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false)
  }

  const handleSubmitNotice = (values: NoticeFormValues) => {
    const nextValues = {
      type: values.type,
      title: values.title.trim(),
      content: values.content.trim(),
    }

    setNotices((previous) => {
      if (editingNoticeId !== null) {
        return previous.map((notice) =>
          notice.id === editingNoticeId ? { ...notice, ...nextValues } : notice,
        )
      }

      const nextId = Math.max(0, ...previous.map((notice) => notice.id)) + 1

      return [
        {
          id: nextId,
          createdAt: new Date().toISOString().slice(0, 10),
          ...nextValues,
        },
        ...previous,
      ]
    })

    setIsEditModalOpen(false)
  }

  return (
    <>
      <div className="flex flex-col gap-6 p-6">
        <div className="flex h-8 items-center justify-between">
          <h3 className="text-18 font-medium text-app-black">공지사항 관리</h3>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-6">
            <FilterChipTabs
              tabs={FILTER_TABS}
              activeTab={activeTab}
              onChange={setActiveTab}
              showAll
              allFirst={false}
              allValue="all"
            />

            <div className="flex h-8 min-w-0 flex-1 items-center justify-end gap-2">
              <div className="h-full w-full max-w-100">
                <SearchBar
                  value={keyword}
                  onChange={setKeyword}
                  onSearch={setKeyword}
                  placeholder="검색어를 입력해주세요."
                />
              </div>

              <button
                type="button"
                onClick={handleCreate}
                className="inline-flex h-full shrink-0 items-center gap-1 rounded-[20px] bg-app-primary px-2.5 text-14 font-normal text-app-black transition-opacity hover:opacity-85"
              >
                <PluseIcon />
                <span>새 공지 작성</span>
              </button>
            </div>
          </div>

          <div className="overflow-hidden rounded-[20px] border border-app-gray100 bg-app-white">
            {filteredNotices.length > 0 ? (
              filteredNotices.map((notice, index) => (
                <NoticeRow
                  key={notice.id}
                  notice={notice}
                  hasBorder={index < filteredNotices.length - 1}
                  onEdit={() => handleEdit(notice.id)}
                  onDelete={() => handleDelete(notice.id)}
                />
              ))
            ) : (
              <div className="flex h-40 items-center justify-center text-14 text-app-gray500">
                검색 결과가 없습니다.
              </div>
            )}
          </div>
        </div>
      </div>

      <FormProvider {...noticeForm}>
        <EditNoticeModal
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          onSubmit={handleSubmitNotice}
          title={editingNoticeId === null ? '공지사항 작성' : '공지사항 수정'}
        />
      </FormProvider>
    </>
  )
}
