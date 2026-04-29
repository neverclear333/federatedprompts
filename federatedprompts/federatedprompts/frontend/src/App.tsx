import { useState, useEffect } from 'react'
import PromptEngineer from './pages/PromptEngineer'
import RealEstateDashboard from './pages/RealEstateDashboard'
import './App.css'

type Page = 'home' | 'prompt-engineer' | 'real-estate-dashboard'

type SliderKey = 'temperature' | 'pressure' | 'timelines' | 'algorithm'

interface SliderSpec {
  key: SliderKey
  label: string
  // 5 segment background colors, left -> right
  segments: [string, string, string, string, string]
  // 6 tick labels, left -> right
  ticks: [string, string, string, string, string, string]
}

const SLIDER_SPECS: SliderSpec[] = [
  {
    key: 'temperature',
    label: 'Temperature',
    segments: ['#DBEAFE', '#93C5FD', '#9CA3AF', '#2563EB', '#1E3A8A'],
    ticks: ['0.0', '0.2', '0.4', '0.6', '0.8', '1.0'],
  },
  {
    key: 'pressure',
    label: 'Pressure',
    segments: ['#DCFCE7', '#86EFAC', '#9CA3AF', '#16A34A', '#14532D'],
    ticks: ['Very Low', 'Low', 'Med', 'Med High', 'High', 'Very High'],
  },
  {
    key: 'timelines',
    label: 'Timelines',
    segments: ['#FEE2E2', '#FCA5A5', '#9CA3AF', '#DC2626', '#7F1D1D'],
    ticks: ['Now', 'Today', 'This Week', 'This Month', 'This Quarter', 'This Year'],
  },
  {
    key: 'algorithm',
    label: 'Algorithm',
    segments: ['#EDE9FE', '#C4B5FD', '#9CA3AF', '#7C3AED', '#4C1D95'],
    ticks: ['Greedy', 'Heuristic', 'Balanced', 'Optimized', 'Exhaustive', 'Brute-force'],
  },
]

const SLIDER_STORAGE_KEY = 'federatedprompts.homeSliders'

function loadSliderState(): Record<SliderKey, number> {
  const defaults: Record<SliderKey, number> = {
    temperature: 0,
    pressure: 0,
    timelines: 0,
    algorithm: 0,
  }
  try {
    const raw = localStorage.getItem(SLIDER_STORAGE_KEY)
    if (!raw) return defaults
    const parsed = JSON.parse(raw)
    return {
      temperature: clampTick(parsed.temperature ?? 0),
      pressure: clampTick(parsed.pressure ?? 0),
      timelines: clampTick(parsed.timelines ?? 0),
      algorithm: clampTick(parsed.algorithm ?? 0),
    }
  } catch {
    return defaults
  }
}

function clampTick(n: unknown): number {
  const num = typeof n === 'number' ? n : Number(n)
  if (!Number.isFinite(num)) return 0
  return Math.max(0, Math.min(5, Math.round(num)))
}

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('prompt-engineer')
  const [count, setCount] = useState(0)
  const [status, setStatus] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [sliderValues, setSliderValues] = useState<Record<SliderKey, number>>(loadSliderState)

  // Persist slider state on change
  useEffect(() => {
    try {
      localStorage.setItem(SLIDER_STORAGE_KEY, JSON.stringify(sliderValues))
    } catch {
      // ignore storage errors (private mode, quota)
    }
  }, [sliderValues])

  const setSlider = (key: SliderKey, value: number) => {
    setSliderValues((prev) => ({ ...prev, [key]: clampTick(value) }))
  }

  // Initialize page from URL on mount
  useEffect(() => {
    const path = window.location.pathname

    if (path === '/' || path === '') {
      setCurrentPage('home')
    } else if (path === '/prompt-engineer') {
      setCurrentPage('prompt-engineer')
    } else if (path === '/real-estate-dashboard') {
      setCurrentPage('real-estate-dashboard')
    } else {
      setCurrentPage('prompt-engineer') // Default
    }
  }, [])

  // Update URL when page changes
  const navigateTo = (page: Page) => {
    setCurrentPage(page)

    const pathMap: Record<Page, string> = {
      'home': '/',
      'prompt-engineer': '/prompt-engineer',
      'real-estate-dashboard': '/real-estate-dashboard',
    }

    window.history.pushState({}, '', pathMap[page])
  }

  const checkHealth = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/health')
      const data = await response.json()
      setStatus(`✓ Backend is running: ${data.status}`)
    } catch (error) {
      setStatus('✗ Failed to connect to backend')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app">
      {/* Navigation */}
      <nav className="app-nav">
        <div className="nav-content">
          <h1 className="nav-title">FederatedPrompts</h1>
          <div className="nav-links">
            <button
              onClick={() => navigateTo('home')}
              className={`nav-link ${currentPage === 'home' ? 'active' : ''}`}
            >
              Home
            </button>
            <button
              onClick={() => navigateTo('prompt-engineer')}
              className={`nav-link ${currentPage === 'prompt-engineer' ? 'active' : ''}`}
            >
              Prompt Engineer
            </button>
            <button
              onClick={() => navigateTo('real-estate-dashboard')}
              className={`nav-link ${currentPage === 'real-estate-dashboard' ? 'active' : ''}`}
            >
              Real Estate CRM
            </button>
          </div>
        </div>
      </nav>

      {/* Page Content */}
      <main className="app-main">
        {currentPage === 'home' && (
          <div className="home-page">
            <section className="sliders-area">
              {SLIDER_SPECS.map((spec) => (
                <div className="slider-row" key={spec.key}>
                  <div className="slider-label">{spec.label}</div>
                  <div className="slider-control-wrap">
                    <div className="slider-track">
                      <div className="slider-segments" aria-hidden="true">
                        {spec.segments.map((color, i) => (
                          <div
                            key={i}
                            className="slider-segment"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                      <div className="slider-ticks">
                        {spec.ticks.map((tick, i) => (
                          <button
                            key={tick + i}
                            type="button"
                            className={
                              'slider-tick' +
                              (sliderValues[spec.key] === i ? ' is-active' : '')
                            }
                            style={{ left: `${(i / 5) * 100}%` }}
                            aria-label={`${spec.label}: ${tick}`}
                            aria-pressed={sliderValues[spec.key] === i}
                            onClick={() => setSlider(spec.key, i)}
                          >
                            <span className="slider-tick-dot" />
                            <span className="slider-tick-label">{tick}</span>
                          </button>
                        ))}
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={5}
                        step={1}
                        value={sliderValues[spec.key]}
                        onChange={(e) => setSlider(spec.key, Number(e.target.value))}
                        className="slider-range"
                        aria-label={spec.label}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </section>

            <section className="cards-row">
              <div className="card card-compact">
                <h2>Welcome</h2>
                <p>Structured prompts for UML-driven development.</p>
                <button
                  onClick={() => navigateTo('prompt-engineer')}
                  className="btn btn-primary"
                >
                  Start Prompts →
                </button>
              </div>

              <div className="card card-compact">
                <h2>Real Estate CRM</h2>
                <p>Clients, campaigns, and tasks pipeline.</p>
                <button
                  onClick={() => navigateTo('real-estate-dashboard')}
                  className="btn btn-primary"
                >
                  Open CRM →
                </button>
              </div>

              <div className="card card-compact">
                <h2>Backend</h2>
                <button onClick={checkHealth} disabled={loading} className="btn btn-secondary">
                  {loading ? 'Checking…' : 'Check Health'}
                </button>
                {status && (
                  <p className={status.includes('✗') ? 'error' : 'success'}>{status}</p>
                )}
              </div>

              <div className="card card-compact">
                <h2>Frontend</h2>
                <button
                  onClick={() => setCount((c) => c + 1)}
                  className="btn btn-secondary"
                >
                  Count: {count}
                </button>
                <p>React is working.</p>
              </div>

              <div className="card card-compact card-features">
                <h2>Features</h2>
                <ul>
                  <li>Gherkin BDD prompts</li>
                  <li>Jira user stories</li>
                  <li>8 UML artifact types</li>
                  <li>Federated config + API validation</li>
                  <li>LocalStorage + backend sync</li>
                </ul>
              </div>
            </section>
          </div>
        )}

        {currentPage === 'prompt-engineer' && <PromptEngineer />}

        {currentPage === 'real-estate-dashboard' && <RealEstateDashboard />}
      </main>
    </div>
  )
}

export default App
