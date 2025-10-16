import type { JSX, ReactNode } from 'react'
import styles from './AuthLayout.module.css'

type AuthLayoutProps = {
  children: ReactNode
}

const AuthLayout = ({ children }: AuthLayoutProps): JSX.Element => {
  return (
    <div className={styles.container}>
      <section className={styles.card}>
        <div className={styles.branding}>
          <h1>Walk:AI</h1>
          <p>Side by side with your GPU. We keep moving, step by step, closer to the target.</p>
        </div>
        <div className={styles.content}>{children}</div>
      </section>
    </div>
  )
}

export default AuthLayout
