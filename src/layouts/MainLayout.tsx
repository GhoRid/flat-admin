import CloseIcon from '@svgs/common/Cancel.svg?react'
import FlatLogo from '@svgs/logos/FlatLogo.svg?react'
import DashBoardIcon from '@svgs/navigation/Dashboard.svg?react'
import MenuIcon from '@svgs/navigation/Menu.svg?react'
import PeopleIcon from '@svgs/person/people.svg?react'
import PersonInCircleIcon from '@svgs/person/PersonInCircle.svg?react'
import TalkIcon from '@svgs/talk.svg?react'
import { useLocation, useNavigate } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { useMemo, useRef, useState } from 'react'

type MenuItem = {
  key: string
  label: string
  path: string
  icon: ReactNode
  dividerAfter?: boolean
}

type SidebarState = 'expanded' | 'collapsed' | 'hidden'

type MainLayoutProps = {
  children: ReactNode
}

const cn = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(' ')

const normalizePath = (p: string) => p.replace(/\/$/, '')

const menus: MenuItem[] = [
  {
    key: 'dashboard',
    label: '대시보드',
    path: '/dashboard',
    icon: <DashBoardIcon />,
    dividerAfter: true,
  },
  {
    key: 'members',
    label: '회원 관리',
    path: '/members',
    icon: <PersonInCircleIcon />,
  },
  {
    key: 'signup-requests',
    label: '가입 신청 관리',
    path: '/signup-requests',
    icon: <PeopleIcon />,
    dividerAfter: true,
  },
  {
    key: 'notices',
    label: '공지사항 관리',
    path: '/notices',
    icon: <TalkIcon />,
  },
]

const extraCollapsedPathnames = new Set(['/counselings/journal/new'])

const extraCollapsedPathRegexes = [/^\/counselings\/journal\/\d+$/]

export default function MainLayout({ children }: MainLayoutProps) {
  const location = useLocation()
  const navigate = useNavigate()
  // const { logout } = authStore

  const pathname = normalizePath(location.pathname)
  const searchStr = (location as { searchStr?: string }).searchStr ?? ''

  const menuButtonRef = useRef<HTMLButtonElement>(null)

  const menuPathSet = useMemo(() => {
    const paths = menus.map((m) => m.path)

    return new Set(paths.map(normalizePath))
  }, [])

  const initialSidebarState: SidebarState = useMemo(() => {
    const qs = searchStr.startsWith('?') ? searchStr.slice(1) : searchStr
    const view = new URLSearchParams(qs).get('view')

    const isExtraCollapsedMatch =
      view === 'panel' &&
      (extraCollapsedPathnames.has(pathname) ||
        extraCollapsedPathRegexes.some((re) => re.test(pathname)))

    const isExactMatch = menuPathSet.has(pathname) || isExtraCollapsedMatch

    const isDepartmentsMatch = menus.some((m) => {
      const base = normalizePath(m.path)
      return pathname.startsWith(base + '/departments/')
    })

    return isExactMatch || isDepartmentsMatch ? 'collapsed' : 'hidden'
  }, [pathname, searchStr, menuPathSet])

  const [sideBarOpenState, setSideBarOpenState] =
    useState<SidebarState>(initialSidebarState)

  const isSideExpanded = sideBarOpenState === 'expanded'

  const sideBarToggle = () => {
    if (sideBarOpenState === 'expanded') {
      setSideBarOpenState(initialSidebarState)
      return
    }

    setSideBarOpenState('expanded')
  }

  return (
    <div className="fixed flex h-screen w-screen min-w-75 flex-col overflow-hidden bg-app-white">
      <header className="relative flex h-13.75 items-center justify-between border-b border-app-gray100 px-4 mb:h-[72px] max-[450px]:px-5 mb:py-[15px]">
        <div className="flex items-center gap-6 max-[767px]:gap-4 max-[500px]:gap-2.5">
          <button
            ref={menuButtonRef}
            type="button"
            onClick={sideBarToggle}
            className="inline-flex size-9 items-center justify-center rounded-full p-0 leading-none transition-colors duration-200 hover:bg-app-gray50 [&_svg]:block [&_svg]:size-5.5"
          >
            <div className="relative size-5.5">
              <MenuIcon
                className={cn(
                  'absolute inset-0 block size-full origin-center transition-all duration-300',
                  isSideExpanded
                    ? 'scale-[0.8] rotate-90 opacity-0'
                    : 'scale-100 rotate-0 opacity-100',
                )}
              />

              <CloseIcon
                className={cn(
                  'absolute inset-0 block size-full origin-center transition-all duration-300',
                  isSideExpanded
                    ? 'scale-100 rotate-0 opacity-100'
                    : 'scale-[0.8] -rotate-90 opacity-0',
                )}
              />
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              if (location.pathname === '/') {
                window.location.reload()
              } else {
                navigate({ to: '/' })
              }
            }}
            className="flex items-center gap-4 text-app-black"
          >
            <FlatLogo width={64} height={15} />
            <span className="text-16 font-medium">Admin System</span>
          </button>
        </div>

        <button
          type="button"
          className="flex h-9 items-center justify-center rounded-[18px] border border-app-gray500 px-4 opacity-50"
        >
          <span className="text-14 text-app-gray500">로그아웃</span>
        </button>
      </header>

      <main className="relative flex flex-1">
        {isSideExpanded && (
          <div
            aria-hidden="true"
            onClick={() => setSideBarOpenState(initialSidebarState)}
            className="absolute inset-0 z-998 bg-transparent"
          />
        )}

        <aside
          className={cn(
            'absolute left-0 top-0 z-999 flex h-[calc(100vh-55px)] flex-col overflow-hidden border-r border-app-gray100 bg-app-white transition-[width] duration-350ms ease-in-out will-change-[width]',
            isSideExpanded
              ? 'w-75'
              : initialSidebarState === 'collapsed'
                ? 'w-16.5'
                : 'w-0',
          )}
        >
          <nav
            role="navigation"
            aria-label="사이드바 메뉴"
            className="flex flex-col px-4 py-5"
          >
            {menus.map((menu) => {
              const parentActive =
                pathname === normalizePath(menu.path) ||
                pathname.startsWith(normalizePath(menu.path) + '/')

              return (
                <div key={menu.key} className="flex flex-col">
                  <button
                    type="button"
                    onClick={() => {
                      navigate({ to: menu.path })
                      setSideBarOpenState(initialSidebarState)
                    }}
                    className={cn(
                      'flex h-9 w-full items-center gap-3 rounded-[10px] pr-ㅇ1.75 text-app-black transition-all duration-350 select-none',
                      isSideExpanded && 'mr-7.5',
                      parentActive ? 'bg-app-gray50' : 'bg-transparent',
                      '[&_svg]:size-5.5 [&_svg]:transition-all [&_svg]:duration-350',
                      parentActive
                        ? '[&_svg]:opacity-100'
                        : '[&_svg]:opacity-20',
                      'hover:[&_span]:text-app-black hover:[&_span]:opacity-100 hover:[&_svg]:opacity-100',
                    )}
                  >
                    <div className="ml-1.75 grid size-5.5 flex-[0_0_22px] place-items-center [&_svg]:block [&_svg]:size-full">
                      {menu.icon}
                    </div>

                    <span
                      className={cn(
                        'inline-block overflow-hidden whitespace-nowrap text-14 font-medium text-app-black transition-all duration-350',
                        isSideExpanded
                          ? 'max-w-50 translate-x-0'
                          : 'max-w-0 -translate-x-1.5',
                        isSideExpanded
                          ? parentActive
                            ? 'opacity-100'
                            : 'opacity-20'
                          : 'opacity-0',
                      )}
                    >
                      {menu.label}
                    </span>
                  </button>

                  {menu.dividerAfter && (
                    <div
                      aria-hidden="true"
                      className="h-px bg-app-gray100  my-2.5 w-full mx-auto"
                    />
                  )}
                </div>
              )
            })}
          </nav>
        </aside>

        <div
          className={cn(
            'h-[calc(100vh-55px)] w-full flex-1 overflow-auto',
            initialSidebarState === 'collapsed' ? 'ml-16.5' : 'ml-0',
          )}
        >
          {children}
        </div>
      </main>
    </div>
  )
}
