import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// No StrictMode — three-globe / WebGL double-mount causes ghost arcs & labels
createRoot(document.getElementById('root')).render(<App />)
