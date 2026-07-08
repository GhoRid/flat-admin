import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import MainLayout from '../../layouts/MainLayout'

export const Route = createFileRoute('/_authedLayout')({
  beforeLoad: ({ context, location }) => {
    if (!context.auth?.isLoggedIn?.()) {
      throw redirect({
        to: '/login',
        search: { redirect: location.href },
      })
    }
  },
  component: AuthedLayoutRoute,
})

function AuthedLayoutRoute() {
  return (
    <MainLayout>
      <Outlet />
    </MainLayout>
  )
}
