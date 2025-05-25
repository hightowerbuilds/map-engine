import { createRootRoute, createRoute, createRouter } from '@tanstack/react-router'
import { HomePage } from './pages/HomePage'
import { NeighborhoodPage } from './pages/NeighborhoodPage'
import { SignUpPage } from './pages/SignUpPage'
import { DashboardPage } from './pages/DashboardPage'
import { UploadPage } from './pages/UploadPage'

// Create the root route
const rootRoute = createRootRoute()

// Create child routes
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
})

const neighborhoodRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/neighborhood',
  component: NeighborhoodPage,
})

const signupRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/signup',
  component: SignUpPage,
})

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: DashboardPage,
})

const uploadRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/upload',
  component: UploadPage,
})

// Create the route tree
const routeTree = rootRoute.addChildren([
  indexRoute,
  neighborhoodRoute,
  signupRoute,
  dashboardRoute,
  uploadRoute,
])

// Create and export the router
export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  defaultPreloadStaleTime: 0,
})

// Register the router for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
} 