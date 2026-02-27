import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { configure } from '@monterosa/sdk-core'
import { Auth0Provider } from '@auth0/auth0-react'
import { monterosaConfig } from './config'
import { NotificationProvider } from './contexts/NotificationContext'
import './index.css'
import App from './App.tsx'

configure(monterosaConfig)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Auth0Provider
      domain={import.meta.env.VITE_AUTH0_DOMAIN}
      clientId={import.meta.env.VITE_AUTH0_CLIENT_ID}
      cacheLocation="localstorage"
      authorizationParams={{
        redirect_uri: window.location.origin,
        ...(import.meta.env.VITE_AUTH0_AUDIENCE && {
          audience: import.meta.env.VITE_AUTH0_AUDIENCE,
        }),
      }}
    >
      <NotificationProvider>
        <App />
      </NotificationProvider>
    </Auth0Provider>
  </StrictMode>,
)
