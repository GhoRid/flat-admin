import BreadcrumbNav from '#/components/BreadcrumbNav'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import type { Dispatch, SetStateAction } from 'react'
import { useState } from 'react'
import UploadField, {
  type UploadState,
} from '../../../../components/inputSections/UploadField'
import RequestInfoCard from '../../../../components/RequestInfoCard'
import CheckListCard, { type CheckListItem } from './-components/CheckListCard'
import StepModal, { type StepStatus } from './-components/StepModal'

export const Route = createFileRoute(
  '/_authedLayout/signup-requests/$requestsId/',
)({
  component: RouteComponent,
})

type EditableStepId = 'kakao-channel' | 'toss-place' | 'toss-payments'

function RouteComponent() {
  const navigate = useNavigate()
  const { requestsId } = Route.useParams()

  const [isSubmitted, setIsSubmitted] = useState(false)
  const [memo, setMemo] = useState('')
  const [activeStepId, setActiveStepId] = useState<EditableStepId | null>(null)

  const [stepStatuses, setStepStatuses] = useState<
    Record<EditableStepId, StepStatus>
  >({
    'kakao-channel': 'progress',
    'toss-place': 'before',
    'toss-payments': 'before',
  })

  const [businessLicenseFile, setBusinessLicenseFile] = useState<UploadState>({
    file: null,
    error: '',
    isDragging: false,
  })

  const [bankbookCopyFile, setBankbookCopyFile] = useState<UploadState>({
    file: null,
    error: '',
    isDragging: false,
  })

  const [etcFile, setEtcFile] = useState<UploadState>({
    file: null,
    error: '',
    isDragging: false,
  })

  const checkListItems = [
    {
      id: 'branch-info',
      title: '지점 정보 확인',
      status: 'done',
      onEditClick: () => {
        navigate({
          to: '/signup-requests/$requestsId/check-Info',
          params: {
            requestsId,
          },
        })
      },
    },
    {
      id: 'kakao-channel',
      title: '알림톡 개설',
      status: stepStatuses['kakao-channel'],
      onEditClick: () => {
        setActiveStepId('kakao-channel')
      },
    },
    {
      id: 'toss-place',
      title: 'Toss Place 등록',
      status: stepStatuses['toss-place'],
      onEditClick: () => {
        setActiveStepId('toss-place')
      },
    },
    {
      id: 'toss-payments',
      title: 'Toss Payments 등록',
      status: stepStatuses['toss-payments'],
      onEditClick: () => {
        setActiveStepId('toss-payments')
      },
    },
  ] satisfies CheckListItem[]

  const activeStepItem = checkListItems.find((item) => item.id === activeStepId)

  const updateFile =
    (setter: Dispatch<SetStateAction<UploadState>>) =>
    (file: File | null, error = '') => {
      setter((prev) => ({
        ...prev,
        file,
        error,
      }))
    }

  const updateDragging =
    (setter: Dispatch<SetStateAction<UploadState>>) =>
    (isDragging: boolean) => {
      setter((prev) => ({
        ...prev,
        isDragging,
      }))
    }

  const handleSubmit = () => {
    setIsSubmitted(true)

    const hasRequiredFileError =
      !businessLicenseFile.file || !bankbookCopyFile.file

    const hasUploadError =
      businessLicenseFile.error || bankbookCopyFile.error || etcFile.error

    if (hasRequiredFileError || hasUploadError) {
      return
    }

    // TODO: 승인 / 저장 API 호출
    // businessLicenseFile.file
    // bankbookCopyFile.file
    // etcFile.file
    // memo
  }

  return (
    <>
      <div className="flex flex-col gap-6 p-6">
        <BreadcrumbNav
          items={[{ label: '가입 신청 관리' }, { label: '신청 상세' }]}
        />

        <div className="mx-auto flex w-full max-w-200 flex-col gap-8">
          <RequestInfoCard />

          <div className="flex flex-col gap-4">
            <p className="text-14 font-medium text-app-gray500">제출 서류</p>

            <div className="flex flex-col gap-2">
              <UploadField
                value={businessLicenseFile}
                label="사업자등록증"
                required
                onChange={updateFile(setBusinessLicenseFile)}
                onDragChange={updateDragging(setBusinessLicenseFile)}
              />

              <UploadField
                value={bankbookCopyFile}
                label="통장 사본"
                required
                onChange={updateFile(setBankbookCopyFile)}
                onDragChange={updateDragging(setBankbookCopyFile)}
              />

              <div className="my-2 w-full border-t border-app-gray100" />

              <UploadField
                value={etcFile}
                onChange={updateFile(setEtcFile)}
                onDragChange={updateDragging(setEtcFile)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <p className="text-14 font-medium text-app-gray500">
              승인 진행 체크리스트
            </p>

            <div className="flex flex-col gap-2">
              {checkListItems.map((item) => (
                <CheckListCard
                  key={item.id}
                  title={item.title}
                  status={item.status}
                  onEditClick={item.onEditClick}
                />
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <p className="text-14 font-medium text-app-gray500">비고</p>

            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="특이 사항을 입력해주세요."
              className="h-20 w-full resize-none whitespace-pre-wrap rounded-[10px] border border-app-gray100 bg-white p-4 text-14 leading-normal text-app-black outline-none placeholder:text-app-gray300 focus:border-app-black"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              className="h-11 rounded-[10px] bg-app-primary px-6 text-14 font-medium text-app-black"
              onClick={handleSubmit}
            >
              저장하기
            </button>
          </div>
        </div>
      </div>

      {activeStepItem && activeStepId && (
        <StepModal
          isOpen
          title={activeStepItem.title}
          status={stepStatuses[activeStepId]}
          onClose={() => setActiveStepId(null)}
          onStatusChange={(status) => {
            setStepStatuses((prev) => ({
              ...prev,
              [activeStepId]: status,
            }))
          }}
        />
      )}
    </>
  )
}
