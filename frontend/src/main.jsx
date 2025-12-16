import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'  // ← Solo este CSS es necesario
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)