import { useMemo } from 'react'
import styles from './Users.module.css'

const Users = () => {
  const users = useMemo(
    () => [
      { id: 'USR-001', name: 'Jane Cooper', email: 'jane@example.com', role: 'Admin', status: 'Active' },
      { id: 'USR-002', name: 'Devon Lane', email: 'devon@example.com', role: 'Manager', status: 'Invited' },
      { id: 'USR-003', name: 'Courtney Henry', email: 'courtney@example.com', role: 'Member', status: 'Active' },
      { id: 'USR-004', name: 'Eleanor Pena', email: 'eleanor@example.com', role: 'Member', status: 'Suspended' },
    ],
    []
  )

  return (
    <section className={styles.users}>
      <header className={styles.header}>
        <div>
          <h1>Users</h1>
          <p>Manage user roles, invitations, and access controls.</p>
        </div>
        <button type="button" className={styles.primaryAction}>
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
                    <span className={styles.avatar} aria-hidden>
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
    </section>
  )
}

export default Users
