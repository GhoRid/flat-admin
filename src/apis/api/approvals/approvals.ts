import { appInstance } from '#/apis'

export const fetchApprovedUserList = async () => {
  return await appInstance.get(`/admin/user-approvals`)
}

export const fetchApprovedUserInfo = async (approvalId: number) => {
  return await appInstance.get(`/admin/user-approvals/${approvalId}`)
}
