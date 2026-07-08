import BreadcrumbNav from '#/components/BreadcrumbNav'
import { createFileRoute } from '@tanstack/react-router'
import RequestInfoCard from './-components/RequestInfoCard'

export const Route = createFileRoute(
  '/_authedLayout/signup-requests/$requestsId/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="p-6 flex flex-col gap-6">
      <BreadcrumbNav
        items={[{ label: '가입 신청 관리' }, { label: '신청 상세' }]}
      />

      <div className="max-w-200 flex mx-auto w-full">
        <RequestInfoCard />
      </div>
    </div>
  )
}
