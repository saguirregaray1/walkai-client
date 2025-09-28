import { Outlet } from 'react-router-dom'
import Sidebar from '../components/sidebar/Sidebar'
import { DashboardIcon, UsersIcon } from '../components/icons'
import styles from './AdminLayout.module.css'

const navItems = [
  {
    label: 'Dashboard',
    icon: DashboardIcon,
    to: '/',
  },
  {
    label: 'Users',
    icon: UsersIcon,
    to: '/users',
  },
]

const AdminLayout = () => {
  return (
    <div className={styles.container}>
      <Sidebar items={navItems} title="Admin Console" />
      <main className={styles.main}>
        <div className={styles.content}>
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default AdminLayout
