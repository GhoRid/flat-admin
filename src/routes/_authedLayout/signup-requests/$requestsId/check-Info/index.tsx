import BreadcrumbNav from '#/components/BreadcrumbNav'
import AccountSection from '#/components/inputSections/AccountSection'
import AddressSection from '#/components/inputSections/AddressSection'
import NormalSection from '#/components/inputSections/NormalSection'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import DocumentPreviewPanel, {
  type DocumentTab,
} from './-components/DocumentPreviewPanel'
import StatusSelector, { type StepStatus } from './-components/StatusSelector'

export const Route = createFileRoute(
  '/_authedLayout/signup-requests/$requestsId/check-Info/',
)({
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
  const navigate = useNavigate()
  const { requestsId } = Route.useParams()

  const [activeDocumentTab, setActiveDocumentTab] =
    useState<DocumentTab>('business-license')
  const [status, setStatus] = useState<StepStatus>('before')
  const [zipCode, setZipCode] = useState('')
  const [roadAddress, setRoadAddress] = useState('')
  const [detailAddress, setDetailAddress] = useState('')
  const [referenceAddress, setReferenceAddress] = useState('')
  const [businessNumber, setBusinessNumber] = useState('')
  const [bankName, setBankName] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [depositorName, setDepositorName] = useState('')

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

        setZipCode(data.zonecode ?? '')
        setRoadAddress(roadAddr)
        setReferenceAddress(roadAddr ? extraRoadAddr : '')
      },
    }).open()
  }

  const handleSave = () => {
    // TODO: 저장 API 연결
    // status
    // zipCode
    // roadAddress
    // detailAddress
    // referenceAddress
    // businessNumber
    // bankName
    // accountNumber
    // depositorName

    navigate({
      to: '/signup-requests/$requestsId',
      params: {
        requestsId,
      },
    })
  }

  return (
    <div className="flex min-h-[calc(100dvh-48px)] flex-col gap-6 p-6">
      <BreadcrumbNav
        items={[
          { label: '가입 신청 관리', to: '/signup-requests' },
          { label: '신청 상세' },
          { label: '지점 정보 확인' },
        ]}
      />

      <div className="mx-auto grid min-h-0 w-full max-w-[1150px] flex-1 grid-cols-[1fr_1.12fr] gap-8">
        <DocumentPreviewPanel
          activeTab={activeDocumentTab}
          onTabChange={setActiveDocumentTab}
        />

        <div className="flex h-full min-h-0 flex-col justify-between gap-10">
          <div className="flex flex-col gap-5">
            <StatusSelector value={status} onChange={setStatus} />

            <AddressSection
              zipCode={zipCode}
              roadAddress={roadAddress}
              detailAddress={detailAddress}
              referenceAddress={referenceAddress}
              onDetailAddressChange={setDetailAddress}
              onPostcodeClick={openPostcode}
            />

            <NormalSection
              title="사업자번호"
              value={businessNumber}
              onChange={setBusinessNumber}
              placeholder="사업자번호를 입력해주세요."
            />

            <AccountSection
              bankOptions={BANK_OPTIONS}
              bankName={bankName}
              accountNumber={accountNumber}
              onBankNameChange={setBankName}
              onAccountNumberChange={setAccountNumber}
            />

            <NormalSection
              title="예금주명"
              value={depositorName}
              onChange={setDepositorName}
              placeholder="예금주명을 입력해주세요."
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
              type="button"
              onClick={handleSave}
              className="h-10 rounded-[10px] bg-app-primary text-14 font-medium text-app-black transition-opacity hover:opacity-92"
            >
              저장
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
