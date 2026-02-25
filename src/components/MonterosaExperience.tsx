import { useRef, useEffect } from 'react'
import { getExperience, embed, unmount } from '@monterosa/sdk-launcher-kit'

interface MonterosaExperienceProps {
  eventId: string
}

export default function MonterosaExperience({ eventId }: MonterosaExperienceProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let isCancelled = false

    try {
      const experience = getExperience({ eventId })
      if (!isCancelled) {
        embed(experience, container)
      }
    } catch (error) {
      console.error('Failed to embed experience', { eventId, error })
    }

    return () => {
      isCancelled = true
      try {
        if (container) {
          unmount(container)
        }
      } catch (error) {
        console.error('Failed to unmount experience', { eventId, error })
      }
    }
  }, [eventId])

  return (
    <div
      ref={containerRef}
      className="monterosa-experience-container"
      style={{ width: '100%', minHeight: 600 }}
    />
  )
}
