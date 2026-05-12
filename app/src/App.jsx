import { createBrowserRouter, RouterProvider, Outlet, useLocation } from 'react-router-dom'
import AppHeader from './components/AppHeader'
import AppFooter from './components/AppFooter'
import { HOSPITAL_CLIENTS } from './data'
import OrdersLanding from './screens/OrdersLanding'
import BuildOrder from './screens/BuildOrder'
import OrderSubmitted from './screens/OrderSubmitted'
import OrderView from './screens/OrderView'

function AppShell() {
  const location = useLocation()

  // Show persistent client chip when on build or submitted screens
  const isBuildPath = location.pathname.includes('/build')
  const isSubmittedPath = location.pathname.includes('/submitted')
  let clientName = null

  if (isBuildPath || isSubmittedPath) {
    const order = location.state?.order
    if (order) {
      clientName = HOSPITAL_CLIENTS.find(c => c.id === order.clientId)?.name || null
    }
  }

  return (
    <div className="page">
      <AppHeader clientName={clientName} />
      <Outlet />
      <AppFooter />
    </div>
  )
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true,                           element: <OrdersLanding /> },
      { path: 'orders/new',                    element: <OrdersLanding /> },
      { path: 'orders/:draftId/build',         element: <BuildOrder /> },
      { path: 'orders/:orderId/submitted',     element: <OrderSubmitted /> },
      { path: 'orders/:orderId/view',          element: <OrderView /> },
    ],
  },
], { basename: import.meta.env.BASE_URL })

export default function App() {
  return <RouterProvider router={router} />
}
