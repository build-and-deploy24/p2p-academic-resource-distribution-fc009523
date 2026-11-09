
import { useEffect, useState, type FormEvent } from 'react'
import {
  getSemesters,
  getUnits,
  getFiles,
  downloadUrl,
  formatSize,
  type Semester,
  type Unit,
  type ApiFile,
} from './api'
import './App.css'


type Page = 'Home' | 'Browse Resources' | 'My Downloads'
type AuthMode = 'login' | 'register'


const pages: Page[] = ['Home', 'Browse Resources', 'My Downloads']

function App() {
  const [activePage, setActivePage] = useState<Page>('Home')
  const [view, setView] = useState<'browse' | 'auth'>('browse')
  const [authMode, setAuthMode] = useState<AuthMode>('login')
  const [authNotice, setAuthNotice] = useState('')

   const [semesterList, setSemesterList] = useState<Semester[]>([])
  const [unitList, setUnitList] = useState<Unit[]>([])
  const [files, setFiles] = useState<ApiFile[]>([])
  const [semesterId, setSemesterId] = useState('')
  const [unitId, setUnitId] = useState('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    getSemesters()
      .then(setSemesterList)
      .catch(() =>
        setError('Could not load semesters. Is the backend running?'),
      )
  }, [])

  function handleSemesterChange(value: string) {
    setSemesterId(value)
    setUnitId('')
    setUnitList([])
    setFiles([])
    setError('')
    if (!value) return
    getUnits(value)
      .then(setUnitList)
      .catch(() => setError('Could not load units.'))
  }

  function handleUnitChange(value: string) {
    setUnitId(value)
    setFiles([])
    setError('')
    if (!value) return
    setLoading(true)
    getFiles(value)
      .then(setFiles)
      .catch(() => setError('Could not load files.'))
      .finally(() => setLoading(false))
  }

  const searchTerm = search.trim().toLowerCase()
  const filteredResources = files.filter((file) =>
    file.title.toLowerCase().includes(searchTerm),
  )
  const selectedUnit = unitList.find((u) => u.id === unitId)

  function openAuth(mode: AuthMode, notice = '') {
    setAuthMode(mode)
    setAuthNotice(notice)
    setView('auth')
  }

  function returnToBrowse() {
    setView('browse')
    setAuthNotice('')
  }




  function handleAuthSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const form = event.currentTarget
    const formData = new FormData(form)
    const password = String(formData.get('password') ?? '')
    const confirmPassword = String(
      formData.get('confirmPassword') ?? '',
    )

    if (authMode === 'register' && password !== confirmPassword) {
      setAuthNotice('Your passwords do not match. Please try again.')
      return
    }

    setAuthNotice(
      'Your form is valid, but account creation and login are not active yet. We will connect this form to the backend authentication API when it is ready.',
    )
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <button
            className="brand"
            type="button"
            onClick={returnToBrowse}
            aria-label="CampusShare home"
          >
            <span className="brand-name">CampusShare</span>
            <span className="brand-tagline">
              Peer-to-Peer Academic Resource Distribution
            </span>
          </button>

          <span className="header-badge">Student Portal</span>
        </div>
      </header>

      <nav className="navigation" aria-label="Main navigation">
        {pages.map((page) => (
          <button
            key={page}
            type="button"
            className={`nav-button ${
              view === 'browse' && activePage === page ? 'active' : ''
            }`}
            onClick={() => {
              if (page === 'My Downloads') {
                openAuth(
                  'login',
                  'Please log in to access your personal downloads. Authentication will be enabled when the backend is connected.',
                )
                return
              }

              setActivePage(page)
              returnToBrowse()
            }}
          >
            {page}
          </button>
        ))}

        <button
          type="button"
          className="nav-login"
          onClick={() => openAuth('login')}
        >
          Login / Register
        </button>
      </nav>

      {view === 'auth' ? (
        <main className="auth-page">
          <section className="auth-card">
            <button
              className="auth-back"
              type="button"
              onClick={returnToBrowse}
            >
              ← Back to CampusShare
            </button>

            <div className="auth-heading">
              <p className="eyebrow">CAMPUSSHARE STUDENT PORTAL</p>
              <h2>
                {authMode === 'login'
                  ? 'Welcome back'
                  : 'Create your account'}
              </h2>
              <p>
                {authMode === 'login'
                  ? 'Log in to access your student downloads.'
                  : 'Join CampusShare to access academic resources.'}
              </p>
            </div>

            <div className="auth-tabs">
              <button
                type="button"
                className={`auth-tab ${
                  authMode === 'login' ? 'active' : ''
                }`}
                onClick={() => openAuth('login')}
              >
                Login
              </button>
              <button
                type="button"
                className={`auth-tab ${
                  authMode === 'register' ? 'active' : ''
                }`}
                onClick={() => openAuth('register')}
              >
                Register
              </button>
            </div>

            <form className="auth-form" onSubmit={handleAuthSubmit}>
              {authMode === 'register' && (
                <div className="auth-field">
                  <label htmlFor="fullName">Full name</label>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    autoComplete="name"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
              )}

              <div className="auth-field">
                <label htmlFor="email">Email address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="Enter your email address"
                  required
                />
              </div>

              <div className="auth-field">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete={
                    authMode === 'login'
                      ? 'current-password'
                      : 'new-password'
                  }
                  placeholder="At least 8 characters"
                  minLength={8}
                  required
                />
              </div>

              {authMode === 'register' && (
                <div className="auth-field">
                  <label htmlFor="confirmPassword">
                    Confirm password
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    placeholder="Enter your password again"
                    minLength={8}
                    required
                  />
                </div>
              )}

              {authNotice && (
                <p className="auth-message" role="status">
                  {authNotice}
                </p>
              )}

              <button className="auth-submit" type="submit">
                {authMode === 'login' ? 'Log In' : 'Create Account'}
              </button>
            </form>

            <p className="auth-switch">
              {authMode === 'login'
                ? "Don't have an account? "
                : 'Already have an account? '}
              <button
                type="button"
                onClick={() =>
                  openAuth(
                    authMode === 'login' ? 'register' : 'login',
                  )
                }
              >
                {authMode === 'login' ? 'Register' : 'Log in'}
              </button>
            </p>

            <p className="auth-note">
              Authentication is a frontend demonstration until the
              backend API is connected. Do not enter a real password
              into this demonstration form.
            </p>
          </section>
        </main>
      ) : (
        <main className="dashboard">
          <section className="welcome">
            <p className="eyebrow">YOUR LEARNING SPACE</p>
            <h2>
              {activePage === 'Browse Resources'
                ? 'Browse Learning Resources'
                : 'Welcome to CampusShare'}
            </h2>
            <p>
              Find lecture notes, past papers and revision materials.
              Browse materials from any year and learn together with
              fellow students.
            </p>
          </section>

          <section className="resource-section">
            <div className="section-heading">
              <div>
                <h2>Academic Resources</h2>
                <p>
                  Choose your filters or search across all years of study.
                </p>
              </div>

              <span className="resource-count">
                {filteredResources.length}{' '}
                {filteredResources.length === 1
                  ? 'resource'
                  : 'resources'}
              </span>
            </div>

            <div className="filters">
                            <div className="filter-field">
                <label htmlFor="semester">Semester</label>
                <select
                  id="semester"
                  value={semesterId}
                  onChange={(event) =>
                    handleSemesterChange(event.target.value)
                  }
                >
                  <option value="">Select a semester</option>
                  {semesterList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-field">
                <label htmlFor="unit">Unit</label>
                <select
                  id="unit"
                  value={unitId}
                  disabled={!semesterId}
                  onChange={(event) =>
                    handleUnitChange(event.target.value)
                  }
                >
                  <option value="">Select a unit</option>
                  {unitList.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-field search-field">
                <label htmlFor="search">Search resources</label>
                <input
                  id="search"
                  type="search"
                  placeholder="Search by file title..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>
            </div>

            {error && <p role="alert">{error}</p>}
            {loading && <p>Loading files...</p>}
            <div className="resource-list">
                            {filteredResources.map((file) => (
                <article className="resource-card" key={file.id}>
                  <div className="resource-info">
                    <span className="resource-type">
                      {file.fileType.toUpperCase()}
                    </span>
                    <h3>{file.title}</h3>
                    <p>{selectedUnit?.name}</p>
                    <span className="resource-size">
                      {formatSize(file.sizeBytes)}
                    </span>
                  </div>

                  {/* Changed from the login-gated button: the API's download
                      route needs no login yet. Restore the old button when
                      authentication is added. */}
                  <a
                    className="resource-action"
                    href={downloadUrl(file.id)}
                    download
                    style={{
                      textDecoration: 'none',
                      display: 'inline-block',
                      textAlign: 'center',
                    }}
                  >
                    Download
                  </a>
                </article>
              ))}

              {filteredResources.length === 0 && (
                <div className="empty-state">
                  <h3>No resources found</h3>
                  <p>
                    Choose a semester and a unit to see files
                  </p>
                  <button
                    type="button"
                    className="reset-button"
                    onClick={() => {
                      setYear('All Years')
                      setSemester('All Semesters')
                      setUnit('All Units')
                      setSearch('')
                    }}
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </div>
          </section>
        </main>
      )}

      <footer className="footer">
        <p>CampusShare · Learn together, share resources.</p>
        <p>Peer-assisted academic resource sharing for students.</p>
      </footer>
    </div>
  )
}

export default App
