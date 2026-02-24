import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'

import App from '../App'
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

  it('renders the page heading and description', () => {
    render(<App />)

    expect(
      screen.getByRole('heading', { level: 1, name: /sdk integration demo/i }),
    ).toBeInTheDocument()

    expect(
      screen.getByRole('heading', { level: 2, name: /embedded experience/i }),
    ).toBeInTheDocument()

    expect(
      screen.getByText(/loaded and rendered by the monterosa sdk/i),
    ).toBeInTheDocument()
  })

  it('calls getExperience and embed on mount', () => {
    render(<App />)

    expect(mockGetExperience).toHaveBeenCalledWith({
      eventId: 'f746ca56-c9ee-40d4-8a84-ec238df18108',
    })

    expect(mockEmbed).toHaveBeenCalledWith(
      { id: 'mock-experience' },
      expect.any(HTMLDivElement),
    )
  })

  it('calls unmount on cleanup', () => {
    render(<App />)
    cleanup()

    expect(mockUnmount).toHaveBeenCalledWith(expect.any(HTMLDivElement))
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
      screen.getByRole('heading', { level: 1, name: /sdk integration demo/i }),
    ).toBeInTheDocument()

    consoleSpy.mockRestore()
  })

  it('does not crash when unmount throws', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    mockUnmount.mockImplementationOnce(() => {
      throw new Error('Unmount failure')
    })

    render(<App />)
    cleanup()

    expect(consoleSpy).toHaveBeenCalledWith(
      'Failed to unmount experience',
      expect.objectContaining({ error: expect.any(Error) }),
    )

    consoleSpy.mockRestore()
  })
})
