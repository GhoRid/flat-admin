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
  const formData = new FormData()

  formData.append('name', data.name)
  formData.append('email', data.email)
  formData.append('phoneNumber', data.phoneNumber)
  formData.append('academyName', data.academyName)
  formData.append('academyPostCode', data.academyPostCode)
  formData.append('academyAddress', data.academyAddress)
  formData.append('academyAddressDetail', data.academyAddressDetail)
  formData.append('academyAddressEtc', data.academyAddressEtc)
  formData.append('academyBusinessNumber', data.academyBusinessNumber)
  formData.append('bankName', data.bankName)
  formData.append('accountNumber', data.accountNumber)
  formData.append('accountHolder', data.accountHolder)
  formData.append('vanAgencyName', data.vanAgencyName)
  formData.append('vanAgencyPhone', data.vanAgencyPhone)

  if (data.businessLicenseFile) {
    formData.append('businessLicenseFile', data.businessLicenseFile)
  }

  if (data.bankbookCopyFile) {
    formData.append('bankbookCopyFile', data.bankbookCopyFile)
  }

  return await appInstance.put(`/admin/users/${userId}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}
