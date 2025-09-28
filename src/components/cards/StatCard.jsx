import PropTypes from 'prop-types'
import styles from './StatCard.module.css'

const StatCard = ({ title, value, helperText }) => {
  return (
    <article className={styles.card}>
      <p className={styles.title}>{title}</p>
      <p className={styles.value}>{value}</p>
      {helperText ? <p className={styles.helper}>{helperText}</p> : null}
    </article>
  )
}

StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  helperText: PropTypes.string,
}

StatCard.defaultProps = {
  helperText: '',
}

export default StatCard
