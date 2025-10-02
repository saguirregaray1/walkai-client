import { Navigate, Route, Routes } from 'react-router-dom'
import AdminLayout from './layouts/AdminLayout'
import Dashboard from './pages/Dashboard'
import Invitations from './pages/Invitations'
import Login from './pages/Login'
import Users from './pages/Users'

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/invitations" element={<Invitations />} />
      <Route path="/app" element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="users" element={<Users />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
