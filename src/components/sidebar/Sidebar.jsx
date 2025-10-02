import PropTypes from 'prop-types'
import { NavLink } from 'react-router-dom'
import styles from './Sidebar.module.css'

const Sidebar = ({ items, title, onLogout, logoutLabel, logoutDisabled }) => {
  return (
    <aside className={styles.sidebar}>
      {title ? <div className={styles.brand}>{title}</div> : null}
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

Sidebar.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      icon: PropTypes.elementType.isRequired,
      to: PropTypes.string.isRequired,
      end: PropTypes.bool,
    })
  ).isRequired,
  title: PropTypes.string,
  onLogout: PropTypes.func,
  logoutLabel: PropTypes.string,
  logoutDisabled: PropTypes.bool,
}

Sidebar.defaultProps = {
  title: '',
  onLogout: undefined,
  logoutLabel: 'Log out',
  logoutDisabled: false,
}

export default Sidebar
