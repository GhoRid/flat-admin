import { queryOptions } from '@tanstack/react-query'
import { fetchFile } from './file'

export type { FileDTO } from './file'

export const fetchFileQueryOptions = (fileId: number) =>
  queryOptions({
    queryKey: ['file', fileId],
    queryFn: async () => fetchFile(fileId),
    select: (res) => res.data,
  })
