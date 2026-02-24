import { useRef, useEffect } from 'react'
import { getExperience, embed, unmount } from '@monterosa/sdk-launcher-kit'
import './App.css'

interface MonterosaExperienceProps {
  eventId: string
}

function MonterosaExperience({ eventId }: MonterosaExperienceProps) {
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
      style={{ width: '100%', minHeight: 500 }}
    />
  )
}

function App() {
  return (
    <div className="app">
      <header className="header">
        <h1>SDK Integration Demo</h1>
        <p className="subtitle">
          Monterosa experience embedded via <code>@monterosa/sdk-launcher-kit</code>
        </p>
      </header>

      <main className="content">
        <section className="experience-card">
          <h2>Embedded Experience</h2>
          <p className="description">
            The experience below is loaded and rendered by the Monterosa SDK.
            It is initialised once on mount and cleaned up on unmount.
          </p>
          <MonterosaExperience eventId="f746ca56-c9ee-40d4-8a84-ec238df18108" />
        </section>
      </main>
    </div>
  )
}

export default App
