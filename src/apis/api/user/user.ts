import { appInstance } from '#/apis'

export const fetchUserList = async () => {
  return await appInstance.get('/admin/users')
}

export const fetchUserInfo = async (userId: number) => {
  return await appInstance.get(`/admin/users/${userId}`)
}
