import { Outlet, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import './styles.css'

export const Route = createRootRoute({
  component: () => (
    <div className="root-container">
      <Outlet />
      <TanStackRouterDevtools />
    </div>
  ),
})
