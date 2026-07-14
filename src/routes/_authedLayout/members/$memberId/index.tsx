import { updateUserInfo } from '#/apis/api/user/user'
import type { UserDetail, updateUserInfoType } from '#/apis/api/user/user.dto'
import { fetchUserInfoQueryOptions } from '#/apis/api/user/userQueryOptions'
import BreadcrumbNav from '#/components/BreadcrumbNav'
import AccountSection from '#/components/inputSections/AccountSection'
import AddressSection from '#/components/inputSections/AddressSection'
import NormalSection from '#/components/inputSections/NormalSection'
import PhoneSection from '#/components/inputSections/PhoneSection'
import UploadField, {
  type UploadState,
} from '#/components/inputSections/UploadField'
import BasicModal, {
  type ModalAction,
} from '#/components/modal/BasicModal'
import { formatBusinessNumber } from '#/utils/format'
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'

export const Route = createFileRoute('/_authedLayout/members/$memberId/')({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(
      fetchUserInfoQueryOptions(Number(params.memberId)),
    ),
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

type MemberInfoFormValues = {
  academyName: string
  name: string
  email: string
  phoneNumber: string
  academyPostCode: string
  academyAddress: string
  academyAddressDetail: string
  academyAddressEtc: string
  academyBusinessNumber: string
  bankName: string
  accountNumber: string
  accountHolder: string
  vanAgencyName: string
  vanAgencyPhone: string
}

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

const emptyUploadState: UploadState = {
  file: null,
  error: '',
  isDragging: false,
}

const getMemberInfoFormValues = (
  userInfo: UserDetail,
): MemberInfoFormValues => ({
  academyName: userInfo.academyName ?? '',
  name: userInfo.name ?? '',
  email: userInfo.email ?? '',
  phoneNumber: userInfo.phoneNumber ?? '',
  academyPostCode: userInfo.academyPostCode ?? '',
  academyAddress: userInfo.academyAddress ?? '',
  academyAddressDetail: userInfo.academyAddressDetail ?? '',
  academyAddressEtc: userInfo.academyAddressEtc ?? '',
  academyBusinessNumber: userInfo.academyBusinessNumber ?? '',
  bankName: userInfo.bankName ?? '',
  accountNumber: userInfo.accountNumber ?? '',
  accountHolder: userInfo.accountHolder ?? '',
  vanAgencyName: userInfo.vanAgencyName ?? '',
  vanAgencyPhone: userInfo.vanAgencyPhone ?? '',
})

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
  const { memberId } = Route.useParams()
  const userId = Number(memberId)
  const { data: userInfo } = useSuspenseQuery(fetchUserInfoQueryOptions(userId))

  const [businessLicenseUpload, setBusinessLicenseUpload] =
    useState<UploadState>(emptyUploadState)
  const [bankbookCopyUpload, setBankbookCopyUpload] =
    useState<UploadState>(emptyUploadState)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalContent, setModalContent] = useState<{
    title: string
    description: string
    actions: [ModalAction] | [ModalAction, ModalAction]
  }>({
    title: '회원 정보 수정',
    description: '확인',
    actions: [
      {
        label: '확인',
        onClick: () => setIsModalOpen(false),
      },
    ],
  })

  const { control, handleSubmit, reset, setValue, watch } =
    useForm<MemberInfoFormValues>({
      defaultValues: getMemberInfoFormValues(userInfo),
    })
  const formValues = watch()

  useEffect(() => {
    reset(getMemberInfoFormValues(userInfo))
    setBusinessLicenseUpload(emptyUploadState)
    setBankbookCopyUpload(emptyUploadState)
  }, [userInfo, reset])

  const memberInfoMutation = useMutation({
    mutationFn: (values: MemberInfoFormValues) => {
      const payload: updateUserInfoType = {
        ...values,
        businessLicenseFile: businessLicenseUpload.file,
        bankbookCopyFile: bankbookCopyUpload.file,
      }

      return updateUserInfo(userId, payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['user', userId],
      })
      queryClient.invalidateQueries({
        queryKey: ['user'],
      })
      setModalContent({
        title: '회원 정보 수정',
        description: '회원 정보가 정상적으로 저장되었습니다.',
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
        title: '회원 정보 수정',
        description:
          '회원 정보 저장 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
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

  const handleCancel = () => {
    navigate({ to: '/members' })
  }

  const handleSave = (values: MemberInfoFormValues) => {
    memberInfoMutation.mutate(values)
  }

  return (
    <>
      <div className="flex min-h-[calc(100dvh-48px)] flex-col gap-6 p-6">
        <BreadcrumbNav
          items={[{ label: '회원 관리', to: '/members' }, { label: '회원 상세' }]}
        />

        <form
          className="mx-auto flex w-full max-w-[1050px] flex-col gap-8"
          onSubmit={handleSubmit(handleSave)}
        >
          <div className="flex flex-col gap-5">
            <Controller
              control={control}
              name="academyName"
              render={({ field }) => (
                <NormalSection
                  title="학원명"
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="학원명"
                />
              )}
            />

            <Controller
              control={control}
              name="name"
              render={({ field }) => (
                <NormalSection
                  title="대표자명"
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="이름"
                />
              )}
            />

            <Controller
              control={control}
              name="email"
              render={({ field }) => (
                <NormalSection
                  title="이메일"
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="이메일 입력"
                />
              )}
            />

            <Controller
              control={control}
              name="phoneNumber"
              render={({ field }) => (
                <PhoneSection
                  title="연락처"
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="연락처 입력"
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
                  onDetailAddressChange={field.onChange}
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
                  onChange={field.onChange}
                  placeholder="사업자번호"
                />
              )}
            />

            <div className="grid grid-cols-[1fr_300px] gap-3">
              <Controller
                control={control}
                name="accountNumber"
                render={({ field }) => (
                  <AccountSection
                    bankOptions={BANK_OPTIONS}
                    bankName={formValues.bankName}
                    accountNumber={field.value}
                    onBankNameChange={(next) =>
                      setValue('bankName', next, {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                    }
                    onAccountNumberChange={field.onChange}
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
                    onChange={field.onChange}
                    placeholder="예금주명"
                  />
                )}
              />
            </div>

            <UploadField
              value={businessLicenseUpload}
              label="사업자 등록증"
              onChange={(file, error = '') =>
                setBusinessLicenseUpload({
                  file,
                  error,
                  isDragging: false,
                })
              }
              onDragChange={(isDragging) =>
                setBusinessLicenseUpload((prev) => ({
                  ...prev,
                  isDragging,
                }))
              }
            />

            <UploadField
              value={bankbookCopyUpload}
              label="통장 사본"
              onChange={(file, error = '') =>
                setBankbookCopyUpload({
                  file,
                  error,
                  isDragging: false,
                })
              }
              onDragChange={(isDragging) =>
                setBankbookCopyUpload((prev) => ({
                  ...prev,
                  isDragging,
                }))
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleCancel}
              className="h-14 rounded-[10px] bg-app-gray50 text-18 font-medium text-app-black transition-opacity hover:opacity-92"
            >
              취소
            </button>

            <button
              type="submit"
              disabled={memberInfoMutation.isPending}
              className="h-14 rounded-[10px] bg-app-primary text-18 font-medium text-app-black transition-opacity hover:opacity-92 disabled:opacity-50"
            >
              저장
            </button>
          </div>
        </form>
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
