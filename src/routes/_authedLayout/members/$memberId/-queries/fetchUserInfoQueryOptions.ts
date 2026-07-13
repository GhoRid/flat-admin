import { fetchUserInfo } from '#/apis/api/user/user'
import { queryOptions } from '@tanstack/react-query'

export type MemberDocument = {
  fileName: string
  fileUrl: string
}

export type MemberDetail = {
  academyName: string
  joinedAt: string
  representativeName: string
  email: string
  phoneNumber: string
  businessLicense: MemberDocument | null
  bankbookCopy: MemberDocument | null
  academyInfo: {
    name: string
    address: string
    businessNumber: string
    bankName: string
    bankAccountNumber: string
    accountHolder: string
  }
  vanAgencyInfo: {
    name: string
    phoneNumber: string
  } | null
}

export const fetchUserInfoQueryOptions = (memberId: number) =>
  queryOptions({
    queryKey: ['userInfo', memberId],
    queryFn: async () => {
      const response = await fetchUserInfo(memberId)

      return response.data as MemberDetail
    },
  })
