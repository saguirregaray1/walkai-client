import PropTypes from 'prop-types'
import styles from './AuthLayout.module.css'

const AuthLayout = ({ children }) => {
  return (
    <div className={styles.container}>
      <section className={styles.card}>
        <div className={styles.branding}>
          <h1>Walk:AI Admin</h1>
          <p>Access the control center to manage your platform.</p>
        </div>
        <div className={styles.content}>{children}</div>
      </section>
    </div>
  )
}

AuthLayout.propTypes = {
  children: PropTypes.node.isRequired,
}

export default AuthLayout
