import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../layouts/AuthLayout'
import styles from './Login.module.css'

const API_BASE = "http://127.0.0.1:8000"

const Login = () => {
  const [formState, setFormState] = useState({ email: '', password: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormState((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (isSubmitting) return
    setIsSubmitting(true)

    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formState.email,
          password: formState.password,
        }),
      })

      if (!res.ok) {
        // intenta leer el detalle del backend si existe
        let detail = 'Invalid credentials'
        try {
          const err = await res.json()
          if (err?.detail) detail = Array.isArray(err.detail) ? err.detail[0]?.msg || 'Login failed' : err.detail
        } catch {}
        throw new Error(detail)
      }

      const data = await res.json() // { access_token, token_type }
      if (!data?.access_token) {
        throw new Error('No access token returned by server')
      }

      localStorage.setItem('access_token', data.access_token)
      navigate('/app', { replace: true })
    } catch (err) {
      // no cambiamos estilos: simple alerta
      window.alert(err.message || 'Login failed')
    } finally {
      setIsSubmitting(false)
    }
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