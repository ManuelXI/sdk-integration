import MonterosaExperience from './components/MonterosaExperience'
import { eventIds } from './config'
import './App.css'
import { useAuthenticatedUser } from './hooks/useAuthenticatedUser'

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

const PLACEHOLDER_AVATAR = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 110 110'%3E%3Ccircle cx='55' cy='55' r='55' fill='%2363b3ed'/%3E%3Cpath d='M55 50c8.28 0 15-6.72 15-15s-6.72-15-15-15-15 6.72-15 15 6.72 15 15 15zm0 7.5c-10 0-30 5.02-30 15v3.75c0 2.07 1.68 3.75 3.75 3.75h52.5c2.07 0 3.75-1.68 3.75-3.75V72.5c0-9.98-20-15-30-15z' fill='%23fff'/%3E%3C/svg%3E"

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
          <MonterosaExperience
            eventId={eventIds.authenticatedEmbed}
            useIdentity={true}
          />
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
