import Badge from '#/components/Badge'
import CustomTable from '#/components/Table/CustomTable'
import type { ColumnDef } from '#/types/shared.types'
import PersonInCircleIcon from '@svgs/person/PersonInCircle.svg?react'
import PeopleIcon from '@svgs/person/people.svg?react'
import TalkIcon from '@svgs/talk.svg?react'
import { createFileRoute } from '@tanstack/react-router'
import SummaryCard from './-components/SummaryCard'

export const Route = createFileRoute('/_authedLayout/dashboard/')({
  component: RouteComponent,
})

const pendingAcademies = [
  {
    academyName: '이현재',
    owner: '2026 정시 실기반',
    requestedAt: '',
    status: '',
  },
  {
    academyName: '이현재',
    owner: '2026 정시 실기반',
    requestedAt: '',
    status: '',
  },
  {
    academyName: '이현재',
    owner: '2026 정시 실기반',
    requestedAt: '',
    status: '',
  },
]

type PendingAcademy = (typeof pendingAcademies)[number]

const notices = [
  {
    type: '업데이트',
    title: '업데이트함',
  },
  {
    type: '공지',
    title: '학원비 내라',
  },
]

type Notice = (typeof notices)[number]

const pendingAcademyColumns: ColumnDef<PendingAcademy>[] = [
  {
    id: 'academyName',
    header: '학원명',
    accessor: 'academyName',
    flex: 1,
    minWidth: 140,
    nowrap: true,
  },
  {
    id: 'owner',
    header: '대표자',
    accessor: 'owner',
    flex: 1,
    minWidth: 160,
    nowrap: true,
  },
  {
    id: 'requestedAt',
    header: '신청일',
    accessor: 'requestedAt',
    flex: 1,
    minWidth: 160,
    nowrap: true,
  },
  {
    id: 'status',
    header: '진행 상태',
    accessor: 'status',
    flex: 1,
    nowrap: true,
  },
]

const noticeColumns: ColumnDef<Notice>[] = [
  {
    id: 'type',
    header: '유형',
    accessor: 'type',
    flex: 0.35,
    minWidth: 160,
    nowrap: true,
    render: (notice) => <Badge>{notice.type}</Badge>,
  },
  {
    id: 'title',
    header: '제목',
    accessor: 'title',
    flex: 1,
    nowrap: true,
  },
]

function RouteComponent() {
  const summaryCards = [
    {
      id: 'members',
      title: '전체 회원',
      count: 24,
      unit: '개',
      icon: <PersonInCircleIcon />,
      iconVariant: 'black',
    },
    {
      id: 'pending',
      title: '가입 대기',
      count: pendingAcademies.length,
      unit: '건',
      icon: <PeopleIcon />,
      iconVariant: 'orange',
    },
    {
      id: 'notices',
      title: '공지사항',
      count: notices.length,
      unit: '건',
      icon: <TalkIcon />,
      iconVariant: 'blue',
    },
  ] as const

  return (
    <div className="p-6 flex flex-col gap-6">
      <section className="flex flex-col gap-4">
        <div className="flex h-6 items-center">
          <h3 className="text-16 font-medium">전체 현황</h3>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {summaryCards.map((card) => (
            <SummaryCard
              key={card.id}
              title={card.title}
              count={card.count}
              unit={card.unit}
              icon={card.icon}
              iconVariant={card.iconVariant}
            />
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex h-6 items-center gap-3">
          <h3 className="text-16 font-medium">가입 대기</h3>
          <span className="text-16 font-medium text-app-gray500">
            {pendingAcademies.length}건
          </span>
        </div>

        <CustomTable
          columns={pendingAcademyColumns}
          data={pendingAcademies}
          tableInnerMaxWidth={800}
          rowKey={(_, index) => index}
          headerColor="bg-app-white"
        />
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex h-6 items-center gap-3">
          <h3 className="text-16 font-medium">공지사항</h3>
          <span className="text-16 font-medium text-app-gray500">
            {notices.length}건
          </span>
        </div>

        <CustomTable
          columns={noticeColumns}
          data={notices}
          tableInnerMaxWidth={800}
          rowKey={(_, index) => index}
          headerColor="bg-app-white"
        />
      </section>
    </div>
  )
}
