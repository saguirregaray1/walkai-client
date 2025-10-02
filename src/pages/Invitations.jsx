import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import AuthLayout from '../layouts/AuthLayout'
import styles from './Invitations.module.css'

const API_BASE = 'http://127.0.0.1:8000'

const Invitations = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const [status, setStatus] = useState('loading') 
  const [email, setEmail] = useState('')
  const [err, setErr] = useState(null)  
  const [loadingGitHub, setLoadingGitHub] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const invitationToken = searchParams.get('token')

  useEffect(() => {
    const verify = async () => {
      if (!invitationToken) {
        setStatus('no-token')
        return
      }
      try {
        const res = await fetch(`${API_BASE}/invitations/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: invitationToken })
        })

        if (res.status === 400) {
          setStatus('expired')
          return
        }
        if (!res.ok) {
          setStatus('error')
          return
        }

        const data = await res.json()
        setEmail(data.email || '')
        setStatus('ok')

        window.history.replaceState({}, document.title, window.location.pathname)
      } catch (e) {
        setStatus('error')
      }
    }

    verify()
  }, [invitationToken])

  const [formState, setFormState] = useState({ password: '', confirmPassword: '' })
  const handleChange = (event) => {
    const { name, value } = event.target
    setFormState((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setErr(null)

    if (formState.password.trim().length < 8) {
      alert('Password must be at least 8 characters long.')
      return
    }

    if (formState.password !== formState.confirmPassword) {
      alert('Passwords do not match.')
      return
    }

    try {
      setSubmitting(true)
      const res = await fetch(`${API_BASE}/invitations/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: invitationToken, password: formState.password })
      })

      if (res.status === 201) {
        alert('Account created')
        navigate('/')
        return
      }

      if (res.status === 409) {
        setErr('Account already exists for this invitation.')
      } else if (res.status === 400) {
        setErr('Invalid or expired invitation.')
        setStatus('expired')
      }
    } catch (e) {
      setErr(e?.message || 'Network error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleGithubSignup = async () => {
    setErr(null)
    if (!invitationToken) {
      setErr('Missing invitation token in URL'); return
    }
    try {
      setLoadingGitHub(true)
      const url = `${API_BASE}/oauth/github/start?invitation_token=${encodeURIComponent(invitationToken)}&flow=register`
      const res = await fetch(url, { method: 'GET' })
      if (!res.ok) throw new Error(`start failed: ${res.status}`)
      const { authorize_url } = await res.json()
      window.location.href = authorize_url
    } catch (e) {
      setErr(e.message || 'GitHub start failed')
    } finally {
      setLoadingGitHub(false)
    }
  }

  if (status === 'loading') {
    return <AuthLayout><p className={styles.info}>Checking your invitation…</p></AuthLayout>
  }

  if (status === 'expired' || status === 'no-token') {
    return (
      <AuthLayout>
        <div className={styles.header}>
          <h2>Invitation not available</h2>
          <p className={styles.error}>
            {status === 'expired' ? 'Your invitation has expired or was already used' : 'Missing invitation token.'}
          </p>
          <button onClick={() => navigate('/')}>Go to login</button>
        </div>
      </AuthLayout>
    )
  }

  if (status === 'error') {
    return (
      <AuthLayout>
        <div className={styles.header}>
          <h2>Something went wrong</h2>
          <p className={styles.error}>Please try again later.</p>
          <button onClick={() => navigate('/')}>Go to login</button>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <div className={styles.header}>
        <h2>Accept your invitation</h2>
        <p>Hi <span className={styles.email}>{email}</span> you have been invited to walk:ai</p>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <label htmlFor="password">
          <span>Password</span>
          <input
            id="password"
            name="password"
            type="password"
            placeholder="Create a password"
            autoComplete="new-password"
            value={formState.password}
            onChange={handleChange}
            required
          />
        </label>

        <label htmlFor="confirmPassword">
          <span>Confirm password</span>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            placeholder="Repeat your password"
            autoComplete="new-password"
            value={formState.confirmPassword}
            onChange={handleChange}
            required
          />
        </label>

        <button type="submit" disabled={submitting}>
          {submitting ? 'Creating account…' : 'Register'}
        </button>
      </form>

      <button type="button" className={styles.githubButton} onClick={handleGithubSignup} disabled={loadingGitHub}>
        {loadingGitHub ? 'Contacting GitHub…' : (
          <>
            <svg aria-hidden="true" viewBox="0 0 16 16" focusable="false" className={styles.githubIcon}>
              <path fill="currentColor" d="M8 0C3.58 0 0 3.58 0 8a8.002 8.002 0 005.47 7.59c.4.075.547-.173.547-.385 0-.19-.007-.693-.01-1.36-2.226.483-2.695-1.073-2.695-1.073-.364-.924-.89-1.17-.89-1.17-.727-.497.055-.487.055-.487.803.057 1.225.825 1.225.825.715 1.225 1.874.871 2.33.666.072-.518.28-.872.508-1.073-1.777-.202-3.644-.888-3.644-3.953 0-.873.312-1.586.823-2.146-.083-.202-.357-1.015.078-2.117 0 0 .672-.215 2.2.82a7.657 7.657 0 012.003-.27 7.65 7.65 0 012.003.27c1.527-1.035 2.198-.82 2.198-.82.437 1.102.163 1.915.08 2.117.513.56.821 1.273.821 2.146 0 3.073-1.87 3.748-3.653 3.946.288.247.544.735.544 1.48 0 1.068-.01 1.93-.01 2.192 0 .213.145.463.55.384A8.003 8.003 0 0016 8c0-4.42-3.58-8-8-8z" />
            </svg>
            Sign up with GitHub
          </>
        )}
      </button>

      {err && <p className={styles.error}>{err}</p>}
    </AuthLayout>
  )
}

export default Invitations
