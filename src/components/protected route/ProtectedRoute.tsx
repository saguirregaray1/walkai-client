import { useEffect } from 'react'
import type { ReactElement } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'

const API_BASE = '/api'

type SessionErrorCode = 'unauth' | 'error'

type SessionError = Error & { code: SessionErrorCode }

const createSessionError = (message: string, code: SessionErrorCode): SessionError =>
  Object.assign(new Error(message), { code })

type ProtectedRouteProps = {
  children: ReactElement
}

export default function ProtectedRoute({ children }: ProtectedRouteProps): ReactElement | null {
  const navigate = useNavigate()

  const sessionQuery = useQuery<unknown, SessionError>({
    queryKey: ['session'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/me`, {
        method: 'GET',
        credentials: 'include',
      })

      if (res.status === 401) {
        throw createSessionError('Unauthorized', 'unauth')
      }

      if (!res.ok) {
        throw createSessionError('Failed to verify session', 'error')
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
