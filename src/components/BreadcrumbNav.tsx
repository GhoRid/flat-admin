import BackIcon from '@svgs/common/Back.svg?react'
import { Link, useNavigate } from '@tanstack/react-router'

export type BreadcrumbItem = {
  label: string
  to?: string
  replace?: boolean
}

type BreadcrumbNavProps = {
  items: BreadcrumbItem[]
  onBack?: () => void
  backTo?: string
  backReplace?: boolean
  fallbackTo?: string
  className?: string
}

export default function BreadcrumbNav({
  items,
  onBack,
  backTo,
  backReplace = false,
  fallbackTo = '/',
  className,
}: BreadcrumbNavProps) {
  const navigate = useNavigate()

  const handleBack = () => {
    if (onBack) return onBack()

    if (backTo) {
      navigate({ to: backTo, replace: backReplace })
      return
    }

    if (window.history.length > 1) {
      window.history.back()
      return
    }
    navigate({ to: fallbackTo })
  }

  const lastIndex = items.length - 1

  return (
    <div className={`flex items-center ${className ?? ''}`}>
      <button
        className="inline-flex size-8.5 items-center justify-center p-0 text-app-gray500"
        type="button"
        onClick={handleBack}
        aria-label="뒤로가기"
      >
        <BackIcon />
      </button>

      <nav aria-label="breadcrumb">
        <ol className="flex items-center justify-center">
          {items.map((item, idx) => {
            const isLast = idx === lastIndex

            return (
              <div className="flex items-center" key={`${item.label}-${idx}`}>
                <li className="flex" aria-current={isLast ? 'page' : undefined}>
                  {isLast ? (
                    <span className="text-14">{item.label}</span>
                  ) : item.to ? (
                    <Link
                      className="text-14 text-app-gray500 opacity-50"
                      to={item.to}
                      replace={item.replace}
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <button
                      className="p-0 text-14 text-app-gray500 opacity-50"
                      type="button"
                      onClick={handleBack}
                    >
                      {item.label}
                    </button>
                  )}
                </li>

                {!isLast && (
                  <span
                    className="mx-1.25 text-14 text-app-gray500 opacity-50"
                    aria-hidden="true"
                  >
                    /
                  </span>
                )}
              </div>
            )
          })}
        </ol>
      </nav>
    </div>
  )
}
