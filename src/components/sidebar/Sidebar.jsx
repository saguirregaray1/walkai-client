import PropTypes from 'prop-types'
import { NavLink } from 'react-router-dom'
import styles from './Sidebar.module.css'

const Sidebar = ({ items, title }) => {
  return (
    <aside className={styles.sidebar}>
      {title ? <div className={styles.brand}>{title}</div> : null}
      <nav className={styles.nav} aria-label="Admin navigation">
        {items.map(({ label, icon: IconComponent, to }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              [styles.navItem, isActive ? styles.active : ''].join(' ').trim()
            }
          >
            <IconComponent className={styles.icon} aria-hidden title="" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}

Sidebar.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      icon: PropTypes.elementType.isRequired,
      to: PropTypes.string.isRequired,
    })
  ).isRequired,
  title: PropTypes.string,
}

Sidebar.defaultProps = {
  title: '',
}

export default Sidebar
