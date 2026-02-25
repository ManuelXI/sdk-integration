import { useRef, useEffect } from 'react'
import { getExperience, embed, unmount } from '@monterosa/sdk-launcher-kit'
import { eventIds } from './config'
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
      className="monterosa-experience-container"
      style={{ width: '100%', minHeight: 600 }}
    />
  )
}

const LAKERS_LOGO = 'https://cdn.nba.com/logos/nba/1610612747/global/L/logo.svg'
const CELTICS_LOGO = 'https://cdn.nba.com/logos/nba/1610612738/global/L/logo.svg'

const LAKERS_PLAYERS = [
  { name: 'LeBron James', number: 23, position: 'F', image: 'https://cdn.nba.com/headshots/nba/latest/1040x760/2544.png' },
  { name: 'Luka Dončić', number: 77, position: 'G', image: 'https://cdn.nba.com/headshots/nba/latest/1040x760/1629029.png' },
  { name: 'Austin Reaves', number: 15, position: 'G', image: 'https://cdn.nba.com/headshots/nba/latest/1040x760/1630559.png' },
  { name: 'Deandre Ayton', number: 5, position: 'C', image: 'https://cdn.nba.com/headshots/nba/latest/1040x760/1629028.png' },
  { name: 'Rui Hachimura', number: 28, position: 'F', image: 'https://cdn.nba.com/headshots/nba/latest/1040x760/1629060.png' },
  { name: 'Dalton Knecht', number: 4, position: 'F', image: 'https://cdn.nba.com/headshots/nba/latest/1040x760/1642261.png' },
]

function App() {
  return (
    <div className="app">
      {/* Navigation */}
      <nav className="nav">
        <span className="nav-brand">SDK Integration Demo</span>
        <span className="nav-tag">Game Day</span>
      </nav>

      {/* Hero — Matchup */}
      <header className="matchup-hero">
        <div className="matchup-team">
          <img src={LAKERS_LOGO} alt="Los Angeles Lakers" className="team-logo" />
          <h2 className="team-name">Lakers</h2>
          <p className="team-record">34–22</p>
        </div>
        <div className="matchup-center">
          <p className="matchup-label">NBA Regular Season</p>
          <h1 className="matchup-vs">VS</h1>
          <p className="matchup-time">Tonight • 7:30 PM PT</p>
          <p className="matchup-venue">Crypto.com Arena, Los Angeles</p>
        </div>
        <div className="matchup-team">
          <img src={CELTICS_LOGO} alt="Boston Celtics" className="team-logo" />
          <h2 className="team-name">Celtics</h2>
          <p className="team-record">36–14</p>
        </div>
      </header>

      <main className="content">
        {/* Injury / availability report */}
        <section className="info-card">
          <h2 className="card-title">Injury Report</h2>
          <div className="injury-grid">
            <div className="injury-col">
              <h3>Lakers</h3>
              <ul className="injury-list">
                <li><span className="status status--out">OUT</span> Jarred Vanderbilt – Foot</li>
                <li><span className="status status--gtd">GTD</span> Luka Dončić – Calf</li>
              </ul>
            </div>
            <div className="injury-col">
              <h3>Celtics</h3>
              <ul className="injury-list">
                <li><span className="status status--out">OUT</span> Robert Williams – Knee</li>
                <li><span className="status status--probable">PROB</span> Kristaps Porzingis – Calf</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Key players */}
        <section className="info-card">
          <h2 className="card-title">Key Players</h2>
          <p className="card-description">
            Tonight's matchup features LeBron James chasing history, Luka Dončić orchestrating the offense,
            Austin Reaves running the show, and Deandre Ayton anchoring the paint — against a Celtics squad 
            led by Jayson Tatum and Jaylen Brown.
          </p>
          <div className="player-grid">
            {LAKERS_PLAYERS.map((player) => (
              <div key={player.number} className="player-card">
                <img src={player.image} alt={player.name} className="player-headshot" />
                <div className="player-info">
                  <span className="player-name">{player.name}</span>
                  <span className="player-detail">#{player.number} • {player.position}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Series Predictor experience */}
        {/*
          EXPERIENCE TYPE: Series Predictor (wrapper)
          ELEMENTS INSIDE:
            1x Series Score Predictor — "Predict the final score: Lakers vs Celtics"
            2x Series Number Predictor — "How many points will LeBron score?" / "How many points will Luka score?"
            1x Series Carousel Predictor — "Who will be the Lakers' leading scorer tonight?" (player picker)
            1x Series Prediction — "Will the Lakers win by 10+ points?" (multi-choice: Yes / No / Overtime)
          USE CASE: A single Series Predictor event wrapping multiple prediction types
                    into one cohesive game-day prediction experience.
        */}
        <section className="experience-card experience-card--featured">
          <div className="experience-header">
            <h2 className="card-title">Game Day Predictions</h2>
            <span className="experience-badge">Series Predictor</span>
          </div>
          <p className="card-description">
            Think you know how tonight plays out? Make your calls — predict the final score,
            player stats, and the game's outcome. Results are revealed after the final buzzer.
          </p>
          <div className="prediction-preview">
            <div className="prediction-item">
              <span className="prediction-icon">🏀</span>
              <span>Predict the final score</span>
            </div>
            <div className="prediction-item">
              <span className="prediction-icon">📊</span>
              <span>LeBron's points &amp; Luka's points</span>
            </div>
            <div className="prediction-item">
              <span className="prediction-icon">👤</span>
              <span>Pick the leading scorer</span>
            </div>
            <div className="prediction-item">
              <span className="prediction-icon">🎯</span>
              <span>Will Lakers win by 10+?</span>
            </div>
          </div>
          <MonterosaExperience eventId={eventIds.seriesPredictor} />
        </section>

        {/* Original simple embed from GH-31 (kept for reference / comparison) */}
        <section className="experience-card">
          <h2 className="card-title">Simple Embed (GH-31)</h2>
          <p className="card-description">
            The original embedded experience from the first integration task.
          </p>
          <MonterosaExperience eventId={eventIds.simpleEmbed} />
        </section>
      </main>
    </div>
  )
}

export default App
