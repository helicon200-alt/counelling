import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import RequireRole from './components/RequireRole'
import AdminPage from './pages/AdminPage'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import MaterialDetailPage from './pages/MaterialDetailPage'
import MaterialsPage from './pages/MaterialsPage'
import NotFoundPage from './pages/NotFoundPage'
import PendingPage from './pages/PendingPage'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="pending" element={<PendingPage />} />
        <Route element={<RequireRole allow={['member', 'admin']} />}>
          <Route path="materials" element={<MaterialsPage />} />
          <Route path="materials/:id" element={<MaterialDetailPage />} />
        </Route>
        <Route element={<RequireRole allow={['admin']} />}>
          <Route path="admin" element={<AdminPage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
