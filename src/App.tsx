import { lazy, Suspense } from 'react'
import { eventIds } from './config'
import {
  LAKERS_LOGO,
  CELTICS_LOGO,
  LAKERS_PLAYERS,
  PLACEHOLDER_AVATAR,
} from './constants/mockData'
import { useAuthenticatedUser } from './hooks/useAuthenticatedUser'
import './App.css'

const MonterosaExperience = lazy(() => import('./components/MonterosaExperience'))

function EmbedFallback() {
  return (
    <div className="monterosa-experience-container" style={{ minHeight: 200 }}>
      <div className="monterosa-experience-skeleton" aria-hidden="true">
        <div className="monterosa-skeleton__bar" />
        <div className="monterosa-skeleton__bar monterosa-skeleton__bar--short" />
        <div className="monterosa-skeleton__block" />
        <div className="monterosa-skeleton__block monterosa-skeleton__block--short" />
      </div>
    </div>
  )
}

function App() {
  const { user, isAuthenticated, isLoading, loginWithRedirect, logout } = useAuthenticatedUser()

  return (
    <div className="app">
      {/* Navigation */}
      <nav className="nav">
        <span className="nav-brand">SDK Integration Demo</span>
        <div className="nav-right">
          {isLoading && (
            <span className="auth-loading">Loading…</span>
          )}
          {!isLoading && !isAuthenticated && (
            <button
              type="button"
              className="auth-btn auth-btn--login"
              onClick={() => loginWithRedirect()}
            >
              Log In
            </button>
          )}
          {!isLoading && isAuthenticated && user && (
            <div className="auth-user">
              <img
                src={user.picture ?? PLACEHOLDER_AVATAR}
                alt={user.name ?? 'User'}
                className="auth-user__avatar"
                referrerPolicy="no-referrer"
              />
              <div className="auth-user__info">
                <span className="auth-user__name">{user.name ?? 'User'}</span>
                <span className="auth-user__email">{user.email ?? ''}</span>
              </div>
              <button
                type="button"
                className="auth-btn auth-btn--logout"
                onClick={() => logout()}
              >
                Log Out
              </button>
            </div>
          )}
          <span className="nav-tag">Game Day</span>
        </div>
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
          <Suspense fallback={<EmbedFallback />}>
            <MonterosaExperience
              eventId={eventIds.authenticatedEmbed}
              useIdentity={true}
            />
          </Suspense>
        </section>

        {/* Original simple embed from GH-31 (kept for reference / comparison) */}
        <section className="experience-card">
          <h2 className="card-title">Simple Embed (GH-31)</h2>
          <p className="card-description">
            The original embedded experience from the first integration task.
          </p>
          <Suspense fallback={<EmbedFallback />}>
            <MonterosaExperience eventId={eventIds.simpleEmbed} />
          </Suspense>
        </section>
      </main>
    </div>
  )
}

export default App
