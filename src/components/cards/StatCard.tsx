import type { JSX } from 'react'
import styles from './StatCard.module.css'

type StatCardProps = {
  title: string
  value: string | number
  helperText?: string
}

const StatCard = ({ title, value, helperText }: StatCardProps): JSX.Element => {
  return (
    <article className={styles.card}>
      <p className={styles.title}>{title}</p>
      <p className={styles.value}>{value}</p>
      {helperText ? <p className={styles.helper}>{helperText}</p> : null}
    </article>
  )
}

export default StatCard
