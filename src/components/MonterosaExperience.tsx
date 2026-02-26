import { useRef, useEffect } from 'react'
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

interface MonterosaExperienceProps {
  eventId: string
  /** When true, identity (JWT) is set on the experience and login-by-experience is handled. Default false. */
  useIdentity?: boolean
}

export default function MonterosaExperience({
  eventId,
  useIdentity = false,
}: MonterosaExperienceProps) {
  const { loginWithRedirect, accessToken } = useAuthenticatedUser()
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let unsubLoginRequested: (() => void) | undefined

    const run = async () => {
      try {
        const experience = getExperience({
          eventId,
          autoresizesHeight: true,
        })

        if (useIdentity) {
          const identify = getIdentify({ strategy: 'email' })

          unsubLoginRequested = onLoginRequestedByExperience(identify, () => {
            loginWithRedirect()
          })

          await embed(experience, container)

          if (accessToken) {
            try {
              await setCredentials(identify, { token: accessToken })
            } catch (err) {
              console.error('Failed to set credentials on experience', {
                eventId,
                err,
              })
            }
          }
        } else {
          await embed(experience, container)
        }
      } catch (error) {
        console.error('Failed to embed experience', { eventId, error })
      }
    }

    run()

    return () => {
      unsubLoginRequested?.()
      try {
        if (container) unmount(container)
      } catch (error) {
        console.error('Failed to unmount experience', { eventId, error })
      }
    }
  }, [eventId, useIdentity, accessToken, loginWithRedirect])

  return (
    <div
      ref={containerRef}
      className="monterosa-experience-container"
      style={{ width: '100%', minHeight: 600 }}
    />
  )
}
