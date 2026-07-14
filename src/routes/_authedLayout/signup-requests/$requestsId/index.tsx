import {
  updateAlimtalkStatus,
  updateApprovalDocuments,
  updateTossPaymentsStatus,
  updateTossPlaceStatus,
} from '#/apis/api/approvals/approvals'
import type {
  SignUpRequestDetailDTO,
  STEP,
} from '#/apis/api/approvals/approvals.dto'
import { fetchApprovedUserInfoQueryOptions } from '#/apis/api/approvals/approvalsQueryOptions'
import { fetchFileQueryOptions } from '#/apis/api/file/fileQueryOptions'
import BreadcrumbNav from '#/components/BreadcrumbNav'
import BasicModal, { type ModalAction } from '#/components/modal/BasicModal'
import { formatPhone, formatToYmd } from '#/utils/format'
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import type { Dispatch, SetStateAction } from 'react'
import { useEffect, useMemo, useState } from 'react'
import UploadField, {
  type UploadState,
} from '../../../../components/inputSections/UploadField'
import RequestInfoCard from '../../../../components/RequestInfoCard'
import CheckListCard, { type CheckListItem } from './-components/CheckListCard'
import StepModal, { type StepStatus } from './-components/StepModal'

export const Route = createFileRoute(
  '/_authedLayout/signup-requests/$requestsId/',
)({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(
      fetchApprovedUserInfoQueryOptions(Number(params.requestsId)),
    ),
  component: RouteComponent,
})

type EditableStepId = 'kakao-channel' | 'toss-place' | 'toss-payments'

const stepStatusMap: Record<
  SignUpRequestDetailDTO['alimtalkStatus'],
  StepStatus
> = {
  BEFORE: 'before',
  IN_PROGRESS: 'progress',
  COMPLETED: 'done',
}

const apiStepStatusMap: Record<StepStatus, STEP> = {
  before: 'BEFORE',
  progress: 'IN_PROGRESS',
  done: 'COMPLETED',
}

function RouteComponent() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { requestsId } = Route.useParams()
  const approvalId = Number(requestsId)
  const { data: requestInfo } = useSuspenseQuery(
    fetchApprovedUserInfoQueryOptions(approvalId),
  )
  const { data: businessLicenseFileInfo } = useSuspenseQuery(
    fetchFileQueryOptions(requestInfo.businessLicenseFileId),
  )
  const { data: bankbookCopyFileInfo } = useSuspenseQuery(
    fetchFileQueryOptions(requestInfo.bankbookCopyFileId),
  )
  const businessLicenseFileUrl = useMemo(
    () => URL.createObjectURL(businessLicenseFileInfo),
    [businessLicenseFileInfo],
  )
  const bankbookCopyFileUrl = useMemo(
    () => URL.createObjectURL(bankbookCopyFileInfo),
    [bankbookCopyFileInfo],
  )

  const [memo, setMemo] = useState(requestInfo.note ?? '')
  const [activeStepId, setActiveStepId] = useState<EditableStepId | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalContent, setModalContent] = useState<{
    title: string
    description: string
    actions: [ModalAction] | [ModalAction, ModalAction]
  }>({
    title: '가입 신청 상세',
    description: '확인',
    actions: [
      {
        label: '확인',
        onClick: () => setIsModalOpen(false),
      },
    ],
  })

  const [stepStatuses, setStepStatuses] = useState<
    Record<EditableStepId, StepStatus>
  >({
    'kakao-channel': stepStatusMap[requestInfo.alimtalkStatus],
    'toss-place': stepStatusMap[requestInfo.tossPlaceStatus],
    'toss-payments': stepStatusMap[requestInfo.tossPaymentsStatus],
  })

  useEffect(() => {
    setStepStatuses({
      'kakao-channel': stepStatusMap[requestInfo.alimtalkStatus],
      'toss-place': stepStatusMap[requestInfo.tossPlaceStatus],
      'toss-payments': stepStatusMap[requestInfo.tossPaymentsStatus],
    })
    setMemo(requestInfo.note ?? '')
  }, [requestInfo])

  useEffect(
    () => () => {
      URL.revokeObjectURL(businessLicenseFileUrl)
    },
    [businessLicenseFileUrl],
  )

  useEffect(
    () => () => {
      URL.revokeObjectURL(bankbookCopyFileUrl)
    },
    [bankbookCopyFileUrl],
  )

  const invalidateRequestInfo = () => {
    queryClient.invalidateQueries({
      queryKey: ['approved', approvalId],
    })
    queryClient.invalidateQueries({
      queryKey: ['approved'],
    })
  }

  const documentsMutation = useMutation({
    mutationFn: () =>
      updateApprovalDocuments(approvalId, {
        businessLicenseFile: businessLicenseFile.file ?? undefined,
        bankbookCopyFile: bankbookCopyFile.file ?? undefined,
        note: memo,
      }),
    onSuccess: () => {
      invalidateRequestInfo()
      setModalContent({
        title: '제출 서류 저장',
        description: '제출 서류와 비고가 정상적으로 저장되었습니다.',
        actions: [
          {
            label: '확인',
            onClick: () => setIsModalOpen(false),
          },
        ],
      })
      setIsModalOpen(true)
    },
    onError: () => {
      setModalContent({
        title: '제출 서류 저장',
        description:
          '제출 서류 저장 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
        actions: [
          {
            label: '확인',
            onClick: () => setIsModalOpen(false),
          },
        ],
      })
      setIsModalOpen(true)
    },
  })

  const stepStatusMutation = useMutation({
    mutationFn: ({
      stepId,
      status,
    }: {
      stepId: EditableStepId
      status: StepStatus
    }) => {
      const apiStatus = apiStepStatusMap[status]

      if (stepId === 'kakao-channel') {
        return updateAlimtalkStatus(approvalId, {
          alimtalkStatus: apiStatus,
        })
      }

      if (stepId === 'toss-place') {
        return updateTossPlaceStatus(approvalId, {
          tossPlaceStatus: apiStatus,
        })
      }

      return updateTossPaymentsStatus(approvalId, {
        tossPaymentsStatus: apiStatus,
      })
    },
    onSuccess: () => {
      invalidateRequestInfo()
      setModalContent({
        title: '승인 단계 상태 변경',
        description: '승인 단계 상태가 정상적으로 변경되었습니다.',
        actions: [
          {
            label: '확인',
            onClick: () => setIsModalOpen(false),
          },
        ],
      })
      setIsModalOpen(true)
    },
    onError: () => {
      setModalContent({
        title: '승인 단계 상태 변경',
        description:
          '승인 단계 상태 변경 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
        actions: [
          {
            label: '확인',
            onClick: () => setIsModalOpen(false),
          },
        ],
      })
      setIsModalOpen(true)
    },
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

  const displayedBusinessLicenseFileUrl = businessLicenseFile.file
    ? undefined
    : businessLicenseFileUrl
  const displayedBankbookCopyFileUrl = bankbookCopyFile.file
    ? undefined
    : bankbookCopyFileUrl

  const checkListItems = [
    {
      id: 'branch-info',
      title: '지점 정보 확인',
      status: stepStatusMap[requestInfo.branchVerifyStatus],
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
    const hasRequiredFileError =
      (!businessLicenseFile.file && !businessLicenseFileUrl) ||
      (!bankbookCopyFile.file && !bankbookCopyFileUrl)

    const hasUploadError =
      businessLicenseFile.error || bankbookCopyFile.error || etcFile.error

    if (hasRequiredFileError || hasUploadError) {
      return
    }

    documentsMutation.mutate()
  }

  const handleStepStatusChange = (status: StepStatus) => {
    if (!activeStepId) return

    const stepId = activeStepId

    setStepStatuses((prev) => ({
      ...prev,
      [stepId]: status,
    }))

    stepStatusMutation.mutate({ stepId, status })
  }

  return (
    <>
      <div className="flex flex-col gap-6 p-6">
        <BreadcrumbNav
          items={[
            { label: '가입 신청 관리', replace: true },
            { label: '신청 상세' },
          ]}
        />

        <div className="mx-auto flex w-full max-w-200 flex-col gap-8">
          <RequestInfoCard
            name={requestInfo.name}
            nameLabel="이름"
            requestedAt={
              requestInfo.createdAt ? formatToYmd(requestInfo.createdAt) : '-'
            }
            email={requestInfo.email}
            phoneNumber={formatPhone(requestInfo.phoneNumber)}
          />

          <div className="flex flex-col gap-4">
            <p className="text-14 font-medium text-app-gray500">제출 서류</p>

            <div className="flex flex-col gap-2">
              <UploadField
                value={businessLicenseFile}
                label="사업자등록증"
                required
                fileUrl={displayedBusinessLicenseFileUrl}
                onChange={updateFile(setBusinessLicenseFile)}
                onDragChange={updateDragging(setBusinessLicenseFile)}
              />

              <UploadField
                value={bankbookCopyFile}
                label="통장 사본"
                required
                fileUrl={displayedBankbookCopyFileUrl}
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
              disabled={documentsMutation.isPending}
              className="h-11 rounded-[10px] bg-app-primary px-6 text-14 font-medium text-app-black disabled:opacity-50"
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
          onStatusChange={handleStepStatusChange}
        />
      )}

      <BasicModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalContent.title}
        description={modalContent.description}
        actions={modalContent.actions}
      />
    </>
  )
}
