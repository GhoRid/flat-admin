import FileIcon from '@svgs/common/File.svg?react'
import { Download, Eye, Trash2 } from 'lucide-react'
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
  readOnly?: boolean
  fileName?: string
  fileUrl?: string
  onChange: (file: File | null, error?: string) => void
  onDragChange: (isDragging: boolean) => void
}

export default function UploadField({
  label,
  value,
  required = false,
  acceptedExtensions = DEFAULT_ACCEPTED_EXTENSIONS,
  readOnly = false,
  fileName,
  fileUrl,
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
    if (readOnly) return

    e.preventDefault()
    e.stopPropagation()
    onDragChange(true)
  }

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    if (readOnly) return

    e.preventDefault()
    e.stopPropagation()
    onDragChange(true)
  }

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    if (readOnly) return

    e.preventDefault()
    e.stopPropagation()

    const relatedTarget = e.relatedTarget as Node | null

    if (relatedTarget && e.currentTarget.contains(relatedTarget)) {
      return
    }

    onDragChange(false)
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    if (readOnly) return

    e.preventDefault()
    e.stopPropagation()

    onDragChange(false)
    setFile(e.dataTransfer.files[0])
  }

  const requiredError =
    required && !value.file && !fileUrl ? `${label} 파일을 업로드해 주세요.` : ''

  const error = value.error || requiredError
  const resolvedFileName = fileName || value.file?.name || label
  const hasFile = Boolean((value.file || fileUrl) && !error)
  const displayLabel = label ?? resolvedFileName

  const fileText = error
    ? error
    : hasFile
      ? (displayLabel ?? '')
      : label
        ? `${label} 파일이 존재하지 않습니다.`
        : '파일을 드래그하여 업로드하거나 파일을 선택해 주세요.'

  const handlePreview = () => {
    if (fileUrl) {
      window.open(fileUrl, '_blank', 'noopener,noreferrer')
      return
    }

    if (!value.file) return

    const url = URL.createObjectURL(value.file)
    window.open(url, '_blank', 'noopener,noreferrer')
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  const handleDownload = () => {
    if (fileUrl) {
      const link = document.createElement('a')
      link.href = fileUrl
      link.download = resolvedFileName || 'download'
      link.rel = 'noopener noreferrer'
      link.click()
      return
    }

    if (!value.file) return

    const url = URL.createObjectURL(value.file)
    const link = document.createElement('a')
    link.href = url
    link.download = value.file.name
    link.click()
    URL.revokeObjectURL(url)
  }

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

        {hasFile ? (
          <div className="mr-4 flex items-center gap-2">
            <button
              type="button"
              className="flex h-7 items-center gap-1 rounded-[10px] border border-app-gray100 bg-white px-2 text-sm text-app-gray500"
              onClick={handlePreview}
            >
              <Eye size={14} aria-hidden />
              미리보기
            </button>
            <button
              type="button"
              className="flex h-7 items-center gap-1 rounded-[10px] border border-app-gray100 bg-white px-2 text-sm text-app-gray500"
              onClick={handleDownload}
            >
              <Download size={14} aria-hidden />
              다운로드
            </button>
            {!readOnly && (
              <button
                type="button"
                className="flex size-7 items-center justify-center rounded-[10px] border border-app-gray100 bg-white text-app-gray500"
                aria-label="파일 삭제"
                onClick={() => onChange(null)}
              >
                <Trash2 size={16} aria-hidden />
              </button>
            )}
          </div>
        ) : readOnly ? null : (
          <button
            type="button"
            className="mr-4 h-7 rounded-[10px] border border-app-gray100 bg-white px-2 text-sm text-app-gray500"
            onClick={() => inputRef.current?.click()}
          >
            파일 선택
          </button>
        )}
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
