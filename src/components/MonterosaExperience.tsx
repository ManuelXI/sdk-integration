import { useRef, useEffect, useState, useCallback } from 'react'
import {
  getExperience,
  embed,
  unmount,
} from '@monterosa/sdk-launcher-kit'
import {
  getIdentify,
  setCredentials,
  onLoginRequestedByExperience,
} from '@monterosa/sdk-identify-kit'
import { useAuthenticatedUser } from '../hooks/useAuthenticatedUser'
import { useNotification } from '../contexts/NotificationContext'
import {
  MONTEROSA_EMBED_ERROR_OVERLAY,
  MONTEROSA_EMBED_ERROR_TOAST,
  MONTEROSA_SET_CREDENTIALS_ERROR_LOG,
} from '../constants/messages'

const DEFAULT_EMBED_MAX_RETRIES = 3
const DEFAULT_EMBED_BACKOFF_MS = [1000, 2000, 4000] // 1s, 2s, 4s after 1st, 2nd, 3rd failure

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

interface MonterosaExperienceProps {
  eventId: string
  /** When true, identity (JWT) is set on the experience and login-by-experience is handled. Default false. */
  useIdentity?: boolean
  /** Max retries after embed fails (default 3). Set to 0 to disable automatic retry. */
  embedMaxRetries?: number
  /** Delay in ms before each retry (default [1000, 2000, 4000]). Only used when embedMaxRetries > 0. */
  embedBackoffMs?: number[]
}

export default function MonterosaExperience({
  eventId,
  useIdentity = false,
  embedMaxRetries = DEFAULT_EMBED_MAX_RETRIES,
  embedBackoffMs = DEFAULT_EMBED_BACKOFF_MS,
}: MonterosaExperienceProps) {
  const { loginWithRedirect, accessToken } = useAuthenticatedUser()
  const { addNotification } = useNotification()
  const containerRef = useRef<HTMLDivElement>(null)
  const [isEmbedding, setIsEmbedding] = useState(true)
  const [embedError, setEmbedError] = useState<Error | null>(null)

  const runEmbed = useCallback(async () => {
    const container = containerRef.current
    if (!container) return

    setIsEmbedding(true)
    setEmbedError(null)

    let unsubLoginRequested: (() => void) | undefined

    try {
      const experience = getExperience({
        eventId,
        autoresizesHeight: true,
      })
      const identify = useIdentity ? getIdentify({ strategy: 'email' }) : null
      if (identify) {
        unsubLoginRequested = onLoginRequestedByExperience(identify, () => {
          loginWithRedirect()
        })
      }

      let lastError: Error | null = null
      const maxAttempts = Math.max(0, embedMaxRetries) + 1
      const backoffMs = embedBackoffMs.slice(0, embedMaxRetries)

      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        try {
          await embed(experience, container)
          if (identify && accessToken) {
            try {
              await setCredentials(identify, { token: accessToken })
            } catch (err) {
          console.error(MONTEROSA_SET_CREDENTIALS_ERROR_LOG, {
                eventId,
                err,
              })
            }
          }
          setEmbedError(null)
          break
        } catch (error) {
          lastError = error instanceof Error ? error : new Error(String(error))
          console.error('Failed to embed experience', { eventId, attempt, error })
          if (attempt < maxAttempts - 1 && backoffMs[attempt] != null) {
            await delay(backoffMs[attempt])
          } else {
            setEmbedError(lastError)
            addNotification(MONTEROSA_EMBED_ERROR_TOAST, 'error')
          }
        }
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error))
      setEmbedError(err)
      addNotification(MONTEROSA_EMBED_ERROR_TOAST, 'error')
      console.error('Failed to embed experience', { eventId, error })
    } finally {
      setIsEmbedding(false)
      unsubLoginRequested?.()
    }
  }, [eventId, useIdentity, accessToken, loginWithRedirect, addNotification, embedMaxRetries, embedBackoffMs])

  useEffect(() => {
    const container = containerRef.current
    const timeoutId = setTimeout(() => runEmbed(), 0)

    return () => {
      clearTimeout(timeoutId)
      if (container) {
        try {
          unmount(container)
        } catch (error) {
          console.error('Failed to unmount experience', { eventId, error })
        }
      }
    }
  }, [runEmbed, eventId])

  return (
    <div
      className="monterosa-experience-container"
      style={{ position: 'relative', width: '100%', minHeight: 200 }}
      aria-busy={isEmbedding}
      aria-live="polite"
    >
      <div
        ref={containerRef}
        style={{ width: '100%', minHeight: 200 }}
      />
      {isEmbedding && (
        <div className="monterosa-experience-skeleton" aria-hidden="true">
          <div className="monterosa-skeleton__bar" />
          <div className="monterosa-skeleton__bar monterosa-skeleton__bar--short" />
          <div className="monterosa-skeleton__block" />
          <div className="monterosa-skeleton__block monterosa-skeleton__block--short" />
        </div>
      )}
      {embedError && (
        <div className="monterosa-experience-error">
          <p className="monterosa-experience-error__message">
            {MONTEROSA_EMBED_ERROR_OVERLAY}
          </p>
          <button
            type="button"
            className="monterosa-experience-error__retry"
            onClick={() => runEmbed()}
            data-testid="embed-retry"
          >
            Retry
          </button>
        </div>
      )}
    </div>
  )
}
