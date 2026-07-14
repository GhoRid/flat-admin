import { appInstance } from '#/apis'

export const fetchNoticesList = async () => {
  return await appInstance.get('/admin/notices')
}
