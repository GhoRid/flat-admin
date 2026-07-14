import { appInstance } from '../..'
import type { LoginAPIRequest } from './auth.dto'

export const login = async (payload: LoginAPIRequest) => {
  return await appInstance.post('/admin/auth/login', payload)
}
