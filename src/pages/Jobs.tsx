import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { ChangeEvent, FormEvent, JSX, KeyboardEvent, MouseEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { GPU_PROFILES, type GPUProfile } from '../constants/gpuProfiles'
import styles from './Jobs.module.css'

const API_BASE = '/api' as const
const JOBS_STALE_TIME_MS = 5_000
const JOBS_REFETCH_INTERVAL_MS = 5_000
const JOB_IMAGES_STALE_TIME_MS = 60_000

type JobRun = {
  id: number
  status: string
  k8s_job_name: string
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
  latest_run: JobRun | null | undefined
}

type JobImageOption = {
  image: string
  tag: string
  digest: string
  pushed_at: string
}

type JobSubmissionPayload = {
  image: string
  gpu: GPUProfile
  storage: number
  secretNames: string[]
}

type SecretSummary = {
  name: string
}

type SecretDetail = {
  name: string
  keys: string[]
}

const DEFAULT_STORAGE_GB = 1
const SUCCESS_MESSAGE_TIMEOUT_MS = 4_000
const DEFAULT_GPU_PROFILE = (GPU_PROFILES.find((profile) => profile === '1g.10gb') ?? GPU_PROFILES[0]) as GPUProfile
const SECRETS_STALE_TIME_MS = 60_000
const SECRET_DETAILS_STALE_TIME_MS = 60_000

const isJobRun = (value: unknown): value is JobRun => {
  if (!value || typeof value !== 'object') return false
  const record = value as Record<string, unknown>

  const isNullableString = (input: unknown) => input === null || typeof input === 'string'

  return (
    typeof record.id === 'number' &&
    typeof record.status === 'string' &&
    typeof record.k8s_job_name === 'string' &&
    typeof record.k8s_pod_name === 'string' &&
    isNullableString(record.started_at) &&
    isNullableString(record.finished_at)
  )
}

const isJobRecord = (value: unknown): value is JobRecord => {
  if (!value || typeof value !== 'object') return false
  const record = value as Record<string, unknown>
  const maybeLastRun = record.last_run

  const isString = (input: unknown) => typeof input === 'string'

  return (
    typeof record.id === 'number' &&
    isString(record.image) &&
    isString(record.gpu_profile) &&
    isString(record.submitted_at) &&
    typeof record.created_by_id === 'number' &&
    (maybeLastRun === undefined || maybeLastRun === null || isJobRun(maybeLastRun))
  )
}

const fetchJobs = async (): Promise<JobRecord[]> => {
  const response = await fetch(`${API_BASE}/jobs/`, {
    method: 'GET',
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error(`Jobs request failed (${response.status})`)
  }

  let payload: unknown

  try {
    payload = await response.json()
  } catch {
    throw new Error('Received unreadable jobs response. Please try again.')
  }

  if (!Array.isArray(payload) || !payload.every(isJobRecord)) {
    throw new Error('Received malformed jobs response. Please contact support.')
  }

  return payload
}

const isJobImageOption = (value: unknown): value is JobImageOption => {
  if (!value || typeof value !== 'object') return false
  const record = value as Record<string, unknown>

  return (
    typeof record.image === 'string' &&
    typeof record.tag === 'string' &&
    typeof record.digest === 'string' &&
    typeof record.pushed_at === 'string'
  )
}

const fetchJobImages = async (): Promise<JobImageOption[]> => {
  const response = await fetch(`${API_BASE}/jobs/images`, {
    method: 'GET',
    credentials: 'include',
  })

  if (!response.ok) {
    let detail = 'Failed to load job images. Please try again.'
    try {
      const payload = (await response.json()) as { detail?: unknown }
      const errorDetail = payload?.detail
      if (typeof errorDetail === 'string' && errorDetail.trim()) {
        detail = errorDetail
      } else if (Array.isArray(errorDetail)) {
        const message = errorDetail
          .map((item) => {
            if (!item || typeof item !== 'object') return null
            const maybeRecord = item as { msg?: unknown }
            return typeof maybeRecord.msg === 'string' ? maybeRecord.msg : null
          })
          .filter((msg): msg is string => Boolean(msg))
          .join('\n')
        if (message) {
          detail = message
        }
      }
    } catch {
      // ignore JSON parsing errors from error responses
    }
    throw new Error(detail)
  }

  let payload: unknown
  try {
    payload = await response.json()
  } catch {
    throw new Error('Received unreadable job images response. Please try again.')
  }

  if (!Array.isArray(payload) || !payload.every(isJobImageOption)) {
    throw new Error('Received malformed job images response. Please contact support.')
  }

  return payload
}

const fetchSecrets = async (): Promise<SecretSummary[]> => {
  const response = await fetch(`${API_BASE}/secrets/`, {
    method: 'GET',
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error(`Failed to load secrets (status ${response.status}).`)
  }

  let payload: unknown
  try {
    payload = await response.json()
  } catch {
    throw new Error('Received unreadable secrets response. Please try again.')
  }

  if (!Array.isArray(payload) || !payload.every(isSecretSummary)) {
    throw new Error('Received malformed secrets response. Please contact support.')
  }

  return payload
}

const fetchSecretDetail = async (secretName: string): Promise<SecretDetail> => {
  const response = await fetch(`${API_BASE}/secrets/${encodeURIComponent(secretName)}`, {
    method: 'GET',
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error(`Failed to load details for “${secretName}” (status ${response.status}).`)
  }

  let payload: unknown
  try {
    payload = await response.json()
  } catch {
    throw new Error('Received unreadable secret detail response. Please try again.')
  }

  if (!isSecretDetail(payload)) {
    throw new Error('Received malformed secret detail response. Please contact support.')
  }

  return payload
}

const isSecretSummary = (value: unknown): value is SecretSummary => {
  if (!value || typeof value !== 'object') return false
  const record = value as Record<string, unknown>
  return typeof record.name === 'string' && record.name.trim().length > 0
}

const isSecretDetail = (value: unknown): value is SecretDetail => {
  if (!value || typeof value !== 'object') return false
  const record = value as Record<string, unknown>
  const keys = record.keys
  return typeof record.name === 'string' && Array.isArray(keys) && keys.every((key) => typeof key === 'string')
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
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const jobsQuery = useQuery<JobRecord[], Error>({
    queryKey: ['jobs', 'list'],
    queryFn: fetchJobs,
    staleTime: JOBS_STALE_TIME_MS,
    refetchInterval: JOBS_REFETCH_INTERVAL_MS,
    refetchIntervalInBackground: true,
  })

  const jobImagesQuery = useQuery<JobImageOption[], Error>({
    queryKey: ['jobs', 'images'],
    queryFn: fetchJobImages,
    staleTime: JOB_IMAGES_STALE_TIME_MS,
    refetchOnWindowFocus: false,
  })

  const secretsQuery = useQuery<SecretSummary[], Error>({
    queryKey: ['secrets', 'list'],
    queryFn: fetchSecrets,
    staleTime: SECRETS_STALE_TIME_MS,
    refetchOnWindowFocus: false,
  })

  const [imageInput, setImageInput] = useState('')
  const [gpuProfile, setGpuProfile] = useState<GPUProfile>(DEFAULT_GPU_PROFILE)
  const [storageInput, setStorageInput] = useState(String(DEFAULT_STORAGE_GB))
  const [selectedSecretNames, setSelectedSecretNames] = useState<string[]>([])
  const [formError, setFormError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isRegistryModalOpen, setIsRegistryModalOpen] = useState(false)
  const [registrySearchTerm, setRegistrySearchTerm] = useState('')

  const createJobMutation = useMutation<void, Error, JobSubmissionPayload>({
    mutationFn: async ({ image, gpu, storage, secretNames }) => {
      const payload: Record<string, unknown> = { image, gpu, storage }
      if (secretNames.length > 0) {
        payload.secret_names = secretNames
      }

      const response = await fetch(`${API_BASE}/jobs/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        let detail = `Failed to submit job (status ${response.status}).`
        try {
          const payload = (await response.json()) as { detail?: unknown }
          const errorDetail = payload?.detail
          if (typeof errorDetail === 'string' && errorDetail.trim()) {
            detail = errorDetail
          } else if (Array.isArray(errorDetail)) {
            const message = errorDetail
              .map((item) => {
                if (!item || typeof item !== 'object') return null
                const maybeRecord = item as { msg?: unknown }
                return typeof maybeRecord.msg === 'string' ? maybeRecord.msg : null
              })
              .filter((msg): msg is string => Boolean(msg))
              .join('\n')
            if (message) {
              detail = message
            }
          }
        } catch {
          // ignore JSON parsing errors from error responses
        }
        throw new Error(detail)
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['jobs', 'list'] })
    },
  })

  const jobs = jobsQuery.data ?? []
  const jobImageOptions = useMemo(() => jobImagesQuery.data ?? [], [jobImagesQuery.data])
  const availableSecrets = secretsQuery.data ?? []
  const isSubmittingJob = createJobMutation.isPending
  const imageInputRef = useRef<HTMLInputElement | null>(null)
  const registrySearchInputRef = useRef<HTMLInputElement | null>(null)
  const trimmedImageInput = imageInput.trim()
  const filteredRegistryOptions = useMemo(() => {
    const query = registrySearchTerm.trim().toLowerCase()
    if (!query) return jobImageOptions
    return jobImageOptions.filter((option) => {
      const image = option.image.toLowerCase()
      const tag = option.tag.toLowerCase()
      return image.includes(query) || tag.includes(query)
    })
  }, [jobImageOptions, registrySearchTerm])
  const isRegistryAvailable = jobImageOptions.length > 0
  const selectedSecretDetailQueries = useQueries({
    queries: selectedSecretNames.map((secretName) => ({
      queryKey: ['secrets', 'detail', secretName],
      queryFn: () => fetchSecretDetail(secretName),
      staleTime: SECRET_DETAILS_STALE_TIME_MS,
      refetchOnWindowFocus: false,
      enabled: isModalOpen,
    })),
  })
  const selectedSecretDetails = selectedSecretNames.map((secretName, index) => ({
    secretName,
    query: selectedSecretDetailQueries[index],
  }))

  useEffect(() => {
    if (!successMessage) return undefined
    const timerId = window.setTimeout(() => {
      setSuccessMessage(null)
    }, SUCCESS_MESSAGE_TIMEOUT_MS)

    return () => {
      window.clearTimeout(timerId)
    }
  }, [successMessage])

  useEffect(() => {
    if (!isModalOpen) return
    window.setTimeout(() => {
      imageInputRef.current?.focus()
    }, 0)
  }, [isModalOpen])

  useEffect(() => {
    if (!isRegistryModalOpen) return
    window.setTimeout(() => {
      registrySearchInputRef.current?.focus()
    }, 0)
  }, [isRegistryModalOpen])

  const getStatusClassName = (status: string): string => {
    const key = getStatusStyleKey(status)
    const modifier = styles[key] ?? styles.unknown
    return `${styles.statusBadge} ${modifier}`.trim()
  }

  const imageHintMessage = jobImagesQuery.isPending
    ? 'Loading registry images…'
    : jobImagesQuery.isError
      ? `Registry suggestions unavailable: ${getErrorMessage(jobImagesQuery.error)}`
      : 'Provide an image reference or browse the registry.';

  const imageHintClassName = jobImagesQuery.isError
    ? `${styles.fieldHint} ${styles.fieldHintError}`.trim()
    : styles.fieldHint

  const resetFormState = () => {
    setFormError(null)
    setGpuProfile(DEFAULT_GPU_PROFILE)
    setStorageInput(String(DEFAULT_STORAGE_GB))
    setImageInput('')
    setSelectedSecretNames([])
    setRegistrySearchTerm('')
    setIsRegistryModalOpen(false)
  }

  const handleOpenModal = () => {
    resetFormState()
    createJobMutation.reset()
    setIsModalOpen(true)
    if (successMessage) setSuccessMessage(null)
  }

  const handleCloseModal = () => {
    if (isSubmittingJob) return
    setIsModalOpen(false)
    setIsRegistryModalOpen(false)
    setFormError(null)
  }

  const handleOverlayClick = () => {
    if (isSubmittingJob) return
    handleCloseModal()
  }

  const handleModalClick = (event: MouseEvent<HTMLDivElement>) => {
    event.stopPropagation()
  }

  const handleImageInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setImageInput(event.target.value)
    if (formError) setFormError(null)
    if (successMessage) setSuccessMessage(null)
  }

  const handleOpenRegistryModal = () => {
    if (jobImagesQuery.isError || jobImagesQuery.isPending) return
    if (jobImageOptions.length === 0) return
    setRegistrySearchTerm('')
    setIsRegistryModalOpen(true)
  }

  const handleCloseRegistryModal = () => {
    setIsRegistryModalOpen(false)
  }

  const handleRegistrySearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setRegistrySearchTerm(event.target.value)
  }

  const handleRegistryOptionSelect = (value: string) => {
    setImageInput(value)
    setIsRegistryModalOpen(false)
    if (formError) setFormError(null)
    if (successMessage) setSuccessMessage(null)
    window.setTimeout(() => {
      imageInputRef.current?.focus()
    }, 0)
  }

  const handleGpuChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setGpuProfile(event.target.value as GPUProfile)
    if (successMessage) setSuccessMessage(null)
  }

  const handleStorageChange = (event: ChangeEvent<HTMLInputElement>) => {
    setStorageInput(event.target.value)
    if (formError) setFormError(null)
    if (successMessage) setSuccessMessage(null)
  }

  const handleSecretToggle = (event: ChangeEvent<HTMLInputElement>, secretName: string) => {
    const { checked } = event.target
    setSelectedSecretNames((prev) => {
      if (checked) {
        if (prev.includes(secretName)) return prev
        return [...prev, secretName]
      }
      return prev.filter((name) => name !== secretName)
    })
    if (successMessage) setSuccessMessage(null)
  }

  const handleJobSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isSubmittingJob) return

    const trimmedImage = trimmedImageInput
    if (!trimmedImage) {
      setFormError('Image is required.')
      return
    }

    const parsedStorage = Number(storageInput)
    if (!Number.isInteger(parsedStorage) || parsedStorage < 1) {
      setFormError('Storage must be a positive whole number.')
      return
    }

    try {
      await createJobMutation.mutateAsync({
        image: trimmedImage,
        gpu: gpuProfile,
        storage: parsedStorage,
        secretNames: selectedSecretNames,
      })
      setSuccessMessage('Job submitted successfully.')
      setIsModalOpen(false)
      setIsRegistryModalOpen(false)
      setFormError(null)
      setSelectedSecretNames([])
    } catch (error) {
      const message =
        error instanceof Error && error.message.trim()
          ? error.message
          : 'Failed to submit job. Please try again.'
      setFormError(message)
      setSuccessMessage(null)
    }
  }


  const handleRowNavigate = (jobId: number) => {
    navigate(`/app/jobs/${jobId}`)
  }

  const handleRowKeyDown = (event: KeyboardEvent<HTMLTableRowElement>, jobId: number) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleRowNavigate(jobId)
    }
  }

  return (
    <section className={styles.jobs}>
      <header className={styles.header}>
        <h1>Jobs</h1>
        <p>Review recent jobs and inspect their most recent runs.</p>
      </header>

      <section className={styles.section}>
        <div className={styles.sectionHeading}>
          <h2>Jobs</h2>
          <button type="button" className={styles.primaryAction} onClick={handleOpenModal}>
            Submit Job
          </button>
        </div>

        {successMessage ? (
          <div className={`${styles.formFeedback} ${styles.formFeedbackSuccess}`} role="status" aria-live="polite">
            {successMessage}
          </div>
        ) : null}

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
                  <th scope="col">Last Run Started</th>
                  <th scope="col">Last Run Status</th>
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
                  jobs.map(({ id, image, gpu_profile, latest_run: lastRun }) => {
                    const lastRunStatus = lastRun?.status
                    const lastRunStarted = lastRun?.started_at ?? null

                    return (
                      <tr
                        key={id}
                        className={styles.clickableRow}
                        tabIndex={0}
                        role="link"
                        aria-label={`View details for job #${id}`}
                        onClick={() => handleRowNavigate(id)}
                        onKeyDown={(event) => handleRowKeyDown(event, id)}
                      >
                        <td>#{id}</td>
                        <td className={styles.monospace}>{image}</td>
                        <td>{gpu_profile}</td>
                        <td>{formatDateTime(lastRunStarted)}</td>
                        <td>
                          {lastRunStatus ? (
                            <span className={getStatusClassName(lastRunStatus)}>{formatStatusLabel(lastRunStatus)}</span>
                          ) : (
                            '—'
                          )}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {isModalOpen ? (
          <div className={styles.modalOverlay} onClick={handleOverlayClick}>
            <div
              className={styles.modal}
              role="dialog"
              aria-modal="true"
              aria-labelledby="submit-job-modal-title"
              onClick={handleModalClick}
            >
              <header className={styles.modalHeader}>
                <div>
                  <h2 id="submit-job-modal-title">Submit Job</h2>
                  <p className={styles.modalDescription}>
                    Define the runtime image, GPU profile, and storage requirements for your workload.
                  </p>
                </div>
                <button
                  type="button"
                  className={styles.closeButton}
                  onClick={handleCloseModal}
                  disabled={isSubmittingJob}
                  aria-label="Close submit job modal"
                >
                  ×
                </button>
              </header>

              {formError ? (
                <div className={`${styles.formFeedback} ${styles.formFeedbackError}`} role="alert">
                  {formError}
                </div>
              ) : null}

              <form className={styles.jobForm} onSubmit={handleJobSubmit} noValidate>
                <div className={styles.formGrid}>
                  <label className={`${styles.formField} ${styles.fullWidthField}`}>
                    <span className={styles.fieldLabel}>Container image</span>
                    <div className={styles.imageFieldRow}>
                      <input
                        ref={imageInputRef}
                        type="text"
                        name="image"
                        value={imageInput}
                        onChange={handleImageInputChange}
                        className={styles.fieldControl}
                        placeholder="registry/repository:tag"
                        autoComplete="off"
                        disabled={isSubmittingJob}
                        required
                      />
                      <button
                        type="button"
                        className={styles.registryButton}
                        onClick={handleOpenRegistryModal}
                        disabled={
                          isSubmittingJob || !isRegistryAvailable || jobImagesQuery.isPending || jobImagesQuery.isError
                        }
                      >
                        Browse Registry
                      </button>
                    </div>
                    <span className={imageHintClassName}>{imageHintMessage}</span>
                  </label>

                  <label className={styles.formField}>
                    <span className={styles.fieldLabel}>GPU profile</span>
                    <select
                      name="gpu"
                      value={gpuProfile}
                      onChange={handleGpuChange}
                      className={styles.fieldControl}
                      disabled={isSubmittingJob}
                      required
                    >
                      {GPU_PROFILES.map((profile) => (
                        <option key={profile} value={profile}>
                          {profile}
                        </option>
                      ))}
                    </select>
                    <span className={styles.fieldHint}>MiG slice that will be requested for the job.</span>
                  </label>

                  <label className={styles.formField}>
                    <span className={styles.fieldLabel}>Storage (GB)</span>
                    <input
                      type="number"
                      name="storage"
                      min={1}
                      step={1}
                      inputMode="numeric"
                      value={storageInput}
                      onChange={handleStorageChange}
                      className={styles.fieldControl}
                      placeholder={String(DEFAULT_STORAGE_GB)}
                      disabled={isSubmittingJob}
                      required
                    />
                    <span className={styles.fieldHint}>Requested storage capacity for the job output.</span>
                  </label>

                  <div className={`${styles.formField} ${styles.fullWidthField}`}>
                    <span className={styles.fieldLabel}>Secrets (optional)</span>
                    <span className={styles.fieldHint}>Attach managed secrets that should be available to this job.</span>

                    {secretsQuery.isPending ? (
                      <p className={styles.secretFieldStatus}>Loading secrets…</p>
                    ) : secretsQuery.isError ? (
                      <p className={`${styles.secretFieldStatus} ${styles.secretFieldStatusError}`}>
                        Failed to load secrets: {getErrorMessage(secretsQuery.error)}
                      </p>
                    ) : availableSecrets.length === 0 ? (
                      <p className={styles.fieldHint}>No secrets are available to attach.</p>
                    ) : (
                      <div className={styles.secretList} role="group" aria-label="Available secrets">
                        {availableSecrets.map(({ name }) => {
                          const isChecked = selectedSecretNames.includes(name)
                          return (
                            <label key={name} className={styles.secretOption}>
                              <input
                                type="checkbox"
                                value={name}
                                checked={isChecked}
                                onChange={(event) => handleSecretToggle(event, name)}
                                disabled={isSubmittingJob}
                              />
                              <span className={styles.secretOptionName}>{name}</span>
                            </label>
                          )
                        })}
                      </div>
                    )}

                    {selectedSecretNames.length > 0 ? (
                      <div className={styles.selectedSecrets}>
                        <span className={styles.selectedSecretsHeading}>Selected secrets</span>
                        <ul className={styles.selectedSecretsList}>
                          {selectedSecretDetails.map(({ secretName, query }) => {
                            const detailQuery = query ?? null
                            return (
                              <li key={secretName} className={styles.selectedSecretItem}>
                                <div className={styles.selectedSecretHeader}>
                                  <span className={styles.secretOptionName}>{secretName}</span>
                                </div>
                                {detailQuery?.isPending ? (
                                  <span className={styles.secretMeta}>Loading keys…</span>
                                ) : detailQuery?.isError ? (
                                  <span className={`${styles.secretMeta} ${styles.secretMetaError}`}>
                                    Failed to load keys: {getErrorMessage(detailQuery.error)}
                                  </span>
                                ) : detailQuery?.data && detailQuery.data.keys.length > 0 ? (
                                  <ul className={styles.secretKeysList}>
                                    {detailQuery.data.keys.map((key) => (
                                      <li key={key} className={styles.secretKeyPill}>
                                        {key}
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <span className={styles.secretMeta}>No keys configured.</span>
                                )}
                              </li>
                            )
                          })}
                        </ul>
                      </div>
                    ) : null}
                  </div>
                </div>

                <footer className={styles.modalFooter}>
                  <button
                    type="button"
                    className={styles.secondaryAction}
                    onClick={handleCloseModal}
                    disabled={isSubmittingJob}
                  >
                    Cancel
                  </button>
                  <button type="submit" className={styles.submitButton} disabled={isSubmittingJob}>
                    {isSubmittingJob ? 'Submitting…' : 'Submit Job'}
                  </button>
                </footer>
              </form>
            </div>
          </div>
        ) : null}
      </section>

      {isRegistryModalOpen ? (
        <div
          className={styles.registryModalOverlay}
          role="dialog"
          aria-modal="true"
          aria-labelledby="registry-modal-title"
          onClick={handleCloseRegistryModal}
        >
          <div className={styles.registryModal} onClick={(event) => event.stopPropagation()}>
            <header className={styles.registryHeader}>
              <h3 id="registry-modal-title">Browse Registry Images</h3>
              <button
                type="button"
                className={styles.registryCloseButton}
                onClick={handleCloseRegistryModal}
                aria-label="Close registry browser"
              >
                ×
              </button>
            </header>

            <div className={styles.registryBody}>
              <div className={styles.registrySearch}>
                <label htmlFor="registry-image-search">Filter images</label>
                <input
                  id="registry-image-search"
                  ref={registrySearchInputRef}
                  type="search"
                  value={registrySearchTerm}
                  placeholder="Search by tag or image name"
                  onChange={handleRegistrySearchChange}
                />
              </div>

              {jobImagesQuery.isPending ? (
                <p className={styles.registryStatus}>Loading registry images…</p>
              ) : jobImagesQuery.isError ? (
                <p className={`${styles.registryStatus} ${styles.registryStatusError}`}>
                  {getErrorMessage(jobImagesQuery.error)}
                </p>
              ) : filteredRegistryOptions.length === 0 ? (
                <p className={styles.registryEmpty}>No registry images match your search.</p>
              ) : (
                <div className={styles.registryScrollArea}>
                  <ul className={styles.registryList}>
                    {filteredRegistryOptions.map((option) => {
                      const truncatedDigest = option.digest.startsWith('sha256:')
                        ? option.digest.slice(7, 19)
                        : option.digest.slice(0, 12)
                      return (
                        <li key={option.image} className={styles.registryItem}>
                          <button
                            type="button"
                            className={styles.registrySelectButton}
                            onClick={() => handleRegistryOptionSelect(option.image)}
                          >
                            <span className={styles.registryPrimary}>{option.tag || 'untagged'}</span>
                            <span className={styles.registrySecondary}>{option.image}</span>
                            <span className={styles.registryMeta}>Digest: {truncatedDigest}</span>
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}

export default Jobs
