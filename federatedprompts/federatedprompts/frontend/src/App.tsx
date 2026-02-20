import { useState } from 'react'
import PromptEngineer from './pages/PromptEngineer'
import RealEstateDashboard from './pages/RealEstateDashboard'
import './App.css'

type Page = 'home' | 'prompt-engineer' | 'real-estate-dashboard'

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('prompt-engineer')
  const [count, setCount] = useState(0)
  const [status, setStatus] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

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
              onClick={() => setCurrentPage('home')}
              className={`nav-link ${currentPage === 'home' ? 'active' : ''}`}
            >
              Home
            </button>
            <button
              onClick={() => setCurrentPage('prompt-engineer')}
              className={`nav-link ${currentPage === 'prompt-engineer' ? 'active' : ''}`}
            >
              Prompt Engineer
            </button>
            <button
              onClick={() => setCurrentPage('real-estate-dashboard')}
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
            <div className="container">
              <h1>🚀 FederatedPrompts</h1>

              <div className="card">
                <h2>Welcome to FederatedPrompts</h2>
                <p>
                  A powerful tool for generating structured prompts for UML-driven development.
                </p>
                <button
                  onClick={() => setCurrentPage('prompt-engineer')}
                  className="btn btn-primary"
                >
                  Start Creating Prompts →
                </button>
              </div>

              <div className="card">
                <h2>Backend Connection</h2>
                <button onClick={checkHealth} disabled={loading} className="btn btn-secondary">
                  {loading ? 'Checking...' : 'Check Backend Health'}
                </button>
                {status && (
                  <p className={status.includes('✗') ? 'error' : 'success'}>{status}</p>
                )}
              </div>

              <div className="card">
                <h2>Frontend Test</h2>
                <button
                  onClick={() => setCount((count) => count + 1)}
                  className="btn btn-secondary"
                >
                  Count: {count}
                </button>
                <p>React frontend is working!</p>
              </div>

              <div className="info">
                <h3>Features</h3>
                <ul>
                  <li>✓ Generate Gherkin BDD prompts with multiple scenarios</li>
                  <li>✓ Create Jira user stories with acceptance criteria</li>
                  <li>✓ Select from 8 different UML artifact types</li>
                  <li>✓ Federated configuration with 100% API validation</li>
                  <li>✓ LocalStorage + Backend sync for persistence</li>
                  <li>✓ Export prompts in multiple formats</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {currentPage === 'prompt-engineer' && <PromptEngineer />}

        {currentPage === 'real-estate-dashboard' && <RealEstateDashboard />}
      </main>
    </div>
  )
}

export default App
