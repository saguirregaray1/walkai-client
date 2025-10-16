import type { JSX } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import AdminLayout from './layouts/AdminLayout'
import Invitations from './pages/Invitations'
import Jobs from './pages/Jobs'
import Login from './pages/Login'
import Users from './pages/Users'
import ProtectedRoute from './components/protected route/ProtectedRoute'

const App = (): JSX.Element => {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/invitations" element={<Invitations />} />

      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="users" replace />} />
        <Route path="users" element={<Users />} />
        <Route path="jobs" element={<Jobs />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
