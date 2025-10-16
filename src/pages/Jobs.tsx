import { useQuery } from '@tanstack/react-query'
import type { JSX } from 'react'
import styles from './Jobs.module.css'

const API_BASE = '/api' as const

type RunningPod = {
  name: string
  namespace: string
  status: string
}

type JobRun = {
  id: number
  status: string
  k8s_pod_name: string
  started_at: string | null
  finished_at: string | null
}

type JobRecord = {
  id: number
  image: string
  gpu_profile: string
  submitted_at: string
  created_by_id: number
  k8s_job_name: string
  runs: JobRun[]
}

const fetchJson = async <T,>(path: string): Promise<T> => {
  const response = await fetch(`${API_BASE}${path}`, {
    method: 'GET',
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error(`Request failed (${response.status})`)
  }

  return (await response.json()) as T
}

const dateTimeFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: 'medium',
  timeStyle: 'short',
})

const formatDateTime = (value: string | null | undefined): string => {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return dateTimeFormatter.format(date)
}

const formatStatusLabel = (status: string): string =>
  status
    .replace(/[_-]+/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ') || 'Unknown'

const getStatusStyleKey = (status: string): 'running' | 'pending' | 'failed' | 'succeeded' | 'unknown' => {
  const normalized = status.trim().toLowerCase()
  if (normalized.includes('run')) return 'running'
  if (normalized.includes('pend')) return 'pending'
  if (normalized.includes('fail') || normalized.includes('error')) return 'failed'
  if (normalized.includes('succ') || normalized.includes('compl')) return 'succeeded'
  return 'unknown'
}

const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message || 'Something went wrong.' : 'Something went wrong.'

const Jobs = (): JSX.Element => {
  const podsQuery = useQuery<RunningPod[], Error>({
    queryKey: ['jobs', 'pods'],
    queryFn: () => fetchJson<RunningPod[]>('/jobs/pods'),
    staleTime: 7_500,
    refetchInterval: 5_000,
  })

  const jobsQuery = useQuery<JobRecord[], Error>({
    queryKey: ['jobs', 'list'],
    queryFn: () => fetchJson<JobRecord[]>('/jobs/'),
    staleTime: 10_000,
    refetchInterval: 7_500,
  })

  const pods = podsQuery.data ?? []
  const jobs = jobsQuery.data ?? []

  const getStatusClassName = (status: string): string => {
    const key = getStatusStyleKey(status)
    const modifier = styles[key] ?? styles.unknown
    return `${styles.statusBadge} ${modifier}`.trim()
  }

  return (
    <section className={styles.jobs}>
      <header className={styles.header}>
        <h1>Jobs</h1>
        <p>Monitor active pods and recent job submissions.</p>
      </header>

      <section className={styles.section}>
        <div className={styles.sectionHeading}>
          <h2>Running Pods</h2>
        </div>

        {podsQuery.isPending ? (
          <p className={styles.state}>Loading pods…</p>
        ) : podsQuery.isError ? (
          <p className={`${styles.state} ${styles.errorState}`}>
            Failed to load pods: {getErrorMessage(podsQuery.error)}
          </p>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <caption className="sr-only">Running pods</caption>
              <thead>
                <tr>
                  <th scope="col">Pod Name</th>
                  <th scope="col">Namespace</th>
                  <th scope="col">Status</th>
                </tr>
              </thead>
              <tbody>
                {pods.length === 0 ? (
                  <tr>
                    <td colSpan={3} className={styles.emptyCell}>
                      No running pods found.
                    </td>
                  </tr>
                ) : (
                  pods.map(({ name, namespace, status }) => (
                    <tr key={`${namespace}-${name}`}>
                      <td className={styles.monospace}>{name}</td>
                      <td className={styles.monospace}>{namespace}</td>
                      <td>
                        <span className={getStatusClassName(status)}>{formatStatusLabel(status)}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeading}>
          <h2>Jobs</h2>
        </div>

        {jobsQuery.isPending ? (
          <p className={styles.state}>Loading jobs…</p>
        ) : jobsQuery.isError ? (
          <p className={`${styles.state} ${styles.errorState}`}>
            Failed to load jobs: {getErrorMessage(jobsQuery.error)}
          </p>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <caption className="sr-only">Submitted jobs</caption>
              <thead>
                <tr>
                  <th scope="col">Job ID</th>
                  <th scope="col">Image</th>
                  <th scope="col">GPU Profile</th>
                  <th scope="col">Submitted</th>
                  <th scope="col">K8s Job</th>
                </tr>
              </thead>
              <tbody>
                {jobs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className={styles.emptyCell}>
                      No jobs available.
                    </td>
                  </tr>
                ) : (
                  jobs.map(({ id, image, gpu_profile, submitted_at, k8s_job_name }) => (
                    <tr key={id}>
                      <td>#{id}</td>
                      <td className={styles.monospace}>{image}</td>
                      <td>{gpu_profile}</td>
                      <td>{formatDateTime(submitted_at)}</td>
                      <td className={styles.monospace}>{k8s_job_name}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </section>
  )
}

export default Jobs
