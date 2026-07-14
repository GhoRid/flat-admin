export type STEP = 'BEFORE' | 'IN_PROGRESS' | 'COMPLETED'

export type ReviewStatus =
  'BEFORE_REVIEW' | 'IN_REVIEW' | 'REJECTED' | 'APPROVED'

export type SignUpRequestListDTO = {
  alimtalkStatus: STEP
  approvalId: number
  branchVerifyStatus: STEP
  createdAt: string
  name: string
  phoneNumber: string
  reviewStatus: ReviewStatus
  tossPaymentsStatus: STEP
  tossPlaceStatus: STEP
  userId: number
}

export type SignUpRequestDetailDTO = {
  name: string
  email: string
  phoneNumber: string
  bankbookCopyFileId: number
  businessLicenseFileId: number
  academyPostCode: string | null
  academyAddress: string | null
  academyAddressDetail: string | null
  academyAddressEtc: string | null
  academyBusinessNumber: string | null
  bankName: string | null
  accountNumber: string | null
  accountHolder: string | null
  branchVerifyStatus: STEP
  alimtalkStatus: STEP
  tossPlaceStatus: STEP
  tossPaymentsStatus: STEP
  reviewStatus: ReviewStatus
  note: string | null
}

export type branchInfoDTO = {
  branchVerifyStatus: STEP
  academyPostCode: string
  academyAddress: string
  academyAddressDetail: string
  academyAddressEtc: string
  academyBusinessNumber: string
  bankName: string
  accountNumber: string
  accountHolder: string
}
