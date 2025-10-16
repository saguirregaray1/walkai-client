import type { ComponentType, JSX, SVGProps } from 'react'
import { NavLink } from 'react-router-dom'
import styles from './Sidebar.module.css'

type SidebarIconProps = Omit<SVGProps<SVGSVGElement>, 'ref'> & {
  size?: number
  title?: string
}

export type SidebarNavItem = {
  label: string
  icon: ComponentType<SidebarIconProps>
  to: string
  end?: boolean
}

type SidebarProps = {
  items: SidebarNavItem[]
  title?: string
  userEmail?: string
  onLogout?: () => void
  logoutLabel?: string
  logoutDisabled?: boolean
}

const Sidebar = ({
  items,
  title,
  userEmail,
  onLogout,
  logoutLabel = 'Log out',
  logoutDisabled = false,
}: SidebarProps): JSX.Element => {
  return (
    <aside className={styles.sidebar}>
      {title || userEmail ? (
        <div className={styles.identity}>
          {title ? <div className={styles.brand}>{title}</div> : null}
          {userEmail ? <div className={styles.userEmail}>{userEmail}</div> : null}
        </div>
      ) : null}
      <nav className={styles.nav} aria-label="Admin navigation">
        {items.map(({ label, icon: IconComponent, to, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              [styles.navItem, isActive ? styles.active : ''].join(' ').trim()
            }
          >
            <IconComponent className={styles.icon} aria-hidden title="" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
      {onLogout ? (
        <button
          type="button"
          className={styles.logoutButton}
          onClick={onLogout}
          disabled={logoutDisabled}
        >
          {logoutLabel}
        </button>
      ) : null}
    </aside>
  )
}

export default Sidebar
