import { appInstance } from '#/apis'

export type FileDTO = Blob

export const fetchFile = async (fileId: number) => {
  return await appInstance.get<FileDTO>(`/admin/file/${fileId}`, {
    responseType: 'blob',
  })
}
