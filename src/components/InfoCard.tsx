import type { ReactNode } from 'react'

export type InfoCardItem = {
  id: string
  icon: ReactNode
  label: ReactNode
}

type InfoCardProps = {
  title: string
  items: InfoCardItem[]
}

export default function InfoCard({ title, items }: InfoCardProps) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-14 font-medium text-app-gray500">{title}</h2>

      <div className="overflow-hidden rounded-xl border border-app-gray100 bg-app-white">
        {items.map((item, index) => (
          <div key={item.id}>
            <div className="flex min-h-14 items-center gap-3 px-5 py-2.5">
              <span className="flex shrink-0 items-center justify-center text-app-gray300 ">
                {item.icon}
              </span>

              <span className="min-w-0 flex-1 break-keep text-14 leading-5 ">
                {item.label}
              </span>
            </div>

            {index < items.length - 1 && (
              <div aria-hidden="true" className="mx-5 h-px bg-app-gray100" />
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
