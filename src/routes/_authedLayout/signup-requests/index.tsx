import FilterChipTabs from '#/components/FilterChipTabs'
import SearchBar from '#/components/SearchBar'
import { createFileRoute } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import RequestCard, {
  type RequestFilter,
  type SignupRequest,
} from './-components/RequestCard'

export const Route = createFileRoute('/_authedLayout/signup-requests/')({
  component: RouteComponent,
})

const signupRequests: SignupRequest[] = [
  {
    id: 1,
    academyName: '피스톤 체대입시 북구점',
    owner: '이현재',
    phoneNumber: '010-1234-5678',
    requestedAt: '2026-01-01',
    status: 'pending',
    steps: {
      branchInfo: 'idle',
      alimtalk: 'idle',
      tossPlace: 'idle',
      tossPayments: 'idle',
    },
  },
  {
    id: 2,
    academyName: '피스톤 체대입시 북구점',
    owner: '이현재',
    phoneNumber: '010-1234-5678',
    requestedAt: '2026-01-01',
    status: 'inProgress',
    steps: {
      branchInfo: 'done',
      alimtalk: 'progress',
      tossPlace: 'idle',
      tossPayments: 'idle',
    },
  },
  {
    id: 3,
    academyName: '피스톤 체대입시 북구점',
    owner: '이현재',
    phoneNumber: '010-1234-5678',
    requestedAt: '2026-01-01',
    status: 'rejected',
    steps: {
      branchInfo: 'idle',
      alimtalk: 'idle',
      tossPlace: 'idle',
      tossPayments: 'idle',
    },
  },
  {
    id: 4,
    academyName: '플랫 아카데미',
    owner: '김대표',
    phoneNumber: '010-2345-6789',
    requestedAt: '2026-01-03',
    status: 'pending',
    steps: {
      branchInfo: 'idle',
      alimtalk: 'idle',
      tossPlace: 'idle',
      tossPayments: 'idle',
    },
  },
  {
    id: 5,
    academyName: '스포츠 입시 센터',
    owner: '박대표',
    phoneNumber: '010-3456-7890',
    requestedAt: '2026-01-05',
    status: 'inProgress',
    steps: {
      branchInfo: 'done',
      alimtalk: 'done',
      tossPlace: 'progress',
      tossPayments: 'idle',
    },
  },
]

const statusLabels: Record<RequestFilter, string> = {
  all: '전체',
  pending: '검토 전',
  inProgress: '진행 중',
  rejected: '반려',
}

function RouteComponent() {
  const [activeFilter, setActiveFilter] = useState<RequestFilter>('all')
  const [keyword, setKeyword] = useState('')

  const tabs = useMemo(
    () =>
      (Object.keys(statusLabels) as RequestFilter[]).map((value) => ({
        value,
        label: statusLabels[value],
        count:
          value === 'all'
            ? signupRequests.length
            : signupRequests.filter((request) => request.status === value)
                .length,
      })),
    [],
  )

  const filteredRequests = useMemo(() => {
    const trimmedKeyword = keyword.trim().toLowerCase()

    return signupRequests.filter((request) => {
      const filterMatched =
        activeFilter === 'all' || request.status === activeFilter

      if (!filterMatched) return false
      if (trimmedKeyword.length === 0) return true

      return [request.academyName, request.owner, request.phoneNumber]
        .join(' ')
        .toLowerCase()
        .includes(trimmedKeyword)
    })
  }, [activeFilter, keyword])

  return (
    <div className="flex flex-col gap-6 p-6">
      <h3 className="text-18 font-medium text-app-black">가입 신청 관리</h3>

      <div className="flex flex-col gap-4">
        <div className="flex h-8 items-center justify-between">
          <FilterChipTabs
            tabs={tabs}
            activeTab={activeFilter}
            onChange={setActiveFilter}
            allFirst
          />

          <SearchBar
            value={keyword}
            onChange={setKeyword}
            placeholder="학원명 또는 대표자명으로 검색하세요."
          />
        </div>

        <div className="flex flex-col gap-4">
          {filteredRequests.map((request) => (
            <RequestCard key={request.id} request={request} />
          ))}
        </div>
      </div>
    </div>
  )
}
