import styles from './Dashboard.module.css'
import { StatCard } from '../components/cards'

const insights = [
  { title: 'Active Users', value: '2,845', helperText: '+12% vs last week' },
  { title: 'New Signups', value: '312', helperText: '+8% vs last week' },
  { title: 'Support Tickets', value: '27', helperText: '5 unresolved' },
]

const recentActivity = [
  { id: 1, action: 'New user invited', timestamp: '2 minutes ago' },
  { id: 2, action: 'Password reset completed', timestamp: '8 minutes ago' },
  { id: 3, action: 'Role updated to Admin', timestamp: '24 minutes ago' },
]

const Dashboard = () => {
  return (
    <section className={styles.dashboard}>
      <header className={styles.header}>
        <div>
          <h1>Dashboard</h1>
          <p>High-level overview of the platform health and user activity.</p>
        </div>
        <button type="button" className={styles.primaryAction}>
          Generate Report
        </button>
      </header>

      <div className={styles.statsGrid}>
        {insights.map((item) => (
          <StatCard key={item.title} {...item} />
        ))}
      </div>

      <div className={styles.panel}>
        <h2>Recent Activity</h2>
        <ul className={styles.activityList}>
          {recentActivity.map(({ id, action, timestamp }) => (
            <li key={id}>
              <span className={styles.action}>{action}</span>
              <span className={styles.timestamp}>{timestamp}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export default Dashboard
