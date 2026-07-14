import { queryOptions } from '@tanstack/react-query'
import { fetchUserInfo } from './user'
import type { UserDetail } from './user.dto'

export const fetchUserInfoQueryOptions = (userId: number) =>
  queryOptions({
    queryKey: ['user', userId],
    queryFn: async () => fetchUserInfo(userId),
    select: (res) => res.data as UserDetail,
  })
