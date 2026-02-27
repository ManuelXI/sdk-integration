import type React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'

import InteractEventView from '../components/InteractEventView'
import { NotificationProvider } from '../contexts/NotificationContext'
import { INTERACT_VOTE_FAILED_ERROR_TOAST } from '../constants/messages'
import {
  getEvent,
  getElements,
  onEventState,
  onElementPublished,
  onElementResults,
  onElementStateChanged,
  answer,
} from '@monterosa/sdk-interact-kit'

function renderWithNotifications(ui: React.ReactElement) {
  return render(<NotificationProvider>{ui}</NotificationProvider>)
}

const unsubSpy = vi.fn()

vi.mock('@monterosa/sdk-interact-kit', () => ({
  getEvent: vi.fn(),
  getElements: vi.fn(),
  onEventState: vi.fn(() => unsubSpy),
  onEventUpdated: vi.fn(() => unsubSpy),
  onElementPublished: vi.fn(() => unsubSpy),
  onElementResults: vi.fn(() => unsubSpy),
  onElementStateChanged: vi.fn(() => unsubSpy),
  answer: vi.fn(),
  EventState: {
    Upcoming: 'upcoming',
    Active: 'active',
    Finished: 'finished',
  },
}))

const mockGetEvent = getEvent as unknown as ReturnType<typeof vi.fn>
const mockGetElements = getElements as unknown as ReturnType<typeof vi.fn>
const mockOnEventState = onEventState as unknown as ReturnType<typeof vi.fn>
const mockOnElementPublished = onElementPublished as unknown as ReturnType<typeof vi.fn>
const mockOnElementResults = onElementResults as unknown as ReturnType<typeof vi.fn>
const mockOnElementStateChanged = onElementStateChanged as unknown as ReturnType<typeof vi.fn>
const mockAnswer = answer as unknown as ReturnType<typeof vi.fn>

function makeMockEvent(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 'evt-1',
    name: 'Test Event',
    startAt: 1700000000,
    endAt: 1700003600,
    state: 'active',
    duration: 3600,
    fields: {},
    on: vi.fn(),
    off: vi.fn(),
    ...overrides,
  }
}

function makeMockElement(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 'el-1',
    state: 'opened',
    type: 'trivia',
    contentType: 'trivia-element',
    question: { text: 'What is 2 + 2?' },
    answerOptions: [{ text: '3' }, { text: '4' }, { text: '5' }],
    results: null,
    canShowResults: false,
    interactive: true,
    hasBeenAnswered: false,
    userAnswer: null,
    on: vi.fn(),
    off: vi.fn(),
    ...overrides,
  }
}

describe('InteractEventView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetEvent.mockResolvedValue(makeMockEvent())
    mockGetElements.mockResolvedValue([makeMockElement()])
  })

  it('displays the event name and state after loading', async () => {
    renderWithNotifications(<InteractEventView eventId="evt-1" />)

    await waitFor(() => {
      expect(screen.getByText('Test Event')).toBeInTheDocument()
    })

    expect(screen.getByText('active')).toBeInTheDocument()
  })

  it('displays element question and answer options', async () => {
    renderWithNotifications(<InteractEventView eventId="evt-1" />)

    await waitFor(() => {
      expect(screen.getByText('What is 2 + 2?')).toBeInTheDocument()
    })

    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('4')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('shows element type badge', async () => {
    renderWithNotifications(<InteractEventView eventId="evt-1" />)

    await waitFor(() => {
      expect(screen.getByText('trivia-element')).toBeInTheDocument()
    })
  })

  it('calls getEvent with the provided eventId', async () => {
    renderWithNotifications(<InteractEventView eventId="my-event-id" />)

    await waitFor(() => {
      expect(mockGetEvent).toHaveBeenCalledWith('my-event-id')
    })
  })

  it('calls getElements after fetching the event', async () => {
    const mockEvent = makeMockEvent()
    mockGetEvent.mockResolvedValue(mockEvent)

    renderWithNotifications(<InteractEventView eventId="evt-1" />)

    await waitFor(() => {
      expect(mockGetElements).toHaveBeenCalledWith(mockEvent)
    })
  })

  it('subscribes to event and element updates', async () => {
    renderWithNotifications(<InteractEventView eventId="evt-1" />)

    await waitFor(() => {
      expect(mockOnEventState).toHaveBeenCalled()
    })

    expect(mockOnElementPublished).toHaveBeenCalled()
    expect(mockOnElementResults).toHaveBeenCalled()
    expect(mockOnElementStateChanged).toHaveBeenCalled()
  })

  it('shows empty state when event has no elements', async () => {
    mockGetElements.mockResolvedValue([])

    renderWithNotifications(<InteractEventView eventId="evt-1" />)

    await waitFor(() => {
      expect(screen.getByText(/no elements published yet/i)).toBeInTheDocument()
    })
  })

  it('shows error-not-found when getEvent returns null', async () => {
    mockGetEvent.mockResolvedValue(null)

    renderWithNotifications(<InteractEventView eventId="evt-1" />)

    await waitFor(() => {
      expect(screen.queryByText('Test Event')).not.toBeInTheDocument()
    })
  })

  it('calls answer() when an option is clicked', async () => {
    const mockElement = makeMockElement()
    mockGetElements.mockResolvedValue([mockElement])

    renderWithNotifications(<InteractEventView eventId="evt-1" />)

    await waitFor(() => {
      expect(screen.getByText('4')).toBeInTheDocument()
    })

    const optionButton = screen.getByText('4').closest('button')!
    fireEvent.click(optionButton)

    expect(mockAnswer).toHaveBeenCalledWith(mockElement, 1)
  })

  it('disables options when element is closed', async () => {
    mockGetElements.mockResolvedValue([
      makeMockElement({ state: 'closed' }),
    ])

    renderWithNotifications(<InteractEventView eventId="evt-1" />)

    await waitFor(() => {
      expect(screen.getByText('What is 2 + 2?')).toBeInTheDocument()
    })

    const buttons = screen.getAllByRole('button')
    buttons.forEach((btn) => {
      expect(btn).toBeDisabled()
    })
  })

  it('disables options when user has already answered', async () => {
    mockGetElements.mockResolvedValue([
      makeMockElement({ hasBeenAnswered: true }),
    ])

    renderWithNotifications(<InteractEventView eventId="evt-1" />)

    await waitFor(() => {
      expect(screen.getByText('What is 2 + 2?')).toBeInTheDocument()
    })

    const buttons = screen.getAllByRole('button')
    buttons.forEach((btn) => {
      expect(btn).toBeDisabled()
    })

    expect(screen.getAllByText('Voted').length).toBeGreaterThanOrEqual(1)
  })

  it('displays results when available', async () => {
    mockGetElements.mockResolvedValue([
      makeMockElement({
        results: [
          { votes: 10, percentage: 20 },
          { votes: 30, percentage: 60 },
          { votes: 10, percentage: 20 },
        ],
        canShowResults: true,
      }),
    ])

    renderWithNotifications(<InteractEventView eventId="evt-1" />)

    await waitFor(() => {
      expect(screen.getByText(/60%/)).toBeInTheDocument()
    })

    expect(screen.getByText(/60% · 30 votes/)).toBeInTheDocument()
  })

  it('does not crash when getEvent throws', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockGetEvent.mockRejectedValue(new Error('Network error'))

    renderWithNotifications(<InteractEventView eventId="evt-1" />)

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled()
    })

    consoleSpy.mockRestore()
  })

  it('cleans up subscriptions on unmount', async () => {
    const { unmount } = renderWithNotifications(<InteractEventView eventId="evt-1" />)

    await waitFor(() => {
      expect(mockOnEventState).toHaveBeenCalled()
    })

    unmount()

    expect(unsubSpy).toHaveBeenCalled()
  })

  it('shows user-visible notification when answer() throws (vote failure)', async () => {
    mockAnswer.mockImplementation(() => {
      throw new Error('Network error')
    })
    const mockElement = makeMockElement()
    mockGetElements.mockResolvedValue([mockElement])

    renderWithNotifications(<InteractEventView eventId="evt-1" />)

    await waitFor(() => {
      expect(screen.getByText('4')).toBeInTheDocument()
    })

    const optionButton = screen.getByText('4').closest('button')!
    fireEvent.click(optionButton)

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
      expect(screen.getByText(INTERACT_VOTE_FAILED_ERROR_TOAST)).toBeInTheDocument()
    })
  })
})
