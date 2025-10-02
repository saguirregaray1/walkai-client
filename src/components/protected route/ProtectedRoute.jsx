import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const API_BASE = '/api'

export default function ProtectedRoute({ children }) {
  const [status, setStatus] = useState('loading')
  const navigate = useNavigate()

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const res = await fetch(`${API_BASE}/me`, {
          method: 'GET',
          credentials: 'include',
        })
        if (!alive) return
        if (res.ok) setStatus('ok')
        else if (res.status === 401) setStatus('unauth')
        else setStatus('unauth')
      } catch {
        if (alive) setStatus('unauth')
      }
    })()
    return () => { alive = false }
  }, [])

  useEffect(() => {
    if (status === 'unauth') navigate('/', { replace: true })
  }, [status, navigate])

  if (status === 'loading') {
    return <div style={{ padding: 24 }}>Checking session…</div>
  }
  return children
}