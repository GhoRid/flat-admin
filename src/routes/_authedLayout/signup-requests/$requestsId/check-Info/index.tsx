import BreadcrumbNav from '#/components/BreadcrumbNav'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import DocumentPreviewPanel, {
  type DocumentTab,
} from './-components/DocumentPreviewPanel'
import FormSection from './-components/FormSection'
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

            <FormSection label="주소">
              <div className="grid grid-cols-[1fr_120px] gap-2">
                <input
                  value={zipCode}
                  placeholder="우편번호"
                  readOnly
                  className={inputClassName}
                />

                <button
                  type="button"
                  onClick={openPostcode}
                  className="h-10 whitespace-nowrap rounded-[10px] bg-app-gray50 px-3 text-14 font-medium text-app-black"
                >
                  우편번호 찾기
                </button>
              </div>

              <input
                value={roadAddress}
                placeholder="도로명주소"
                readOnly
                className={inputClassName}
              />

              <div className="grid grid-cols-2 gap-2">
                <input
                  value={detailAddress}
                  onChange={(e) => setDetailAddress(e.target.value)}
                  placeholder="상세 주소"
                  className={inputClassName}
                />

                <input
                  value={referenceAddress}
                  placeholder="참고 항목"
                  readOnly
                  className={inputClassName}
                />
              </div>
            </FormSection>

            <FormSection label="사업자번호">
              <input
                value={businessNumber}
                onChange={(e) => setBusinessNumber(e.target.value)}
                placeholder="사업자번호를 입력해주세요."
                className={inputClassName}
              />
            </FormSection>

            <FormSection label="계좌번호">
              <div className="grid grid-cols-[0.9fr_1fr] gap-2">
                <select
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className={inputClassName}
                >
                  <option value="">은행 선택</option>
                  {BANK_OPTIONS.map((bank) => (
                    <option key={bank} value={bank}>
                      {bank}
                    </option>
                  ))}
                </select>

                <input
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="계좌번호를 입력해주세요."
                  className={inputClassName}
                />
              </div>
            </FormSection>

            <FormSection label="예금주명">
              <input
                value={depositorName}
                onChange={(e) => setDepositorName(e.target.value)}
                placeholder="예금주명을 입력해주세요."
                className={inputClassName}
              />
            </FormSection>
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

const inputClassName =
  'h-10 w-full rounded-[10px] border border-app-gray100 bg-white px-4 text-14 text-app-black outline-none placeholder:text-app-gray300 focus:border-app-black'
