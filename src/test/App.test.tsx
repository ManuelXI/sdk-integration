import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'

import App from '../App'
import { eventIds } from '../config'
import { getExperience, unmount } from '@monterosa/sdk-launcher-kit'
import { useAuth0 } from '@auth0/auth0-react'

const mockLoginWithRedirect = vi.fn()
const mockLogout = vi.fn()
const mockGetAccessTokenSilently = vi.fn()

vi.mock('@auth0/auth0-react', () => ({
  useAuth0: vi.fn(),
}))

vi.mock('@monterosa/sdk-launcher-kit', () => ({
  getExperience: vi.fn(() => ({ id: 'mock-experience' })),
  embed: vi.fn(() => Promise.resolve()),
  unmount: vi.fn(),
  onReady: vi.fn((_experience: unknown, callback: () => void) => {
    if (typeof callback === 'function') callback()
    return vi.fn()
  }),
}))

vi.mock('@monterosa/sdk-identify-kit', () => ({
  getIdentify: vi.fn(() => ({})),
  setCredentials: vi.fn(() => Promise.resolve()),
  onLoginRequestedByExperience: vi.fn(() => vi.fn()),
}))

vi.mock('@monterosa/sdk-interact-kit', () => ({
  getEvent: vi.fn(() => Promise.resolve(null)),
  getElements: vi.fn(() => Promise.resolve([])),
  onEventState: vi.fn(() => vi.fn()),
  onEventUpdated: vi.fn(() => vi.fn()),
  onElementPublished: vi.fn(() => vi.fn()),
  onElementResults: vi.fn(() => vi.fn()),
  onElementStateChanged: vi.fn(() => vi.fn()),
  answer: vi.fn(),
  EventState: {
    Upcoming: 'upcoming',
    Active: 'active',
    Finished: 'finished',
  },
}))

const mockGetExperience = getExperience as unknown as ReturnType<typeof vi.fn>
const mockUnmount = unmount as unknown as ReturnType<typeof vi.fn>

function setAuth0Mock(overrides: Partial<ReturnType<typeof useAuth0>> = {}) {
  vi.mocked(useAuth0).mockReturnValue({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    loginWithRedirect: mockLoginWithRedirect,
    getAccessTokenSilently: mockGetAccessTokenSilently,
    logout: mockLogout,
    ...overrides,
  } as ReturnType<typeof useAuth0>)
}

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetAccessTokenSilently.mockResolvedValue('')
    setAuth0Mock()
  })

  it('renders the navigation', () => {
    render(<App />)

    expect(screen.getByText(/sdk integration demo/i)).toBeInTheDocument()
    const navTag = document.querySelector('.nav-tag')
    expect(navTag).toBeInTheDocument()
    expect(navTag).toHaveTextContent('Game Day')
  })

  it('renders the matchup hero with both teams', () => {
    render(<App />)

    expect(screen.getByAltText('Los Angeles Lakers')).toBeInTheDocument()
    expect(screen.getByAltText('Boston Celtics')).toBeInTheDocument()
    expect(screen.getByText('VS')).toBeInTheDocument()
    expect(screen.getByText(/tonight.*7:30 PM PT/i)).toBeInTheDocument()
  })

  it('renders the injury report', () => {
    render(<App />)

    expect(
      screen.getByRole('heading', { name: /injury report/i }),
    ).toBeInTheDocument()
    expect(screen.getByText(/jarred vanderbilt/i)).toBeInTheDocument()
    expect(screen.getByText(/luka dončić – calf/i)).toBeInTheDocument()
    expect(screen.getByText(/robert williams/i)).toBeInTheDocument()
  })

  it('renders key player cards with images', () => {
    render(<App />)

    expect(
      screen.getByRole('heading', { name: /key players/i }),
    ).toBeInTheDocument()

    const headshots = screen.getAllByRole('img').filter(
      (img) => img.classList.contains('player-headshot'),
    )
    expect(headshots).toHaveLength(6)

    expect(screen.getByAltText('LeBron James')).toBeInTheDocument()
    expect(screen.getByAltText('Luka Dončić')).toBeInTheDocument()
    expect(screen.getByAltText('Austin Reaves')).toBeInTheDocument()
    expect(screen.getByAltText('Deandre Ayton')).toBeInTheDocument()
  })

  it('renders the Series Predictor section with preview items', () => {
    render(<App />)

    expect(
      screen.getByRole('heading', { name: /game day predictions/i }),
    ).toBeInTheDocument()

    const badge = document.querySelector('.experience-badge')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveTextContent('Series Predictor')

    const previewItems = document.querySelectorAll('.prediction-item')
    expect(previewItems).toHaveLength(4)
  })

  it('keeps the original GH-31 simple embed section', () => {
    render(<App />)

    expect(
      screen.getByRole('heading', { name: /simple embed/i }),
    ).toBeInTheDocument()
  })

  it('calls getExperience for each MonterosaExperience with correct eventIds', () => {
    render(<App />)

    expect(mockGetExperience).toHaveBeenCalledTimes(2)
    expect(mockGetExperience).toHaveBeenCalledWith(
      expect.objectContaining({ eventId: eventIds.authenticatedEmbed }),
    )
    expect(mockGetExperience).toHaveBeenCalledWith(
      expect.objectContaining({ eventId: eventIds.simpleEmbed }),
    )
  })

  it('calls unmount for each experience on cleanup', () => {
    render(<App />)
    cleanup()

    expect(mockUnmount).toHaveBeenCalled()
  })

  it('shows Log In when not authenticated', () => {
    setAuth0Mock({ isAuthenticated: false, isLoading: false })

    render(<App />)

    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /log out/i })).not.toBeInTheDocument()
  })

  it('shows Loading when auth is loading', () => {
    setAuth0Mock({ isLoading: true })

    render(<App />)

    expect(screen.getByText(/loading…/i)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /log in/i })).not.toBeInTheDocument()
  })

  it('shows user name, email, and Log Out when authenticated', () => {
    setAuth0Mock({
      user: { name: 'Jane Doe', email: 'jane@example.com' },
      isAuthenticated: true,
      isLoading: false,
    })

    render(<App />)

    expect(screen.getByText('Jane Doe')).toBeInTheDocument()
    expect(screen.getByText('jane@example.com')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /log out/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /log in/i })).not.toBeInTheDocument()
  })

  it('clicking Log In calls loginWithRedirect', () => {
    setAuth0Mock()

    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /log in/i }))

    expect(mockLoginWithRedirect).toHaveBeenCalledTimes(1)
  })

  it('clicking Log Out calls logout with returnTo', () => {
    setAuth0Mock({
      user: { name: 'Jane', email: 'jane@example.com' },
      isAuthenticated: true,
      isLoading: false,
    })

    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /log out/i }))

    expect(mockLogout).toHaveBeenCalledWith({
      logoutParams: { returnTo: window.location.origin },
    })
  })

  it('does not crash when getExperience throws', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    mockGetExperience.mockImplementationOnce(() => {
      throw new Error('Network failure')
    })

    render(<App />)

    expect(consoleSpy).toHaveBeenCalledWith(
      'Failed to embed experience',
      expect.objectContaining({ error: expect.any(Error) }),
    )

    expect(
      screen.getByRole('heading', { name: /game day predictions/i }),
    ).toBeInTheDocument()

    consoleSpy.mockRestore()
  })
})
