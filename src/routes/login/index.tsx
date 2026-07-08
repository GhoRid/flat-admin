import { login } from '@/apis/api/auth/auth'
import type { LoginAPIRequest } from '@/apis/api/auth/auth.dto'
import { authStore } from '@/auth/authStore'
import { useMutation } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import type { AxiosError } from 'axios'
import { useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import LoginForm from './-components/LoginForm'
import LoginLogoSection from './-components/LoginLogoSection'

export const Route = createFileRoute('/login/')({
  component: LoginPage,
})

const ERROR_MESSAGES = {
  REQUIRED: '로그인 정보를 입력해 주세요.',
  INVALID: '아이디 또는 비밀번호가 일치하지 않습니다.',
  UNKNOWN: '로그인 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',
} as const

type ErrorKey = keyof typeof ERROR_MESSAGES

function LoginPage() {
  const [keepLogin, setKeepLogin] = useState(false)
  const [errorKey, setErrorKey] = useState<ErrorKey | null>(null)

  const navigate = useNavigate()

  const method = useForm<LoginAPIRequest>({
    mode: 'onSubmit',
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const loginMutation = useMutation({
    mutationKey: ['login'],
    mutationFn: (values: LoginAPIRequest) =>
      login({
        email: values.email,
        password: values.password,
      }),
    onSuccess: (res) => {
      const { jwt: accessToken, refreshToken } = res.data

      authStore.saveTokens(accessToken, refreshToken, keepLogin)
      navigate({ to: '/', replace: true })
    },
    onError: (error: AxiosError) => {
      setErrorKey(error.response?.status === 401 ? 'INVALID' : 'UNKNOWN')
    },
  })

  const onSubmit = async (values: LoginAPIRequest) => {
    await loginMutation.mutateAsync(values)
  }

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-5 overflow-hidden bg-app-white">
      <div className="flex w-full max-w-120 flex-col items-stretch rounded-[10px] border border-app-gray100 bg-app-white p-10">
        <LoginLogoSection />

        <FormProvider {...method}>
          <LoginForm
            serverErrorMessage={errorKey ? ERROR_MESSAGES[errorKey] : null}
            clearServerError={() => setErrorKey(null)}
            keepLogin={keepLogin}
            setKeepLogin={setKeepLogin}
            onSubmit={onSubmit}
          />
        </FormProvider>
      </div>
    </div>
  )
}
