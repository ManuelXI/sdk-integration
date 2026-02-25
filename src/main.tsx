import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { configure } from '@monterosa/sdk-core'
import { monterosaConfig } from './config'
import './index.css'
import App from './App.tsx'

configure(monterosaConfig)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
