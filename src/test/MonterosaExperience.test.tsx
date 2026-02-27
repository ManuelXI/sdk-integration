import type React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'

import MonterosaExperience from '../components/MonterosaExperience'
import { NotificationProvider } from '../contexts/NotificationContext'
import {
  MONTEROSA_EMBED_ERROR_OVERLAY,
  MONTEROSA_EMBED_ERROR_TOAST,
} from '../constants/messages'
import * as launcherKit from '@monterosa/sdk-launcher-kit'

vi.mock('@monterosa/sdk-launcher-kit', () => ({
  getExperience: vi.fn(),
  embed: vi.fn(),
  unmount: vi.fn(),
}))

vi.mock('@monterosa/sdk-identify-kit', () => ({
  getIdentify: vi.fn(() => ({ setCredentials: vi.fn() })),
  setCredentials: vi.fn(),
  onLoginRequestedByExperience: vi.fn(() => vi.fn()),
}))

vi.mock('../hooks/useAuthenticatedUser', () => ({
  useAuthenticatedUser: () => ({
    loginWithRedirect: vi.fn(),
    accessToken: null,
  }),
}))

const mockEmbed = launcherKit.embed as ReturnType<typeof vi.fn>
const mockUnmount = launcherKit.unmount as ReturnType<typeof vi.fn>
const mockGetExperience = launcherKit.getExperience as ReturnType<typeof vi.fn>

function renderWithNotifications(ui: React.ReactElement) {
  return render(<NotificationProvider>{ui}</NotificationProvider>)
}

describe('MonterosaExperience', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetExperience.mockReturnValue({ eventId: 'evt-1', autoresizesHeight: true })
    mockEmbed.mockResolvedValue(undefined)
  })

  it('shows skeleton while embedding', async () => {
    mockEmbed.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100)),
    )

    renderWithNotifications(
      <MonterosaExperience eventId="evt-1" />,
    )

    expect(document.querySelector('.monterosa-experience-skeleton')).toBeInTheDocument()
  })

  it('hides skeleton after embed succeeds', async () => {
    mockEmbed.mockResolvedValue(undefined)

    renderWithNotifications(
      <MonterosaExperience eventId="evt-1" />,
    )

    await waitFor(() => {
      expect(mockEmbed).toHaveBeenCalled()
    })

    await waitFor(() => {
      expect(document.querySelector('.monterosa-experience-skeleton')).not.toBeInTheDocument()
    })
  })

  it('shows error UI and retry when embed fails', async () => {
    mockEmbed.mockRejectedValue(new Error('Load failed'))

    renderWithNotifications(
      <MonterosaExperience eventId="evt-1" embedMaxRetries={0} />,
    )

    await waitFor(() => {
      expect(mockEmbed).toHaveBeenCalled()
    })

    await waitFor(() => {
      expect(screen.getByText(MONTEROSA_EMBED_ERROR_OVERLAY)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument()
    })
  })

  it('shows user-visible toast when embed fails', async () => {
    mockEmbed.mockRejectedValue(new Error('Load failed'))

    renderWithNotifications(
      <MonterosaExperience eventId="evt-1" embedMaxRetries={0} />,
    )

    await waitFor(() => {
      expect(mockEmbed).toHaveBeenCalled()
    })

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
      expect(screen.getByText(MONTEROSA_EMBED_ERROR_TOAST)).toBeInTheDocument()
    })
  })

  it('retry button calls embed again', async () => {
    mockEmbed
      .mockRejectedValueOnce(new Error('Load failed'))
      .mockResolvedValueOnce(undefined)

    renderWithNotifications(
      <MonterosaExperience eventId="evt-1" embedMaxRetries={0} />,
    )

    let retryButton: HTMLElement
    await waitFor(() => {
      expect(screen.getByText(MONTEROSA_EMBED_ERROR_OVERLAY)).toBeInTheDocument()
      retryButton = screen.getByTestId('embed-retry')
      expect(retryButton).toBeInTheDocument()
    })

    const callsBeforeRetry = mockEmbed.mock.calls.length
    fireEvent.click(retryButton!)

    await waitFor(() => {
      expect(mockEmbed.mock.calls.length).toBeGreaterThan(callsBeforeRetry)
    })
  })

  it('unmounts on cleanup', async () => {
    const { unmount } = renderWithNotifications(
      <MonterosaExperience eventId="evt-1" />,
    )

    await waitFor(() => {
      expect(mockEmbed).toHaveBeenCalled()
    })

    unmount()

    expect(mockUnmount).toHaveBeenCalled()
  })
})
