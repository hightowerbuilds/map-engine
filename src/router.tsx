import { createRootRoute, createRoute, createRouter } from '@tanstack/react-router'
import { HomePage } from './pages/HomePage'
import { NeighborhoodPage } from './pages/NeighborhoodPage'
import { BankingPage } from './pages/BankingPage'
import { SignUpPage } from './pages/SignUpPage'

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

const bankingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/banking',
  component: BankingPage,
})

const signupRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/signup',
  component: SignUpPage,
})

// Create the route tree
const routeTree = rootRoute.addChildren([
  indexRoute,
  neighborhoodRoute,
  bankingRoute,
  signupRoute,
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