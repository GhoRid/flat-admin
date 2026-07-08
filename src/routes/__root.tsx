import type { authStore } from '#/auth/authStore'
import type { queryClient } from '#/main'
import { Outlet, createRootRouteWithContext } from '@tanstack/react-router'

export type RouterContext = {
  auth: typeof authStore
  queryClient: typeof queryClient
}

export const Route = createRootRouteWithContext<RouterContext>()({
  // beforeLoad: ({ context, location }) => {
  //   if (!context.auth?.isLoggedIn?.()) {
  //     throw redirect({
  //       to: "/login",
  //       search: { redirect: location.href },
  //     });
  //   }
  // },
  component: () => <Outlet />,
})
