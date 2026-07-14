import { queryOptions } from '@tanstack/react-query'
import { fetchApprovedUserInfo, fetchApprovedUserList } from './approvals'

export const fetchApprovedUserListQueryOptions = () =>
  queryOptions({
    queryKey: ['approved'],
    queryFn: async () => fetchApprovedUserList(),
    select: (res) => res.data,
  })

export const fetchApprovedUserInfoQueryOptions = (approvalId: number) =>
  queryOptions({
    queryKey: ['approved', approvalId],
    queryFn: async () => fetchApprovedUserInfo(approvalId),
    select: (res) => res.data,
  })
