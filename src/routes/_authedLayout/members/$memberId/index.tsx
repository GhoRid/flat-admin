import BreadcrumbNav from '#/components/BreadcrumbNav'
import InfoCard from '#/components/InfoCard'
import UploadField, {
  type UploadState,
} from '#/components/inputSections/UploadField'
import RequestInfoCard from '#/components/RequestInfoCard'
import BillingIcon from '@svgs/billing/Billing.svg?react'
import EditIcon from '@svgs/common/Edit.svg?react'
import PhoneIcon from '@svgs/common/Phone.svg?react'
import PinIcon from '@svgs/common/Pin.svg?react'
import HomeIcon from '@svgs/navigation/Home.svg?react'
import SchoolIcon from '@svgs/navigation/School.svg?react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { fetchUserInfoQueryOptions } from './-queries/fetchUserInfoQueryOptions'

const emptyUploadState: UploadState = {
  file: null,
  error: '',
  isDragging: false,
}

const noop = () => undefined

export const Route = createFileRoute('/_authedLayout/members/$memberId/')({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(
      fetchUserInfoQueryOptions(Number(params.memberId)),
    ),
  component: RouteComponent,
})

function RouteComponent() {
  const { memberId } = Route.useParams()
  const { data: userInfo } = useSuspenseQuery(
    fetchUserInfoQueryOptions(Number(memberId)),
  )
  const academyInfo = [
    {
      id: 'academy',
      icon: <HomeIcon />,
      label: '피스톤 체대입시 북구점',
      // label: userInfo.academyInfo.name,
    },
    {
      id: 'address',
      icon: <PinIcon />,
      label: '광주광역시 북구 서하로 369 샛터코아 6층 피스톤체대입시학원',
      // label: userInfo.academyInfo.address,
    },
    {
      id: 'business-number',
      icon: <SchoolIcon />,
      label: '123-12-12345',
      // label: userInfo.academyInfo.businessNumber,
    },
    {
      id: 'bank-account',
      icon: <BillingIcon />,
      label: '광주은행  123-1234-123456  (이헌재)',
      // label: `${userInfo.academyInfo.bankName} ${userInfo.academyInfo.bankAccountNumber} (${userInfo.academyInfo.accountHolder})`,
    },
  ]
  const vanInfo = [
    {
      id: 'van-name',
      icon: <HomeIcon />,
      label: '투리버스',
      // label: userInfo.vanAgencyInfo?.name ?? '-',
    },
    {
      id: 'van-phone',
      icon: <PhoneIcon />,
      label: '010-1234-5678',
      // label: userInfo.vanAgencyInfo?.phoneNumber ?? '-',
    },
  ]

  return (
    <div className="flex flex-col gap-6 p-6">
      <BreadcrumbNav items={[{ label: '회원 관리' }, { label: '회원 상세' }]} />

      <main className="mx-auto w-full max-w-200 gap-4 flex flex-col ">
        <div className="flex justify-end">
          <button
            type="button"
            // onClick={handleEdit}
            className="inline-flex h-8 items-center gap-1 rounded-[10px] bg-app-primary px-3 text-14 font-normal text-app-black"
          >
            <EditIcon />
            회원 정보 수정
          </button>
        </div>

        <div className="flex flex-col gap-8">
          <RequestInfoCard />

          <div className="flex flex-col gap-4">
            <p className="text-14 font-medium text-app-gray500">기본 서류</p>

            <div className="flex flex-col gap-2">
              <UploadField
                value={emptyUploadState}
                label="사업자등록증"
                readOnly
                fileName={userInfo.businessLicense?.fileName}
                fileUrl={userInfo.businessLicense?.fileUrl}
                onChange={noop}
                onDragChange={noop}
              />

              <UploadField
                value={emptyUploadState}
                label="통장 사본"
                readOnly
                fileName={userInfo.bankbookCopy?.fileName}
                fileUrl={userInfo.bankbookCopy?.fileUrl}
                onChange={noop}
                onDragChange={noop}
              />
            </div>
          </div>

          <InfoCard title="학원 정보" items={academyInfo} />

          <InfoCard title="VAN 대리점 정보" items={vanInfo} />
        </div>
      </main>
    </div>
  )
}
