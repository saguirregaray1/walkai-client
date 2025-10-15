import { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import Sidebar from '../components/sidebar/Sidebar'
import { DashboardIcon, UsersIcon } from '../components/icons'
import styles from './AdminLayout.module.css'

const API_BASE = '/api'

const navItems = [
  {
    label: 'Dashboard',
    icon: DashboardIcon,
    to: '/app',
    end: true,
  },
  {
    label: 'Users',
    icon: UsersIcon,
    to: '/app/users',
  },
]

const AdminLayout = () => {
  const navigate = useNavigate()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    if (isLoggingOut) return
    setIsLoggingOut(true)
    try {
      const response = await fetch(`${API_BASE}/logout`, {
        method: 'POST',
        credentials: 'include',
      })
      if (!response.ok) {
        console.warn('Logout request failed', response.status)
      }
    } catch (error) {
      console.error('Logout request failed', error)
    } finally {
      setIsLoggingOut(false)
      navigate('/', { replace: true })
    }
  }

  return (
    <div className={styles.container}>
      <Sidebar
        items={navItems}
        title="Walk:AI"
        onLogout={handleLogout}
        logoutLabel={isLoggingOut ? 'Logging out...' : 'Log out'}
        logoutDisabled={isLoggingOut}
      />
      <main className={styles.main}>
        <div className={styles.content}>
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default AdminLayout
