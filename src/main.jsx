import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import NotFound from './components/NotFound.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import { I18nProvider } from './i18n/index.jsx'

/** App lives on `/` (query deep-links allowed). Anything else is 404. */
function isAppRoute(pathname = window.location.pathname) {
  const p = (pathname || '/').replace(/\/+$/, '') || '/'
  return p === '/'
}

// No StrictMode — three-globe / WebGL double-mount causes ghost arcs & labels
createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
    <I18nProvider>{isAppRoute() ? <App /> : <NotFound />}</I18nProvider>
  </ErrorBoundary>
)
