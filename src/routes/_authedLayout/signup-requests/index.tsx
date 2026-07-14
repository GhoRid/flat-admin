import {
  fetchApprovedUserInfoQueryOptions,
  fetchApprovedUserListQueryOptions,
} from '#/apis/api/approvals/approvalsQueryOptions'
import type { SignUpRequestListDTO } from '#/apis/api/approvals/approvals.dto'
import FilterChipTabs from '#/components/FilterChipTabs'
import SearchBar from '#/components/SearchBar'
import { formatPhone, formatToYmd } from '#/utils/format'
import {
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import RequestCard, {
  type RequestFilter,
  type RequestStatus,
  type SignupRequest,
  type StepStatus,
} from './-components/RequestCard'

export const Route = createFileRoute('/_authedLayout/signup-requests/')({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(fetchApprovedUserListQueryOptions()),
  component: RouteComponent,
})

const statusLabels: Record<RequestFilter, string> = {
  all: '전체',
  pending: '검토 전',
  inProgress: '진행 중',
  rejected: '반려',
  approved: '승인',
}

const reviewStatusMap: Record<
  SignUpRequestListDTO['reviewStatus'],
  RequestStatus
> = {
  BEFORE_REVIEW: 'pending',
  IN_REVIEW: 'inProgress',
  REJECTED: 'rejected',
  APPROVED: 'approved',
}

const stepStatusMap: Record<SignUpRequestListDTO['alimtalkStatus'], StepStatus> =
  {
    BEFORE: 'idle',
    IN_PROGRESS: 'progress',
    COMPLETED: 'done',
  }

const mapSignUpRequest = (
  request: SignUpRequestListDTO,
): SignupRequest => ({
  id: request.approvalId,
  name: request.name,
  phoneNumber: formatPhone(request.phoneNumber),
  requestedAt: formatToYmd(request.createdAt),
  status: reviewStatusMap[request.reviewStatus],
  steps: {
    branchInfo: stepStatusMap[request.branchVerifyStatus],
    alimtalk: stepStatusMap[request.alimtalkStatus],
    tossPlace: stepStatusMap[request.tossPlaceStatus],
    tossPayments: stepStatusMap[request.tossPaymentsStatus],
  },
})

function RouteComponent() {
  const queryClient = useQueryClient()
  const [activeFilter, setActiveFilter] = useState<RequestFilter>('all')
  const [keyword, setKeyword] = useState('')
  const { data } = useSuspenseQuery(fetchApprovedUserListQueryOptions())

  const signupRequests = useMemo(() => data.map(mapSignUpRequest), [data])

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
    [signupRequests],
  )

  const filteredRequests = useMemo(() => {
    const trimmedKeyword = keyword.trim().toLowerCase()

    return signupRequests.filter((request) => {
      const filterMatched =
        activeFilter === 'all' || request.status === activeFilter

      if (!filterMatched) return false
      if (trimmedKeyword.length === 0) return true

      return [request.name, request.phoneNumber]
        .join(' ')
        .toLowerCase()
        .includes(trimmedKeyword)
    })
  }, [activeFilter, keyword, signupRequests])

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
            placeholder="이름 또는 연락처로 검색하세요."
          />
        </div>

        <div className="flex flex-col gap-4">
          {filteredRequests.map((request) => (
            <RequestCard
              key={request.id}
              request={request}
              onPrefetch={() => {
                queryClient.prefetchQuery(
                  fetchApprovedUserInfoQueryOptions(request.id),
                )
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
