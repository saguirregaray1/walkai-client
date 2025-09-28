import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../layouts/AuthLayout'
import styles from './Login.module.css'

const Login = () => {
  const [formState, setFormState] = useState({ email: '', password: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormState((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    setIsSubmitting(true)

    window.setTimeout(() => {
      setIsSubmitting(false)
      // TODO: replace with real authentication when backend is ready
      navigate('/app', { replace: true })
    }, 1200)
  }

  return (
    <AuthLayout>
      <div className={styles.header}>
        <h2>Sign in</h2>
        <p>Use your admin credentials to continue.</p>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <label htmlFor="email">
          <span>Email</span>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            value={formState.email}
            onChange={handleChange}
            required
          />
        </label>

        <label htmlFor="password">
          <span>Password</span>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="Enter your password"
            value={formState.password}
            onChange={handleChange}
            required
          />
        </label>

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <footer className={styles.footer}>
        <Link to="/forgot-password">Forgot password?</Link>
      </footer>
    </AuthLayout>
  )
}

export default Login
