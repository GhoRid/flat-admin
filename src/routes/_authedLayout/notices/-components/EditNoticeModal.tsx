import DropDownSection from '#/components/inputSections/DropDownSection'
import NormalSection from '#/components/inputSections/NormalSection'
import CustomBaseModal from '#/components/modal/CustomBaseModal'
import CancelIcon from '@svgs/common/Cancel.svg?react'
import { Controller, useFormContext } from 'react-hook-form'
import type { NoticeType } from './NoticeRow'

export type NoticeFormValues = {
  type: NoticeType
  title: string
  content: string
}

export type BasicModalProps = {
  isOpen: boolean
  onClose: () => void
  onSubmit: (values: NoticeFormValues) => void | Promise<void>

  title: string

  closeButtonVisible?: boolean
  closeTimeoutMS?: number
}

export default function EditNoticeModal({
  isOpen,
  onClose,
  onSubmit,
  title,

  closeButtonVisible = true,
  closeTimeoutMS = 180,
}: BasicModalProps) {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useFormContext<NoticeFormValues>()

  const typeOptions: { id: NoticeType; label: string }[] = [
    { id: 'notice', label: '공지' },
    { id: 'inspection', label: '점검' },
    { id: 'update', label: '업데이트' },
  ]

  return (
    <CustomBaseModal
      isOpen={isOpen}
      onClose={onClose}
      closeTimeoutMS={closeTimeoutMS}
      overlayZIndex={99999999998}
    >
      <form
        className="flex w-112.5 flex-col gap-5 p-5"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        <div className="relative flex items-center justify-center">
          <p className="text-18 font-medium">{title}</p>

          {closeButtonVisible && (
            <button
              type="button"
              onClick={onClose}
              aria-label="닫기"
              className="absolute right-0 top-0"
            >
              <CancelIcon />
            </button>
          )}
        </div>

        <Controller
          control={control}
          name="type"
          rules={{ required: '공지사항 유형을 선택해주세요.' }}
          render={({ field }) => (
            <div>
              <DropDownSection
                id="notice-type"
                title="유형"
                options={typeOptions}
                placeholder="공지사항 유형을 선택해주세요."
                checkIconVisible={true}
                value={
                  typeOptions.find((option) => option.id === field.value) ??
                  null
                }
                onChange={(next) => field.onChange(next.id)}
              />
              {!!errors.type?.message && (
                <p className="mt-1.5 text-12 text-app-red">
                  {errors.type.message}
                </p>
              )}
            </div>
          )}
        />

        <Controller
          control={control}
          name="title"
          rules={{ required: '공지사항 제목을 입력해주세요.' }}
          render={({ field }) => (
            <NormalSection
              title="제목"
              placeholder="공지사항 제목을 입력해주세요."
              value={field.value}
              onChange={field.onChange}
              errorMessage={errors.title?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="content"
          rules={{ required: '공지사항 내용을 입력해주세요.' }}
          render={({ field }) => (
            <section>
              <h3 className="mb-2.5 text-14 text-app-gray500">내용</h3>
              <textarea
                className={[
                  'h-30 w-full resize-none rounded-[10px] border px-2.5 py-3 text-14 text-app-black outline-none placeholder:text-app-gray500 placeholder:opacity-50 focus:border-app-black',
                  errors.content ? 'border-app-red' : 'border-app-gray100',
                ].join(' ')}
                placeholder="공지사항 내용을 입력해주세요."
                value={field.value}
                onChange={field.onChange}
              />
              {!!errors.content?.message && (
                <p className="mt-1.5 text-12 text-app-red">
                  {errors.content.message}
                </p>
              )}
            </section>
          )}
        />

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onClose}
            className="h-10 rounded-[10px] bg-app-gray50 text-14 font-medium text-app-black transition-opacity hover:opacity-92"
          >
            취소
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="h-10 rounded-[10px] bg-app-primary text-14 font-medium text-app-black transition-opacity hover:opacity-92 disabled:opacity-50"
          >
            저장
          </button>
        </div>
      </form>
    </CustomBaseModal>
  )
}
