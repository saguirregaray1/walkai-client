import { Navigate, Route, Routes } from 'react-router-dom'
import AdminLayout from './layouts/AdminLayout'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Users from './pages/Users'

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/app" element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="users" element={<Users />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
