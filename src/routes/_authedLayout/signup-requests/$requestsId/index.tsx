import BreadcrumbNav from '#/components/BreadcrumbNav'
import { createFileRoute } from '@tanstack/react-router'
import type { Dispatch, SetStateAction } from 'react'
import { useState } from 'react'
import RequestInfoCard from './-components/RequestInfoCard'
import UploadField, { type UploadState } from './-components/UploadField'

export const Route = createFileRoute(
  '/_authedLayout/signup-requests/$requestsId/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const [isSubmitted, setIsSubmitted] = useState(false)

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
  }

  return (
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

          <div className="rounded-[10px] border border-app-gray100 bg-white p-5">
            <p className="text-14 text-app-gray500">
              승인 전 제출 서류와 신청 정보를 확인해 주세요.
            </p>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            className="h-11 rounded-[10px] bg-app-primary px-6 text-14 font-medium text-white"
            onClick={handleSubmit}
          >
            승인하기
          </button>
        </div>
      </div>
    </div>
  )
}
