import '#/styles/global.css'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import ReactDOM from 'react-dom/client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { authStore } from './auth/authStore'
import Loading from './components/Loading'
import { routeTree } from './routeTree.gen'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
    },
  },
})

// Create a new router instance
const router = createRouter({
  routeTree,
  defaultPendingComponent: Loading,
  context: {
    auth: undefined! as typeof authStore,
    queryClient: undefined! as typeof queryClient,
  },
})

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

// Render the app
const rootElement = document.getElementById('root')!
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    // <StrictMode>
    <>
      <QueryClientProvider client={queryClient}>
        <RouterProvider
          router={router}
          context={{ auth: authStore, queryClient }}
        />
      </QueryClientProvider>
    </>,
    // </StrictMode>
  )
}
