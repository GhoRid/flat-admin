import type { LoginAPIRequest } from '@/apis/api/auth/auth.dto'
import CheckIcon from '@svgs/common/Check.svg?react'
import DeleteIcon from '@svgs/common/Delete.svg?react'
import HideIcon from '@svgs/common/Hide.svg?react'
import ShownHideIcon from '@svgs/common/ShowHide.svg?react'
import { useState } from 'react'
import { useFormContext } from 'react-hook-form'

// const ERROR_MESSAGES = {
//   REQUIRED: "로그인 정보를 입력해 주세요.",
//   INVALID: "아이디 또는 비밀번호가 일치하지 않습니다.",
//   UNKNOWN: "로그인 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
// } as const;

type LoginFormProps = {
  serverErrorMessage?: string | null
  clearServerError?: () => void
  keepLogin: boolean
  setKeepLogin: (keepLogin: boolean) => void
  onSubmit: (payload: LoginAPIRequest) => void | Promise<void>
}

export default function LoginForm({
  serverErrorMessage,
  clearServerError,
  keepLogin,
  setKeepLogin,
  onSubmit,
}: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isValid, isSubmitting, touchedFields, submitCount },
  } = useFormContext<LoginAPIRequest>()

  const showEmailError =
    (touchedFields.email || submitCount > 0) && errors.email?.message
  const showPasswordError =
    !showEmailError &&
    (touchedFields.password || submitCount > 0) &&
    errors.password?.message

  const showServerError =
    !showEmailError && !showPasswordError && serverErrorMessage

  const clearEmail = () => {
    setValue('email', '', { shouldDirty: true, shouldValidate: true })
    clearServerError?.()
  }

  const clearPassword = () => {
    setValue('password', '', { shouldDirty: true, shouldValidate: true })
    clearServerError?.()
  }

  const isSubmitDisabled = !isValid || isSubmitting || !!serverErrorMessage

  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
    >
      <div className="flex flex-col gap-[15px]">
        <label className="text-16 font-normal" htmlFor="email">
          아이디
        </label>
        <div className="group flex h-14 w-full items-center gap-1 rounded-[10px] border border-app-gray100 px-[15px] py-3 focus-within:border-app-gray300">
          <input
            className="w-full text-14 outline-none placeholder:text-app-gray500"
            id="email"
            type="email"
            autoComplete="username"
            placeholder="이메일 주소를 입력해 주세요."
            {...register('email', {
              required: '이메일을 입력해 주세요.',
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: '이메일 형식이 올바르지 않습니다.',
              },
              onChange: () => clearServerError?.(),
              onBlur: (e) => setValue('email', e.target.value.trim()),
            })}
          />
          <button
            className="hidden size-[22px] items-center justify-center rounded-full bg-app-gray100 opacity-50 hover:bg-app-gray500 group-focus-within:flex"
            tabIndex={-1}
            type="button"
            aria-label="이메일 지우기"
            onClick={clearEmail}
          >
            <DeleteIcon />
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-[15px]">
        <label className="text-16 font-normal" htmlFor="password">
          비밀번호
        </label>
        <div className="group flex h-14 w-full items-center gap-1 rounded-[10px] border border-app-gray100 px-[15px] py-3 focus-within:border-app-gray300">
          <input
            className="w-full text-14 outline-none placeholder:text-app-gray500"
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="비밀번호를 입력해 주세요."
            autoComplete="current-password"
            {...register('password', {
              required: '비밀번호를 입력해 주세요.',
              minLength: {
                value: 4,
                message: '비밀번호는 4자 이상 입력해 주세요.',
              },
              onChange: () => clearServerError?.(),
              onBlur: (e) => setValue('password', e.target.value.trim()),
            })}
          />

          <button
            className="hidden size-[22px] items-center justify-center rounded-full bg-app-gray100 opacity-50 hover:bg-app-gray500 group-focus-within:flex"
            tabIndex={-1}
            type="button"
            aria-label="비밀번호 지우기"
            onClick={clearPassword}
          >
            <DeleteIcon />
          </button>

          <button
            className="ml-2.5 min-w-[22px] text-16 opacity-50 hover:opacity-100"
            type="button"
            tabIndex={-1}
            aria-label="비밀번호 보기"
            onClick={() => setShowPassword((prev) => !prev)}
          >
            {showPassword ? <ShownHideIcon /> : <HideIcon />}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-start">
        <label className="inline-flex cursor-pointer select-none items-center gap-2.5">
          <input
            className="peer absolute size-0 opacity-0"
            id="keep-login"
            type="checkbox"
            checked={keepLogin}
            onChange={(e) => setKeepLogin(e.target.checked)}
          />
          <div
            className="inline-flex size-5 items-center justify-center rounded-full border border-app-gray500 bg-app-white text-app-gray500 opacity-50 peer-checked:border-app-gray500 peer-checked:bg-app-gray500 peer-checked:text-app-white peer-checked:opacity-100 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-app-black [&_svg]:size-5"
            aria-hidden
          >
            <CheckIcon />
          </div>
          <span className="text-14 text-app-black">로그인 상태 유지</span>
        </label>
      </div>

      <div className="mt-2.5 h-5 text-center text-14 text-app-red">
        {/* {showEmailError && <span role="alert">{errors.email?.message}</span>}
        {showPasswordError && (
          <span role="alert">{errors.password?.message}</span>
        )} */}
        {showServerError && <span role="alert">{serverErrorMessage}</span>}
      </div>

      <button
        className="mt-2 h-[60px] w-full rounded-2xl bg-app-main text-18 font-semibold bg-app-primary text-app-black transition-colors duration-150 disabled:cursor-not-allowed disabled:bg-app-gray100 disabled:text-app-black"
        type="submit"
        disabled={isSubmitDisabled}
      >
        로그인
      </button>
    </form>
  )
}
