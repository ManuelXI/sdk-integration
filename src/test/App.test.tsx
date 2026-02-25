import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'

import App from '../App'
import { eventIds } from '../config'
import { getExperience, embed, unmount } from '@monterosa/sdk-launcher-kit'

vi.mock('@monterosa/sdk-launcher-kit', () => ({
  getExperience: vi.fn(() => ({ id: 'mock-experience' })),
  embed: vi.fn(),
  unmount: vi.fn(),
}))

const mockGetExperience = getExperience as unknown as ReturnType<typeof vi.fn>
const mockEmbed = embed as unknown as ReturnType<typeof vi.fn>
const mockUnmount = unmount as unknown as ReturnType<typeof vi.fn>

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks()
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

  it('calls getExperience and embed for each MonterosaExperience', () => {
    render(<App />)

    expect(mockGetExperience).toHaveBeenCalledTimes(2)
    expect(mockEmbed).toHaveBeenCalledTimes(2)

    expect(mockGetExperience).toHaveBeenCalledWith({
      eventId: eventIds.seriesPredictor,
    })
    expect(mockGetExperience).toHaveBeenCalledWith({
      eventId: eventIds.simpleEmbed,
    })
  })

  it('calls unmount for each experience on cleanup', () => {
    render(<App />)
    cleanup()

    expect(mockUnmount).toHaveBeenCalledTimes(2)
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
