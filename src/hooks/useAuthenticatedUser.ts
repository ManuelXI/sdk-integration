import { useAuth0 } from '@auth0/auth0-react'
import { useEffect, useState } from 'react'

export function useAuthenticatedUser() {
  const {
    user,
    isAuthenticated,
    isLoading,
    getAccessTokenSilently,
    loginWithRedirect,
    logout,
  } = useAuth0()
  const [accessToken, setAccessToken] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated || isLoading) {
      const id = setTimeout(() => setAccessToken(null), 0)
      return () => clearTimeout(id)
    }
    let cancelled = false
    getAccessTokenSilently()
      .then((token) => {
        if (cancelled) return
        setAccessToken(token || null)
      })
      .catch((err) => {
        if (!cancelled) {
          console.error('Error getting access token:', err)
          setAccessToken(null)
        }
      })
    return () => {
      cancelled = true
    }
  }, [isAuthenticated, isLoading, getAccessTokenSilently])

  const handleLogout = () => {
    logout({ logoutParams: { returnTo: window.location.origin } })
  }

  return {
    user,
    accessToken,
    isAuthenticated,
    isLoading,
    loginWithRedirect,
    logout: handleLogout,
  }
}
