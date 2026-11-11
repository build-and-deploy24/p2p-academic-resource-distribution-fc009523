import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import WebRTCTest from './webrtc/WebRTCTest.tsx'

// Demo route: /webrtc opens the WebRTC test page; every other path
// shows the normal app.
const isWebrtcDemo = window.location.pathname === '/webrtc'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isWebrtcDemo ? <WebRTCTest /> : <App />}
  </StrictMode>,
)