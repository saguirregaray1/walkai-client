import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'

const API_BASE = '/api'

export default function ProtectedRoute({ children }) {
  const navigate = useNavigate()

  const sessionQuery = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/me`, {
        method: 'GET',
        credentials: 'include',
      })

      if (res.status === 401) {
        const error = new Error('Unauthorized')
        error.code = 'unauth'
        throw error
      }

      if (!res.ok) {
        const error = new Error('Failed to verify session')
        error.code = 'error'
        throw error
      }

      return res.json()
    },
    retry: false,
  })

  useEffect(() => {
    if (sessionQuery.isError) navigate('/', { replace: true })
  }, [sessionQuery.isError, navigate])

  if (sessionQuery.isPending) {
    return <div style={{ padding: 24 }}>Checking session…</div>
  }
  if (sessionQuery.isError) return null
  return children
}
