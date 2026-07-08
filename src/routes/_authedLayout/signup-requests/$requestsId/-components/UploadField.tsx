import FileIcon from '@svgs/common/File.svg?react'
import type { ChangeEvent, DragEvent } from 'react'
import { useRef } from 'react'

const DEFAULT_ACCEPTED_EXTENSIONS = ['pdf', 'png', 'jpeg', 'jpg']
const MAX_FILE_SIZE = 10 * 1024 * 1024

export type UploadState = {
  file: File | null
  error: string
  isDragging: boolean
}

type UploadFieldProps = {
  label?: string
  value: UploadState
  required?: boolean
  acceptedExtensions?: string[]
  onChange: (file: File | null, error?: string) => void
  onDragChange: (isDragging: boolean) => void
}

export default function UploadField({
  label,
  value,
  required = false,
  acceptedExtensions = DEFAULT_ACCEPTED_EXTENSIONS,
  onChange,
  onDragChange,
}: UploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const accept = acceptedExtensions
    .map((extension) => `.${extension}`)
    .join(',')

  const acceptLabel = acceptedExtensions
    .map((extension) => extension.toUpperCase())
    .join(', ')

  const setFile = (file?: File) => {
    if (!file) return

    const error = validateFile(file, acceptedExtensions, acceptLabel)
    onChange(error ? null : file, error)
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0])
    e.target.value = ''
  }

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    onDragChange(true)
  }

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    onDragChange(true)
  }

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()

    const relatedTarget = e.relatedTarget as Node | null

    if (relatedTarget && e.currentTarget.contains(relatedTarget)) {
      return
    }

    onDragChange(false)
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()

    onDragChange(false)
    setFile(e.dataTransfer.files?.[0])
  }

  const requiredError =
    required && !value.file ? `${label} 파일을 업로드해 주세요.` : ''

  const error = value.error || requiredError

  const fileText = error
    ? error
    : value.file
      ? (label ?? value.file.name)
      : label
        ? `${label} 파일이 존재하지 않습니다.`
        : '파일을 드래그하여 업로드하거나 파일을 선택해 주세요.'

  return (
    <div className="flex flex-col gap-3">
      <div
        className={[
          'grid h-16 grid-cols-[64px_1fr_auto] items-center overflow-hidden rounded-[10px] border border-app-gray100 bg-white transition-colors duration-150',
          error
            ? 'border-app-red'
            : value.isDragging
              ? 'border-app-primary bg-app-gray100'
              : 'border-app-gray50',
        ].join(' ')}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={handleInputChange}
        />

        <div className="flex h-full w-full items-center justify-center border-r border-app-gray100">
          <FileIcon aria-hidden />
        </div>

        <span className="min-w-0 overflow-hidden truncate whitespace-nowrap px-4.5 text-base text-app-gray500">
          {fileText}
        </span>

        <button
          type="button"
          className="mr-4 h-7 rounded-[10px] border border-app-gray100 bg-white px-2 text-sm text-app-gray500"
          onClick={() => inputRef.current?.click()}
        >
          파일 선택
        </button>
      </div>

      {/* {value.error && (
        <p className="text-base leading-[1.4] text-app-red">{value.error}</p>
      )} */}
    </div>
  )
}

const validateFile = (
  file: File,
  acceptedExtensions: string[],
  acceptLabel: string,
) => {
  const extension = file.name.split('.').pop()?.toLowerCase() ?? ''

  if (file.size > MAX_FILE_SIZE) {
    return '파일 용량은 최대 10MB까지 업로드할 수 있습니다.'
  }

  if (!acceptedExtensions.includes(extension)) {
    return `지원하지 않는 파일 형식입니다. ${acceptLabel} 파일을 선택해 주세요.`
  }

  return ''
}
