// frontend/src/main.jsx
// The actual entry point Vite/index.html loads. Mounts the React app into
// the #root div and sets up app-wide providers (StrictMode, toast notifications).

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* Renders toast.success()/toast.error() popups triggered anywhere in the app */}
    <Toaster position="top-right" />
    <App />
  </StrictMode>,

)
