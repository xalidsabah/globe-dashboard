import { Component } from 'react'
import { MESSAGES } from '../i18n/translations'

function crashCopy() {
  let lang = 'en'
  try {
    lang = localStorage.getItem('wg-lang') || 'en'
  } catch {
    /* ignore */
  }
  const m = MESSAGES[lang] || MESSAGES.en
  return {
    appName: m.appName || 'Global View',
    title: m.somethingWrong || 'Something went wrong',
    body: m.crashBody || 'Reload to try again.',
    reload: m.reload || 'Reload',
  }
}

/** Minimal crash screen — keeps the quiet aesthetic if React fails */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('App error:', error, info)
  }

  render() {
    if (this.state.error) {
      const copy = crashCopy()
      return (
        <div className="flex h-full w-full items-center justify-center bg-[#050a14] px-6 text-center">
          <div className="max-w-sm">
            <p className="text-[11px] font-medium tracking-wide text-sky-400/70">{copy.appName}</p>
            <h1 className="mt-2 text-lg font-medium text-white/90">{copy.title}</h1>
            <p className="mt-2 text-[13px] leading-relaxed text-white/40">{copy.body}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-5 rounded-full bg-white px-5 py-2 text-sm font-medium text-[#0a1220] transition hover:bg-white/90"
            >
              {copy.reload}
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
