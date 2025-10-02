import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../layouts/AuthLayout'
import styles from './Login.module.css'

const API_BASE = "http://127.0.0.1:8000"

const Login = () => {
  const [formState, setFormState] = useState({ email: '', password: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loadingGitHub, setLoadingGitHub] = useState(false)
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
        credentials: 'include',           
        body: JSON.stringify({
          email: formState.email,
          password: formState.password,
        }),
      })

      if (!res.ok) {
        let detail = 'Invalid credentials'
        try {
          const err = await res.json()
          if (err?.detail) detail = Array.isArray(err.detail) ? err.detail[0]?.msg || 'Login failed' : err.detail
        } catch {}
        throw new Error(detail)
      }

      navigate('/app', { replace: true })
    } catch (err) {
      window.alert(err.message || 'Login failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGithubLogin = async () => {
    if (loadingGitHub) return
    try {
      setLoadingGitHub(true)
      const res = await fetch(`${API_BASE}/oauth/github/start?flow=login`, { method: 'GET' })
      if (!res.ok) throw new Error('GitHub login failed')
      const { authorize_url: authorizeUrl } = await res.json()
      if (!authorizeUrl) throw new Error('Missing authorization URL')
      window.location.href = authorizeUrl
    } catch (err) {
      alert(err.message || 'GitHub login failed')
    } finally {
      setLoadingGitHub(false)
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

      <button
        type="button"
        className={styles.githubButton}
        onClick={handleGithubLogin}
        disabled={loadingGitHub}
      >
        {loadingGitHub ? 'Connecting to GitHub...' : (
          <>
            <svg aria-hidden="true" viewBox="0 0 16 16" focusable="false" className={styles.githubIcon}>
              <path
                fill="currentColor"
                d="M8 0C3.58 0 0 3.58 0 8a8.002 8.002 0 005.47 7.59c.4.075.547-.173.547-.385 0-.19-.007-.693-.01-1.36-2.226.483-2.695-1.073-2.695-1.073-.364-.924-.89-1.17-.89-1.17-.727-.497.055-.487.055-.487.803.057 1.225.825 1.225.825.715 1.225 1.874.871 2.33.666.072-.518.28-.872.508-1.073-1.777-.202-3.644-.888-3.644-3.953 0-.873.312-1.586.823-2.146-.083-.202-.357-1.015.078-2.117 0 0 .672-.215 2.2.82a7.657 7.657 0 012.003-.27 7.65 7.65 0 012.003.27c1.527-1.035 2.198-.82 2.198-.82.437 1.102.163 1.915.08 2.117.513.56.821 1.273.821 2.146 0 3.073-1.87 3.748-3.653 3.946.288.247.544.735.544 1.48 0 1.068-.01 1.93-.01 2.192 0 .213.145.463.55.384A8.003 8.003 0 0016 8c0-4.42-3.58-8-8-8z"
              />
            </svg>
            Sign in with GitHub
          </>
        )}
      </button>
    </AuthLayout>
  )
}

export default Login
