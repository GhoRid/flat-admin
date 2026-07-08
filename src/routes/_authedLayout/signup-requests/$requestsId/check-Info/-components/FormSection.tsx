import type { ReactNode } from 'react'

type FormSectionProps = {
  label: string
  children: ReactNode
}

export default function FormSection({ label, children }: FormSectionProps) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-14 font-medium text-app-gray500">{label}</p>
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  )
}
