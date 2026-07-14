import { appInstance } from '#/apis'
import type { branchInfoDTO, STEP } from './approvals.dto'

export const fetchApprovedUserList = async () => {
  return await appInstance.get('/admin/user-approvals')
}

export const fetchApprovedUserInfo = async (approvalId: number) => {
  return await appInstance.get(`/admin/user-approvals/${approvalId}`)
}

// 토스플레이스 상태 수정
export const updateTossPlaceStatus = async (
  approvalId: number,
  payload: { tossPlaceStatus: STEP },
) => {
  return await appInstance.patch(
    `/admin/user-approvals/${approvalId}/toss-place-status`,
    payload,
  )
}

// 토스페이먼츠 상태 수정
export const updateTossPaymentsStatus = async (
  approvalId: number,
  payload: { tossPaymentsStatus: STEP },
) => {
  return await appInstance.patch(
    `/admin/user-approvals/${approvalId}/toss-payments-status`,
    payload,
  )
}

export const updateApprovalDocuments = async (
  approvalId: number,
  payload: {
    businessLicenseFile?: File
    bankbookCopyFile?: File
    note?: string
  },
) => {
  const formData = new FormData()

  if (payload.businessLicenseFile) {
    formData.append('businessLicenseFile', payload.businessLicenseFile)
  }

  if (payload.bankbookCopyFile) {
    formData.append('bankbookCopyFile', payload.bankbookCopyFile)
  }

  if (payload.note !== undefined && payload.note !== null) {
    formData.append('note', payload.note)
  }

  return await appInstance.patch(
    `/admin/user-approvals/${approvalId}/documents`,
    formData,
  )
}

// 지점 정보 수정
export const updateApprovalBranchInfo = async (
  approvalId: number,
  payload: branchInfoDTO,
) => {
  return await appInstance.patch(
    `/admin/user-approvals/${approvalId}/branch-info`,
    payload,
  )
}

// 알림톡 상태 수정
export const updateAlimtalkStatus = async (
  approvalId: number,
  payload: { alimtalkStatus: STEP },
) => {
  return await appInstance.patch(
    `/admin/user-approvals/${approvalId}/alimtalk-status`,
    payload,
  )
}
