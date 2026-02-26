import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useAuthenticatedUser } from '../hooks/useAuthenticatedUser'

const mockLoginWithRedirect = vi.fn()
const mockLogout = vi.fn()
const mockGetAccessTokenSilently = vi.fn()

vi.mock('@auth0/auth0-react', () => ({
  useAuth0: vi.fn(),
}))

const defaultAuth0State = () => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  getAccessTokenSilently: mockGetAccessTokenSilently,
  loginWithRedirect: mockLoginWithRedirect,
  logout: mockLogout,
})

describe('useAuthenticatedUser', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    mockGetAccessTokenSilently.mockResolvedValue('')
    const { useAuth0 } = await import('@auth0/auth0-react')
    vi.mocked(useAuth0).mockReturnValue(
      defaultAuth0State() as unknown as ReturnType<typeof useAuth0>,
    )
  })

  it('returns user, accessToken, isAuthenticated, isLoading, loginWithRedirect, logout', () => {
    const { result } = renderHook(() => useAuthenticatedUser())

    expect(result.current).toMatchObject({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    })
    expect(result.current.accessToken).toBeNull()
    expect(typeof result.current.loginWithRedirect).toBe('function')
    expect(typeof result.current.logout).toBe('function')
  })

  it('calls getAccessTokenSilently when authenticated and not loading', async () => {
    const { useAuth0 } = await import('@auth0/auth0-react')
    vi.mocked(useAuth0).mockReturnValue({
      ...defaultAuth0State(),
      user: { name: 'Test', email: 'test@example.com' },
      isAuthenticated: true,
      isLoading: false,
    } as unknown as ReturnType<typeof useAuth0>)

    mockGetAccessTokenSilently.mockResolvedValue('fake-access-token')

    const { result } = renderHook(() => useAuthenticatedUser())

    await waitFor(() => {
      expect(result.current.accessToken).toBe('fake-access-token')
    })

    expect(mockGetAccessTokenSilently).toHaveBeenCalled()
  })

  it('logout calls logout with returnTo origin', () => {
    const { result } = renderHook(() => useAuthenticatedUser())

    result.current.logout()

    expect(mockLogout).toHaveBeenCalledWith({
      logoutParams: { returnTo: window.location.origin },
    })
  })
})
