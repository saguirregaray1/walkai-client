import { useMutation } from '@tanstack/react-query'
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

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`${API_BASE}/logout`, {
        method: 'POST',
        credentials: 'include',
      })
      if (!response.ok) {
        const error = new Error(`Logout request failed (${response.status})`)
        error.status = response.status
        throw error
      }
    },
  })

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync()
    } catch (error) {
      console.warn('Logout request failed', error)
    } finally {
      navigate('/', { replace: true })
    }
  }

  const isLoggingOut = logoutMutation.isPending

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
