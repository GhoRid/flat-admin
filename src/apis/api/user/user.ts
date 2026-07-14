import { appInstance } from '#/apis'
import type { updateUserInfoType } from './user.dto'

export const fetchUserList = async () => {
  return await appInstance.get('/admin/users')
}

export const fetchUserInfo = async (userId: number) => {
  return await appInstance.get(`/admin/users/${userId}`)
}

export const updateUserInfo = async (
  userId: number,
  data: updateUserInfoType,
) => {
  return await appInstance.put(`/admin/users/${userId}`, data)
}
