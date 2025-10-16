import { useMemo, useState } from 'react'
import type { ChangeEvent, FormEvent, JSX, MouseEvent } from 'react'
import { useMutation } from '@tanstack/react-query'
import styles from './Users.module.css'

type UserStatus = 'Active' | 'Invited' | 'Suspended'

type UserRecord = {
  id: string
  name: string
  email: string
  role: string
  status: UserStatus
}

const API_BASE = '/api' as const

const getErrorMessage = (error: unknown, fallback: string): string =>
  error instanceof Error ? error.message || fallback : fallback

const Users = (): JSX.Element => {
  const users = useMemo<UserRecord[]>(
    () => [
      { id: 'USR-001', name: 'Jane Cooper', email: 'jane@example.com', role: 'Admin', status: 'Active' },
      { id: 'USR-002', name: 'Devon Lane', email: 'devon@example.com', role: 'Manager', status: 'Invited' },
      { id: 'USR-003', name: 'Courtney Henry', email: 'courtney@example.com', role: 'Member', status: 'Active' },
      { id: 'USR-004', name: 'Eleanor Pena', email: 'eleanor@example.com', role: 'Member', status: 'Suspended' },
    ],
    []
  )

  const [isInviteOpen, setInviteOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')

  const createInvitationMutation = useMutation<void, Error, string>({
    mutationFn: async (email) => {
      const res = await fetch(`${API_BASE}/admin/invitations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email }),
      })

      if (res.status === 201) return

      let detail = 'Failed to send invitation. Please try again.'
      try {
        const data = await res.json()
        if (data?.detail) detail = Array.isArray(data.detail) ? data.detail[0]?.msg || detail : data.detail
      } catch {}
      throw new Error(detail)
    },
  })

  const isSubmittingInvite = createInvitationMutation.isPending

  const handleOpenInvite = () => {
    setInviteOpen(true)
  }

  const handleCloseInvite = () => {
    if (createInvitationMutation.isPending) return
    setInviteOpen(false)
    setInviteEmail('')
  }

  const handleInviteEmailChange = (event: ChangeEvent<HTMLInputElement>) => {
    setInviteEmail(event.target.value)
  }

  const handleModalClick = (event: MouseEvent<HTMLDivElement>) => {
    event.stopPropagation()
  }

  const handleInviteSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!inviteEmail || createInvitationMutation.isPending) return

    const email = inviteEmail.trim().toLowerCase()

    try {
      await createInvitationMutation.mutateAsync(email)
      alert('Invitation created')
      setInviteOpen(false)
      setInviteEmail('')
    } catch (error) {
      window.alert(getErrorMessage(error, 'Failed to send invitation. Please try again.'))
    }
  }

  return (
    <section className={styles.users}>
      <header className={styles.header}>
        <div>
          <h1>Users</h1>
          <p>Manage user roles, invitations, and access controls.</p>
        </div>
        <button type="button" className={styles.primaryAction} onClick={handleOpenInvite}>
          Invite User
        </button>
      </header>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <caption className="sr-only">List of users</caption>
          <thead>
            <tr>
              <th scope="col">User ID</th>
              <th scope="col">Name</th>
              <th scope="col">Email</th>
              <th scope="col">Role</th>
              <th scope="col">Status</th>
              <th scope="col" className={styles.actionsHeader}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map(({ id, name, email, role, status }) => (
              <tr key={id}>
                <td>{id}</td>
                <td>
                  <div className={styles.userCell}>
                    <span className={styles.avatar} aria-hidden="true">
                      {name
                        .split(' ')
                        .map((part) => part[0])
                        .join('')}
                    </span>
                    <span>{name}</span>
                  </div>
                </td>
                <td>{email}</td>
                <td>{role}</td>
                <td>
                  <span className={[styles.status, styles[status.toLowerCase()]].join(' ').trim()}>
                    {status}
                  </span>
                </td>
                <td className={styles.actionsCell}>
                  <button type="button">Edit</button>
                  <button type="button" className={styles.danger}>
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isInviteOpen ? (
        <div className={styles.modalOverlay} role="presentation" onClick={handleCloseInvite}>
          <div
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="inviteUserTitle"
            onClick={handleModalClick}
          >
            <button
              type="button"
              className={styles.closeButton}
              onClick={handleCloseInvite}
              aria-label="Close invite dialog"
              disabled={isSubmittingInvite}
            >
              &times;
            </button>
            <h2 id="inviteUserTitle" className={styles.modalTitle}>
              Invite user
            </h2>
            <p className={styles.modalDescription}>Send an invitation email to add a new team member.</p>
            <form className={styles.modalForm} onSubmit={handleInviteSubmit}>
              <label htmlFor="inviteEmail">
                Email address
                <input
                  id="inviteEmail"
                  type="email"
                  placeholder="user@example.com"
                  value={inviteEmail}
                  onChange={handleInviteEmailChange}
                  autoFocus
                  required
                />
              </label>
              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.secondaryButton}
                  onClick={handleCloseInvite}
                  disabled={isSubmittingInvite}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={styles.primaryAction}
                  disabled={!inviteEmail || isSubmittingInvite}
                >
                  {isSubmittingInvite ? 'Sending...' : 'Send invite'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </section>
  )
}

export default Users
