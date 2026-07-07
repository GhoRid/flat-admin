import CloseIcon from '@svgs/common/Cancel.svg?react'
import UserIcon from '@svgs/common/User.svg?react'
import CounselingManagementIcon from '@svgs/counseling/CounselingManagement.svg?react'
import FlatLogo from '@svgs/logos/FlatLogo.svg?react'
import DashBoardIcon from '@svgs/navigation/Dashboard.svg?react'
import InstructorManagementIcon from '@svgs/navigation/InstructorManagement.svg?react'
import MenuIcon from '@svgs/navigation/Menu.svg?react'
import NotificationActiveIcon from '@svgs/notification/NotificationActive.svg?react'
import NotificationDefaultIcon from '@svgs/notification/NotificationDefault.svg?react'
import StudentManagementIcon from '@svgs/student/StudentManagement.svg?react'
import { useLocation, useNavigate } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { authStore } from '../auth/authStore'

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
    icon: <StudentManagementIcon />,
  },
  {
    key: 'signup-requests',
    label: '가입 신청 관리',
    path: '/signup-requests',
    icon: <InstructorManagementIcon />,
    dividerAfter: true,
  },
  {
    key: 'notices',
    label: '공지사항 관리',
    path: '/notices',
    icon: <CounselingManagementIcon />,
  },
]

const extraCollapsedPathnames = new Set(['/counselings/journal/new'])

const extraCollapsedPathRegexes = [/^\/counselings\/journal\/\d+$/]

export default function MainLayout({ children }: MainLayoutProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const { logout } = authStore

  const pathname = normalizePath(location.pathname)
  const searchStr = (location as { searchStr?: string }).searchStr ?? ''

  const [profileOpen, setProfileOpen] = useState(false)

  const profileWrapRef = useRef<HTMLDivElement>(null)
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

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (!profileWrapRef.current) return

      if (!profileWrapRef.current.contains(e.target as Node)) {
        setProfileOpen(false)
      }
    }

    const onEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setProfileOpen(false)
      }
    }

    document.addEventListener('mousedown', onClickOutside)
    document.addEventListener('keydown', onEscape)

    return () => {
      document.removeEventListener('mousedown', onClickOutside)
      document.removeEventListener('keydown', onEscape)
    }
  }, [])

  const sideBarToggle = () => {
    if (sideBarOpenState === 'expanded') {
      setSideBarOpenState(initialSidebarState)
      return
    }

    setSideBarOpenState('expanded')
  }

  return (
    <div className="fixed flex h-screen w-screen min-w-[300px] flex-col overflow-hidden bg-app-white">
      <header className="relative flex h-[55px] items-center justify-between border-b border-app-gray100 px-[15px] max-[450px]:h-[72px] max-[450px]:px-5 max-[450px]:py-[15px]">
        <div className="flex items-center gap-[25px] max-[767px]:gap-[15px] max-[500px]:gap-2.5">
          <button
            ref={menuButtonRef}
            type="button"
            onClick={sideBarToggle}
            className="inline-flex size-9 items-center justify-center rounded-full p-0 leading-none transition-colors duration-200 hover:bg-app-gray50 [&_svg]:block [&_svg]:size-[22px]"
          >
            <div className="relative size-[22px]">
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

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            className="flex size-9 items-center justify-center rounded-full transition-colors duration-200 hover:bg-app-gray50"
          >
            {false ? <NotificationActiveIcon /> : <NotificationDefaultIcon />}
          </button>

          <button
            type="button"
            className="flex h-9 items-center justify-center rounded-[18px] border border-app-gray500 px-[15px] opacity-50"
          >
            <span className="text-14 text-app-gray500">원비 결제</span>
          </button>

          <button
            type="button"
            className="flex h-9 items-center justify-center rounded-[18px] bg-app-primary px-[15px]"
          >
            <span className="text-14">멤버십 결제</span>
          </button>

          <div ref={profileWrapRef} className="relative">
            <button
              type="button"
              onClick={() => setProfileOpen((prev) => !prev)}
              aria-expanded={profileOpen}
              className="flex size-9 items-center justify-center rounded-full bg-app-gray100 [&_svg]:text-app-gray500"
            >
              <UserIcon />
            </button>

            <div
              aria-hidden={!profileOpen}
              className={cn(
                'absolute right-0 top-[calc(100%+10px)] z-[9999] w-[250px] origin-top rounded-[10px] border border-app-gray100 bg-app-white p-5 shadow-[0_12px_30px_rgba(0,0,0,0.08)] transition-all duration-200',
                profileOpen
                  ? 'visible translate-y-0 scale-100 opacity-100 pointer-events-auto'
                  : 'invisible -translate-y-1.5 scale-[0.98] opacity-0 pointer-events-none',
              )}
            >
              <div className="flex items-center gap-2.5 py-2.5">
                <div className="grid size-[50px] place-items-center rounded-full bg-app-gray50 [&_svg]:size-[30px] [&_svg]:text-app-gray300">
                  <UserIcon />
                </div>

                <div className="flex flex-col justify-center gap-[5px]">
                  <div className="text-16 font-medium text-app-black">
                    이현재
                  </div>

                  <div className="py-[5px] text-12 text-app-gray500">
                    광주 피스트 북구점
                  </div>
                </div>
              </div>

              <div className="my-2.5 h-px bg-app-gray100" />

              <div className="flex flex-col gap-[5px]">
                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen(false)
                  }}
                  className="py-2.5 text-left text-14 text-app-gray300 transition-colors duration-200 hover:text-app-black"
                >
                  My
                </button>

                <button
                  type="button"
                  className="py-2.5 text-left text-14 text-app-gray300 transition-colors duration-200 hover:text-app-black"
                >
                  구독 관리
                </button>

                <button
                  type="button"
                  onClick={() => {
                    logout()
                    window.location.reload()
                  }}
                  className="py-2.5 text-left text-14 text-app-gray300 transition-colors duration-200 hover:text-app-black"
                >
                  로그아웃
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="relative flex flex-1">
        {isSideExpanded && (
          <div
            aria-hidden="true"
            onClick={() => setSideBarOpenState(initialSidebarState)}
            className="absolute inset-0 z-[998] bg-transparent"
          />
        )}

        <aside
          className={cn(
            'absolute left-0 top-0 z-[999] flex h-[calc(100vh-55px)] flex-col overflow-hidden border-r border-app-gray100 bg-app-white transition-[width] duration-[350ms] ease-in-out will-change-[width]',
            isSideExpanded
              ? 'w-[300px]'
              : initialSidebarState === 'collapsed'
                ? 'w-[66px]'
                : 'w-0',
          )}
        >
          <nav
            role="navigation"
            aria-label="사이드바 메뉴"
            className="flex flex-col px-[15px] py-5"
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
                      'flex h-9 w-full items-center gap-3 rounded-[10px] pr-[7px] text-app-black transition-all duration-[350ms] select-none',
                      isSideExpanded && 'mr-[30px]',
                      parentActive ? 'bg-app-gray50' : 'bg-transparent',
                      '[&_svg]:size-[22px] [&_svg]:transition-all [&_svg]:duration-[350ms]',
                      parentActive
                        ? '[&_svg]:opacity-100'
                        : '[&_svg]:opacity-20',
                      'hover:[&_span]:text-app-black hover:[&_span]:opacity-100 hover:[&_svg]:opacity-100',
                    )}
                  >
                    <div className="ml-[7px] grid size-[22px] flex-[0_0_22px] place-items-center [&_svg]:block [&_svg]:size-full">
                      {menu.icon}
                    </div>

                    <span
                      className={cn(
                        'inline-block overflow-hidden whitespace-nowrap text-14 font-medium text-app-black transition-all duration-[350ms]',
                        isSideExpanded
                          ? 'max-w-[200px] translate-x-0'
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
            initialSidebarState === 'collapsed' ? 'ml-[66px]' : 'ml-0',
          )}
        >
          {children}
        </div>
      </main>
    </div>
  )
}
