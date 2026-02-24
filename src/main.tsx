import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { configure } from '@monterosa/sdk-core'
import './index.css'
import App from './App.tsx'

configure({
  host: 'cdn-dev.monterosa.cloud',
  projectId: 'ee6ff42c-88e0-4439-9946-c4d88e8505da',
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
