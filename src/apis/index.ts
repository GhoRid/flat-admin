import axios, { type AxiosInstance } from 'axios'
import { authStore } from '../auth/authStore'

const {
  getAccessToken,
  getRefreshToken,
  saveTokens,
  deleteAccessToken,
  getKeepLogin,
  logout,
} = authStore

let isRefreshing = false
let refreshPromise: Promise<string | null> | null = null

export const appInstance: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 3000,
  headers: {
    'Content-Type': 'application/json',
  },
})

const reissueToken = async (base: AxiosInstance): Promise<string | null> => {
  const refreshToken = getRefreshToken()
  if (!refreshToken) {
    throw new Error('리프레시 토큰 없음')
  }

  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const response = await base.post('/auth/refresh', {
          refreshToken: refreshToken,
        })
        const newToken = response.data.jwt
        const newRefreshToken = response.data.refreshToken

        if (!newToken) throw new Error('토큰 없음')

        saveTokens(newToken, newRefreshToken, getKeepLogin())

        return newToken
      } catch (error) {
        logout()
        throw new Error('토큰 재발급에 실패했습니다.')
      } finally {
        isRefreshing = false
        refreshPromise = null
      }
    })()

    isRefreshing = true
  }

  return refreshPromise
}

appInstance.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

appInstance.interceptors.response.use(
  (response) => {
    return response
  },
  async (err) => {
    const errorStatus = err.response?.status
    const originalRequest = err.config as any

    // 401: 토큰 만료가 아닌 인증 실패 → 즉시 로그아웃 처리
    if (errorStatus === 401) {
      logout()
      return Promise.reject(err)
    }

    // 리프레시 요청 자체에서 419가 나오면 그대로 실패 처리
    if (originalRequest?.url?.includes('/auth/refresh')) {
      return Promise.reject(err)
    }

    // 419: 액세스 토큰 만료 → 리프레시 진행
    if (errorStatus === 419 && !originalRequest._retry) {
      deleteAccessToken()
      originalRequest._retry = true

      // 이미 리프레시 중이면 기존 Promise 기다림
      if (isRefreshing && refreshPromise) {
        try {
          const token = await refreshPromise
          if (token) {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return appInstance(originalRequest)
          }
        } catch (e) {
          return Promise.reject(e)
        }
      }

      try {
        const token = await reissueToken(appInstance)
        if (token) {
          originalRequest.headers.Authorization = `Bearer ${token}`
          return appInstance(originalRequest)
        }
      } catch (reissueError) {
        console.error('토큰 재발급 실패:', reissueError)
        return Promise.reject(reissueError)
      }
    }

    return Promise.reject(err)
  }
)
