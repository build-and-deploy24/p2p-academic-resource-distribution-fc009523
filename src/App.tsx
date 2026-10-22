
import { useState, type FormEvent } from 'react'
import './App.css'

type Resource = {
  id: number
  title: string
  unit: string
  year: string
  semester: string
  type: string
  size: string
}

type Page = 'Home' | 'Browse Resources' | 'My Downloads'
type AuthMode = 'login' | 'register'

const resources: Resource[] = [
  {
    id: 1,
    title: 'Introduction to Programming Notes',
    unit: 'Computer Science',
    year: 'Year 1',
    semester: 'Semester 1',
    type: 'Lecture Notes',
    size: '2.4 MB',
  },
  {
    id: 2,
    title: 'Database Systems Revision Paper',
    unit: 'Database Systems',
    year: 'Year 2',
    semester: 'Semester 1',
    type: 'Past Paper',
    size: '1.2 MB',
  },
  {
    id: 3,
    title: 'Software Engineering Notes',
    unit: 'Software Engineering',
    year: 'Year 3',
    semester: 'Semester 2',
    type: 'Lecture Notes',
    size: '3.1 MB',
  },
  {
    id: 4,
    title: 'Web Development Past Paper',
    unit: 'Web Development',
    year: 'Year 2',
    semester: 'Semester 2',
    type: 'Past Paper',
    size: '950 KB',
  },
  {
    id: 5,
    title: 'Advanced Database Notes',
    unit: 'Database Systems',
    year: 'Year 3',
    semester: 'Semester 1',
    type: 'Lecture Notes',
    size: '2.0 MB',
  },
  {
    id: 6,
    title: 'Final Year Project Guidelines',
    unit: 'Software Engineering',
    year: 'Year 4',
    semester: 'Semester 1',
    type: 'Project Guide',
    size: '1.5 MB',
  },
]

const years = ['Year 1', 'Year 2', 'Year 3', 'Year 4']
const semesters = ['Semester 1', 'Semester 2']
const pages: Page[] = ['Home', 'Browse Resources', 'My Downloads']

function App() {
  const [activePage, setActivePage] = useState<Page>('Home')
  const [view, setView] = useState<'browse' | 'auth'>('browse')
  const [authMode, setAuthMode] = useState<AuthMode>('login')
  const [authNotice, setAuthNotice] = useState('')

  const [year, setYear] = useState('All Years')
  const [semester, setSemester] = useState('All Semesters')
  const [unit, setUnit] = useState('All Units')
  const [search, setSearch] = useState('')

  const availableUnits = [
    ...new Set(
      resources
        .filter((resource) => {
          const matchesYear =
            year === 'All Years' || resource.year === year
          const matchesSemester =
            semester === 'All Semesters' ||
            resource.semester === semester

          return matchesYear && matchesSemester
        })
        .map((resource) => resource.unit),
    ),
  ]

  const filteredResources = resources.filter((resource) => {
    const matchesYear =
      year === 'All Years' || resource.year === year

    const matchesSemester =
      semester === 'All Semesters' ||
      resource.semester === semester

    const matchesUnit =
      unit === 'All Units' || resource.unit === unit

    const searchTerm = search.trim().toLowerCase()

    const matchesSearch = [
      resource.title,
      resource.unit,
      resource.type,
      resource.year,
      resource.semester,
    ].some((value) => value.toLowerCase().includes(searchTerm))

    return (
      matchesYear &&
      matchesSemester &&
      matchesUnit &&
      matchesSearch
    )
  })

  function openAuth(mode: AuthMode, notice = '') {
    setAuthMode(mode)
    setAuthNotice(notice)
    setView('auth')
  }

  function returnToBrowse() {
    setView('browse')
    setAuthNotice('')
  }

  function handleYearChange(value: string) {
    setYear(value)
    setUnit('All Units')
  }

  function handleSemesterChange(value: string) {
    setSemester(value)
    setUnit('All Units')
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
                <label htmlFor="year">Academic Year</label>
                <select
                  id="year"
                  value={year}
                  onChange={(event) =>
                    handleYearChange(event.target.value)
                  }
                >
                  <option>All Years</option>
                  {years.map((yearName) => (
                    <option key={yearName}>{yearName}</option>
                  ))}
                </select>
              </div>

              <div className="filter-field">
                <label htmlFor="semester">Semester</label>
                <select
                  id="semester"
                  value={semester}
                  onChange={(event) =>
                    handleSemesterChange(event.target.value)
                  }
                >
                  <option>All Semesters</option>
                  {semesters.map((semesterName) => (
                    <option key={semesterName}>{semesterName}</option>
                  ))}
                </select>
              </div>

              <div className="filter-field">
                <label htmlFor="unit">Unit</label>
                <select
                  id="unit"
                  value={unit}
                  onChange={(event) => setUnit(event.target.value)}
                >
                  <option>All Units</option>
                  {availableUnits.map((unitName) => (
                    <option key={unitName}>{unitName}</option>
                  ))}
                </select>
              </div>

              <div className="filter-field search-field">
                <label htmlFor="search">Search resources</label>
                <input
                  id="search"
                  type="search"
                  placeholder="Search title, unit, year or type..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>
            </div>

            <div className="resource-list">
              {filteredResources.map((resource) => (
                <article className="resource-card" key={resource.id}>
                  <div className="resource-info">
                    <span className="resource-type">
                      {resource.type}
                    </span>
                    <h3>{resource.title}</h3>
                    <p>
                      {resource.unit} · {resource.year} ·{' '}
                      {resource.semester}
                    </p>
                    <span className="resource-size">
                      {resource.size}
                    </span>
                  </div>

                  <button
                    className="resource-action"
                    type="button"
                    onClick={() =>
                      openAuth(
                        'login',
                        'Please log in before downloading a resource. Actual downloads will be enabled when authentication and file access are connected to the backend.',
                      )
                    }
                  >
                    Log in to Download
                  </button>
                </article>
              ))}

              {filteredResources.length === 0 && (
                <div className="empty-state">
                  <h3>No resources found</h3>
                  <p>
                    Try changing the year, semester, unit or search term.
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
