import { updateApprovalBranchInfo } from '#/apis/api/approvals/approvals'
import type {
  SignUpRequestDetailDTO,
  STEP,
} from '#/apis/api/approvals/approvals.dto'
import { fetchApprovedUserInfoQueryOptions } from '#/apis/api/approvals/approvalsQueryOptions'
import { fetchFileQueryOptions } from '#/apis/api/file/fileQueryOptions'
import BreadcrumbNav from '#/components/BreadcrumbNav'
import AccountSection from '#/components/inputSections/AccountSection'
import AddressSection from '#/components/inputSections/AddressSection'
import NormalSection from '#/components/inputSections/NormalSection'
import BasicModal, { type ModalAction } from '#/components/modal/BasicModal'
import { formatBusinessNumber } from '#/utils/format'
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import DocumentPreviewPanel, {
  type DocumentTab,
} from './-components/DocumentPreviewPanel'
import StatusSelector, { type StepStatus } from './-components/StatusSelector'

export const Route = createFileRoute(
  '/_authedLayout/signup-requests/$requestsId/check-Info/',
)({
  loader: async ({ context, params }) => {
    await context.queryClient.ensureQueryData(
      fetchApprovedUserInfoQueryOptions(Number(params.requestsId)),
    )
  },
  component: RouteComponent,
})

const BANK_OPTIONS = [
  '국민은행',
  '신한은행',
  '우리은행',
  '하나은행',
  '농협은행',
]

const DAUM_POSTCODE_SRC =
  'https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js'

let daumPostcodePromise: Promise<void> | null = null

const stepStatusMap: Record<STEP, StepStatus> = {
  BEFORE: 'before',
  IN_PROGRESS: 'progress',
  COMPLETED: 'done',
}

const apiStepStatusMap: Record<StepStatus, STEP> = {
  before: 'BEFORE',
  progress: 'IN_PROGRESS',
  done: 'COMPLETED',
}

type BranchInfoFormValues = {
  branchVerifyStatus: StepStatus
  academyPostCode: string
  academyAddress: string
  academyAddressDetail: string
  academyAddressEtc: string
  academyBusinessNumber: string
  bankName: string
  accountNumber: string
  accountHolder: string
}

const getBranchInfoFormValues = (
  requestInfo: SignUpRequestDetailDTO,
): BranchInfoFormValues => ({
  branchVerifyStatus: stepStatusMap[requestInfo.branchVerifyStatus],
  academyPostCode: requestInfo.academyPostCode ?? '',
  academyAddress: requestInfo.academyAddress ?? '',
  academyAddressDetail: requestInfo.academyAddressDetail ?? '',
  academyAddressEtc: requestInfo.academyAddressEtc ?? '',
  academyBusinessNumber: requestInfo.academyBusinessNumber ?? '',
  bankName: requestInfo.bankName ?? '',
  accountNumber: requestInfo.accountNumber ?? '',
  accountHolder: requestInfo.accountHolder ?? '',
})

type DaumPostcodeData = {
  zonecode?: string
  roadAddress?: string
  bname?: string
  buildingName?: string
  apartment?: string
}

declare global {
  interface Window {
    daum?: {
      Postcode?: new (options: {
        oncomplete: (data: DaumPostcodeData) => void
      }) => {
        open: () => void
      }
    }
  }
}

function loadDaumPostcodeScript() {
  if (typeof window === 'undefined') return Promise.resolve()
  if (window.daum?.Postcode) return Promise.resolve()

  if (daumPostcodePromise) return daumPostcodePromise

  daumPostcodePromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector(
      `script[src="${DAUM_POSTCODE_SRC}"]`,
    ) as HTMLScriptElement | null

    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true })
      existing.addEventListener('error', () => reject(), { once: true })
      return
    }

    const script = document.createElement('script')
    script.src = DAUM_POSTCODE_SRC
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject()
    document.body.appendChild(script)
  })

  return daumPostcodePromise
}

function RouteComponent() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { requestsId } = Route.useParams()
  const approvalId = Number(requestsId)
  const { data: requestInfo } = useSuspenseQuery(
    fetchApprovedUserInfoQueryOptions(approvalId),
  )
  const { data: businessLicenseFile } = useSuspenseQuery(
    fetchFileQueryOptions(requestInfo.businessLicenseFileId),
  )
  const { data: bankbookCopyFile } = useSuspenseQuery(
    fetchFileQueryOptions(requestInfo.bankbookCopyFileId),
  )
  const businessLicenseFileUrl = useMemo(
    () => URL.createObjectURL(businessLicenseFile),
    [businessLicenseFile],
  )
  const bankbookCopyFileUrl = useMemo(
    () => URL.createObjectURL(bankbookCopyFile),
    [bankbookCopyFile],
  )

  const [activeDocumentTab, setActiveDocumentTab] =
    useState<DocumentTab>('business-license')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalContent, setModalContent] = useState<{
    title: string
    description: string
    actions: [ModalAction] | [ModalAction, ModalAction]
  }>({
    title: '지점 정보 확인',
    description: '확인',
    actions: [
      {
        label: '확인',
        onClick: () => setIsModalOpen(false),
      },
    ],
  })
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { isDirty },
  } = useForm<BranchInfoFormValues>({
    defaultValues: getBranchInfoFormValues(requestInfo),
  })

  const formValues = watch()
  const fieldValues = [
    formValues.academyPostCode,
    formValues.academyAddress,
    formValues.academyAddressDetail,
    formValues.academyAddressEtc,
    formValues.academyBusinessNumber,
    formValues.bankName,
    formValues.accountNumber,
    formValues.accountHolder,
  ]

  const isAnyFieldFilled = fieldValues.some((value) => value.trim().length > 0)
  const isAllFieldsFilled = fieldValues.every(
    (value) => value.trim().length > 0,
  )
  const disabledStatusOptions: StepStatus[] = [
    isAnyFieldFilled && (formValues.branchVerifyStatus !== 'before' || isDirty)
      ? 'before'
      : null,
    isAllFieldsFilled ? null : 'done',
  ].filter((value): value is StepStatus => value !== null)

  const markEditing = () => {
    if (formValues.branchVerifyStatus === 'progress') return

    setValue('branchVerifyStatus', 'progress', {
      shouldDirty: true,
      shouldValidate: true,
    })
  }

  useEffect(() => {
    reset(getBranchInfoFormValues(requestInfo))
  }, [requestInfo, reset])

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

  const branchInfoMutation = useMutation({
    mutationFn: (values: BranchInfoFormValues) =>
      updateApprovalBranchInfo(approvalId, {
        branchVerifyStatus: apiStepStatusMap[values.branchVerifyStatus],
        academyPostCode: values.academyPostCode,
        academyAddress: values.academyAddress,
        academyAddressDetail: values.academyAddressDetail,
        academyAddressEtc: values.academyAddressEtc,
        academyBusinessNumber: values.academyBusinessNumber,
        bankName: values.bankName,
        accountNumber: values.accountNumber,
        accountHolder: values.accountHolder,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['approved', approvalId],
      })
      queryClient.invalidateQueries({
        queryKey: ['approved'],
      })
      setModalContent({
        title: '지점 정보 확인',
        description: '지점 정보가 정상적으로 저장되었습니다.',
        actions: [
          {
            label: '확인',
            onClick: () => {
              setIsModalOpen(false)
              navigate({
                to: '/signup-requests/$requestsId',
                params: {
                  requestsId,
                },
              })
            },
          },
        ],
      })
      setIsModalOpen(true)
    },
    onError: () => {
      setModalContent({
        title: '지점 정보 확인',
        description:
          '지점 정보 저장 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
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

  const handleCancel = () => {
    navigate({
      to: '/signup-requests/$requestsId',
      params: {
        requestsId,
      },
    })
  }

  const openPostcode = async () => {
    await loadDaumPostcodeScript()
    if (!window.daum?.Postcode) return

    new window.daum.Postcode({
      oncomplete: (data) => {
        const roadAddr = data.roadAddress ?? ''
        let extraRoadAddr = ''

        if (data.bname && /[동|로|가]$/g.test(data.bname)) {
          extraRoadAddr += data.bname
        }
        if (data.buildingName && data.apartment === 'Y') {
          extraRoadAddr += extraRoadAddr
            ? `, ${data.buildingName}`
            : data.buildingName
        }

        markEditing()
        setValue('academyPostCode', data.zonecode ?? '', {
          shouldDirty: true,
          shouldValidate: true,
        })
        setValue('academyAddress', roadAddr, {
          shouldDirty: true,
          shouldValidate: true,
        })
        setValue('academyAddressEtc', roadAddr ? extraRoadAddr : '', {
          shouldDirty: true,
          shouldValidate: true,
        })
      },
    }).open()
  }

  const handleSave = (values: BranchInfoFormValues) => {
    branchInfoMutation.mutate(values)
  }

  return (
    <>
      <div className="flex min-h-[calc(100dvh-48px)] flex-col gap-6 p-6">
        <BreadcrumbNav
          backTo={`/signup-requests/${requestsId}`}
          backReplace
          items={[
            { label: '가입 신청 관리', to: '/signup-requests', replace: true },
            {
              label: '신청 상세',
              to: `/signup-requests/${requestsId}`,
              replace: true,
            },
            { label: '지점 정보 확인' },
          ]}
        />

        <div className="mx-auto grid min-h-0 w-full max-w-287.5 flex-1 grid-cols-[1fr_1.12fr] gap-8">
          <DocumentPreviewPanel
            activeTab={activeDocumentTab}
            onTabChange={setActiveDocumentTab}
            businessLicenseFileUrl={businessLicenseFileUrl}
            bankbookCopyFileUrl={bankbookCopyFileUrl}
          />

          <form
            className="flex h-full min-h-0 flex-col justify-between gap-10"
            onSubmit={handleSubmit(handleSave)}
          >
            <div className="flex flex-col gap-5">
              <Controller
                control={control}
                name="branchVerifyStatus"
                render={({ field }) => (
                  <StatusSelector
                    value={field.value}
                    onChange={(nextStatus) => {
                      if (disabledStatusOptions.includes(nextStatus)) return
                      field.onChange(nextStatus)
                    }}
                    disabledOptions={disabledStatusOptions}
                  />
                )}
              />

              <Controller
                control={control}
                name="academyAddressDetail"
                render={({ field }) => (
                  <AddressSection
                    zipCode={formValues.academyPostCode}
                    roadAddress={formValues.academyAddress}
                    detailAddress={field.value}
                    referenceAddress={formValues.academyAddressEtc}
                    onDetailAddressChange={(next) => {
                      markEditing()
                      field.onChange(next)
                    }}
                    onPostcodeClick={openPostcode}
                  />
                )}
              />

              <Controller
                control={control}
                name="academyBusinessNumber"
                render={({ field }) => (
                  <NormalSection
                    title="사업자번호"
                    value={formatBusinessNumber(field.value)}
                    onChange={(next) => {
                      markEditing()
                      field.onChange(next)
                    }}
                    placeholder="사업자번호를 입력해주세요."
                  />
                )}
              />

              <Controller
                control={control}
                name="accountNumber"
                render={({ field }) => (
                  <AccountSection
                    bankOptions={BANK_OPTIONS}
                    bankName={formValues.bankName}
                    accountNumber={field.value}
                    onBankNameChange={(next) => {
                      markEditing()
                      setValue('bankName', next, {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                    }}
                    onAccountNumberChange={(next) => {
                      markEditing()
                      field.onChange(next)
                    }}
                  />
                )}
              />

              <Controller
                control={control}
                name="accountHolder"
                render={({ field }) => (
                  <NormalSection
                    title="예금주명"
                    value={field.value}
                    onChange={(next) => {
                      markEditing()
                      field.onChange(next)
                    }}
                    placeholder="예금주명을 입력해주세요."
                  />
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleCancel}
                className="h-10 rounded-[10px] bg-app-gray50 text-14 font-medium text-app-black transition-opacity hover:opacity-92"
              >
                취소
              </button>

              <button
                type="submit"
                disabled={branchInfoMutation.isPending}
                className="h-10 rounded-[10px] bg-app-primary text-14 font-medium text-app-black transition-opacity hover:opacity-92 disabled:opacity-50"
              >
                저장
              </button>
            </div>
          </form>
        </div>
      </div>

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
