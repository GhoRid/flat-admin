export type UserListType = {
  userId: number
  academyName: string | null
  name: string
  phoneNumber: string
  createdAt: string
  approvedAt: string | null
  isApproved: boolean
  userRole: string
}

export type updateUserInfoType = {
  name: string
  email: string
  phoneNumber: string
  businessLicenseFile: File
  bankbookCopyFile: File
  academyName: string
  academyPostCode: string
  academyAddress: string
  academyAddressDetail: string
  academyAddressEtc: string
  academyBusinessNumber: string
  bankName: string
  accountNumber: string
  vanAgencyName: string
  vanAgencyPhone: string
}

export type UserDetail = {
  name: string
  email: string
  phoneNumber: string
  businessLicenseFileId: number
  bankbookCopyFileId: number
  academyName: string
  academyPostCode: string
  academyAddress: string
  academyAddressDetail: string
  academyAddressEtc: string
  academyBusinessNumber: string
  bankName: string
  accountNumber: string
  vanAgencyName: string
  vanAgencyPhone: string
}
