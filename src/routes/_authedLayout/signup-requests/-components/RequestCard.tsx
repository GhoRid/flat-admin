import Badge from '#/components/Badge'

export type RequestStatus = 'pending' | 'inProgress' | 'rejected'
export type RequestFilter = 'all' | RequestStatus
export type StepStatus = 'idle' | 'progress' | 'done'

export type SignupRequest = {
  id: number
  academyName: string
  owner: string
  phoneNumber: string
  requestedAt: string
  status: RequestStatus
  steps: {
    branchInfo: StepStatus
    alimtalk: StepStatus
    tossPlace: StepStatus
    tossPayments: StepStatus
  }
}

type RequestCardProps = {
  request: SignupRequest
}

const statusLabel: Record<RequestStatus, string> = {
  pending: '검토 전',
  inProgress: '진행 중',
  rejected: '반려',
}

const createBadgeColors = (color: string) => ({
  color,
  backgroundColor: `color-mix(in srgb, ${color} 10%, transparent)`,
})

const statusBadgeColors: Record<
  RequestStatus,
  { color: string; backgroundColor: string }
> = {
  pending: createBadgeColors('var(--color-app-orange)'),
  inProgress: createBadgeColors('var(--color-app-blue)'),
  rejected: createBadgeColors('var(--color-app-red)'),
}

const stepLabels: Record<keyof SignupRequest['steps'], string> = {
  branchInfo: '지점 정보 확인',
  alimtalk: '알림톡 개설',
  tossPlace: 'Toss Place 등록',
  tossPayments: 'Toss Payments 등록',
}

const stepClassName: Record<StepStatus, string> = {
  idle: 'bg-app-gray50 text-app-gray500',
  progress: 'bg-app-orange/10 text-app-orange',
  done: 'bg-app-green/10 text-app-green',
}

const stepPrefix: Record<StepStatus, string> = {
  idle: '－',
  progress: '··',
  done: '✓',
}

export default function RequestCard({ request }: RequestCardProps) {
  const badgeColors = statusBadgeColors[request.status]

  return (
    <button
      type="button"
      className="flex w-full items-center justify-between rounded-xl border border-app-gray100 bg-white p-6 text-left"

      onClick={() => {
        window.location.href = `/signup-requests/${request.id}`
      }}
    >
      <div className="min-w-0">
        <h4 className="text-16 font-medium text-app-black">
          {request.academyName}
        </h4>

        <div className="mt-3 flex items-center text-14 font-normal text-app-gray500">
          <span>대표자: {request.owner}</span>
          <Divider />
          <span>신청일: {request.requestedAt}</span>
          <Divider />
          <span>연락처: {request.phoneNumber}</span>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {Object.entries(request.steps).map(([key, value]) => (
            <span
              key={key}
              className={`inline-flex h-6 items-center rounded-lg px-2 text-14 font-normal ${stepClassName[value]}`}
            >
              <span className="mr-1">{stepPrefix[value]}</span>
              {stepLabels[key as keyof SignupRequest['steps']]}
            </span>
          ))}
        </div>
      </div>

      <Badge
        color={badgeColors.color}
        backgroundColor={badgeColors.backgroundColor}
      >
        {statusLabel[request.status]}
      </Badge>
    </button>
  )
}

function Divider() {
  return <span className="mx-4 h-3 w-px bg-app-gray100" />
}
