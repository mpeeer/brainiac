import { useEffect, useMemo, useState, type ChangeEvent, type ReactNode } from 'react'
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

type IconName =
  | 'spark' | 'grid' | 'book' | 'pulse' | 'settings' | 'search' | 'arrow' | 'play'
  | 'clock' | 'check' | 'dots' | 'bell' | 'plus' | 'upload' | 'calendar' | 'filter'
  | 'list' | 'trash' | 'close' | 'checkCircle' | 'file' | 'chevron'

type AssignmentStatus = 'todo' | 'in-progress' | 'done'
type ThemeName = 'light' | 'dark' | 'paper'
type AccentName = 'lime' | 'sky' | 'coral' | 'violet'
type DensityName = 'comfortable' | 'compact'
type Preferences = {
  theme: ThemeName
  accent: AccentName
  density: DensityName
  sidebarCollapsed: boolean
  showStats: boolean
}
type Assignment = {
  id: string
  title: string
  className: string
  dueDate: string
  status: AssignmentStatus
  details: string
  source: 'imported' | 'added'
}

const STORAGE_KEY = 'brainiac-assignments-v1'
const PREFERENCES_KEY = 'brainiac-preferences-v1'
const defaultPreferences: Preferences = {
  theme: 'light',
  accent: 'lime',
  density: 'comfortable',
  sidebarCollapsed: false,
  showStats: true,
}
const classColors: Record<string, string> = {
  English: 'coral',
  Mathematics: 'blue',
  Science: 'green',
  History: 'gold',
  Other: 'purple',
}

const starterAssignments: Assignment[] = [
  { id: 'starter-1', title: 'Read chapter 4 and annotate the key ideas', className: 'English', dueDate: '2025-10-24', status: 'in-progress', details: 'Focus on the narrator’s point of view and write three questions in your notes.', source: 'added' },
  { id: 'starter-2', title: 'Practice set: quadratic equations', className: 'Mathematics', dueDate: '2025-10-25', status: 'todo', details: 'Complete problems 1–20. Show your work so it is ready for review.', source: 'added' },
  { id: 'starter-3', title: 'Lab report: plant cell observations', className: 'Science', dueDate: '2025-10-27', status: 'todo', details: 'Upload your results table and a short conclusion from today’s lab.', source: 'added' },
  { id: 'starter-4', title: 'Primary source reflection', className: 'History', dueDate: '2025-10-29', status: 'done', details: 'Compare the two sources and explain one important difference in perspective.', source: 'added' },
]

function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  const paths: Record<IconName, ReactNode> = {
    spark: <><path d="m12 3 1.7 5.3L19 10l-5.3 1.7L12 17l-1.7-5.3L5 10l5.3-1.7L12 3Z" /><path d="m19 16 .7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7L19 16Z" /></>,
    grid: <><rect x="4" y="4" width="6" height="6" rx="1" /><rect x="14" y="4" width="6" height="6" rx="1" /><rect x="4" y="14" width="6" height="6" rx="1" /><rect x="14" y="14" width="6" height="6" rx="1" /></>,
    book: <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5v-16Z" /><path d="M4 18.5A2.5 2.5 0 0 1 6.5 16H20" /></>,
    pulse: <><path d="M3 12h4l2-7 4 14 2-7h6" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.8 1.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V20h-2.6v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1-1.8-1.8.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H6v-2.6h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1L9 6.6l.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.5V5h2.6v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1 1.8 1.8-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.5 1h.1v2.6h-.1a1.7 1.7 0 0 0-1.1 1.4Z" /></>,
    search: <><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 4.5 4.5" /></>,
    arrow: <><path d="M5 12h13" /><path d="m13 6 6 6-6 6" /></>,
    play: <path d="m9 6 9 6-9 6V6Z" />,
    clock: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7v5l3.5 2" /></>,
    check: <path d="m5 12 4.5 4.5L19 7" />,
    dots: <><circle cx="5" cy="12" r="1" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" /><circle cx="19" cy="12" r="1" fill="currentColor" stroke="none" /></>,
    bell: <><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 8.5h18C21 16 18 16 18 9Z" /><path d="M10 21h4" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    upload: <><path d="M12 16V4" /><path d="m7 9 5-5 5 5" /><path d="M5 20h14" /></>,
    calendar: <><rect x="3.5" y="5" width="17" height="15" rx="2" /><path d="M7 3v4M17 3v4M3.5 9h17" /></>,
    filter: <><path d="M4 6h16M7 12h10M10 18h4" /></>,
    list: <><path d="M8 6h12M8 12h12M8 18h12" /><path d="M4 6h.01M4 12h.01M4 18h.01" /></>,
    trash: <><path d="M4 7h16M10 11v5M14 11v5" /><path d="M6 7l1 13h10l1-13M9 7V4h6v3" /></>,
    close: <><path d="m6 6 12 12M18 6 6 18" /></>,
    checkCircle: <><circle cx="12" cy="12" r="8.5" /><path d="m8 12 2.7 2.7L16.5 9" /></>,
    file: <><path d="M6 3.5h8l4 4V20H6z" /><path d="M14 3.5V8h4M9 12h6M9 16h5" /></>,
    chevron: <path d="m8 10 4 4 4-4" />,
  }
  return <svg {...common} aria-hidden="true">{paths[name]}</svg>
}

function makeId() {
  return typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`
}

function useStoredAssignments() {
  const [assignments, setAssignments] = useState<Assignment[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? JSON.parse(saved) as Assignment[] : starterAssignments
    } catch {
      return starterAssignments
    }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(assignments))
  }, [assignments])

  return [assignments, setAssignments] as const
}

function useStoredPreferences() {
  const [preferences, setPreferences] = useState<Preferences>(() => {
    try {
      const saved = localStorage.getItem(PREFERENCES_KEY)
      return saved ? { ...defaultPreferences, ...JSON.parse(saved) } : defaultPreferences
    } catch {
      return defaultPreferences
    }
  })

  useEffect(() => {
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences))
  }, [preferences])

  return [preferences, setPreferences] as const
}

async function extractFileText(file: File): Promise<string> {
  const extension = file.name.toLowerCase().split('.').pop()
  if (extension === 'docx' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    const mammoth = await import('mammoth')
    const result = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() })
    return result.value
  }
  if (extension === 'pdf' || file.type === 'application/pdf') {
    const pdfjsLib = await import('pdfjs-dist')
    pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl
    const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise
    const pages: string[] = []
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber)
      const content = await page.getTextContent()
      pages.push(content.items.map((item) => 'str' in item ? item.str : '').join(' '))
    }
    return pages.join('\\n')
  }
  return file.text()
}

function parseImportedText(text: string): Assignment[] {
  return text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean).map((line) => {
    const parts = line.split(/\s*[|,;]\s*/)
    const title = parts[0]?.replace(/^[-*•]\s*/, '').trim() || 'Untitled assignment'
    const possibleDate = parts.find((part) => /\d{4}[-/]\d{1,2}[-/]\d{1,2}|\d{1,2}[-/]\d{1,2}[-/]\d{2,4}/.test(part))
    const rawDate = possibleDate?.match(/\d{4}[-/]\d{1,2}[-/]\d{1,2}|\d{1,2}[-/]\d{1,2}[-/]\d{2,4}/)?.[0]
    let dueDate = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10)
    if (rawDate) {
      const dateBits = rawDate.split(/[/-]/).map(Number)
      dueDate = dateBits[0] > 999 ? `${dateBits[0]}-${String(dateBits[1]).padStart(2, '0')}-${String(dateBits[2]).padStart(2, '0')}` : `2025-${String(dateBits[0]).padStart(2, '0')}-${String(dateBits[1]).padStart(2, '0')}`
    }
    const className = parts.find((part) => !part.includes(rawDate || '') && part !== title && part.length < 28) || 'Other'
    return { id: makeId(), title, className, dueDate, status: 'todo' as AssignmentStatus, details: 'Imported from your classwork. Add any helpful instructions here when you are ready.', source: 'imported' as const }
  })
}

function formatDueDate(date: string) {
  const today = new Date(); const due = new Date(`${date}T12:00:00`)
  const diff = Math.round((due.getTime() - new Date(`${today.toISOString().slice(0, 10)}T12:00:00`).getTime()) / 86400000)
  if (diff === 0) return 'Due today'
  if (diff === 1) return 'Due tomorrow'
  if (diff < 0) return `${Math.abs(diff)} day${Math.abs(diff) === 1 ? '' : 's'} overdue`
  return `Due ${due.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
}

function App() {
  const [assignments, setAssignments] = useStoredAssignments()
  const [preferences, setPreferences] = useStoredPreferences()
  const [activeNav, setActiveNav] = useState('Assignments')
  const [activeClass, setActiveClass] = useState('All classes')
  const [activeFilter, setActiveFilter] = useState<'all' | AssignmentStatus>('all')
  const [query, setQuery] = useState('')
  const [showImporter, setShowImporter] = useState(false)
  const [importText, setImportText] = useState('')
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null)
  const [focusMode, setFocusMode] = useState(false)
  const [importMessage, setImportMessage] = useState('')
  const [importFileName, setImportFileName] = useState('')
  const [isReadingFile, setIsReadingFile] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  const classNames = useMemo(() => ['All classes', ...Array.from(new Set(assignments.map((assignment) => assignment.className)))], [assignments])
  const filteredAssignments = useMemo(() => assignments.filter((assignment) => {
    const matchesClass = activeClass === 'All classes' || assignment.className === activeClass
    const matchesFilter = activeFilter === 'all' || assignment.status === activeFilter
    const matchesQuery = `${assignment.title} ${assignment.className}`.toLowerCase().includes(query.toLowerCase())
    return matchesClass && matchesFilter && matchesQuery
  }).sort((a, b) => a.dueDate.localeCompare(b.dueDate)), [activeClass, activeFilter, assignments, query])

  const completed = assignments.filter((assignment) => assignment.status === 'done').length
  const dueSoon = assignments.filter((assignment) => assignment.status !== 'done' && new Date(`${assignment.dueDate}T12:00:00`).getTime() - Date.now() < 3 * 86400000).length

  function updateAssignment(id: string, updates: Partial<Assignment>) {
    setAssignments((current) => current.map((assignment) => assignment.id === id ? { ...assignment, ...updates } : assignment))
    setSelectedAssignment((current) => current?.id === id ? { ...current, ...updates } : current)
  }

  function importAssignments() {
    const imported = parseImportedText(importText)
    if (!importText.trim()) {
      setImportMessage('Paste at least one assignment to import.')
      return
    }
    setAssignments((current) => [...current, ...imported])
    setImportText('')
    setImportMessage(`${imported.length} assignment${imported.length === 1 ? '' : 's'} added to your workspace.`)
  }

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    setIsReadingFile(true)
    setImportFileName(file.name)
    setImportMessage('Reading your document…')
    try {
      const text = await extractFileText(file)
      if (!text.trim()) {
        setImportText('')
        setImportMessage('This file did not contain selectable text. If it is a scan, paste the text or use a text-based download.')
        return
      }
      setImportText(text)
      setImportMessage(`${file.name} loaded — review the extracted text below, then add it.`)
    } catch {
      setImportText('')
      setImportMessage('Brainiac could not read that file. Try downloading the Google Doc as .docx, .pdf, .txt, or .csv.')
    } finally {
      setIsReadingFile(false)
    }
  }

  function deleteAssignment(id: string) {
    setAssignments((current) => current.filter((assignment) => assignment.id !== id))
    setSelectedAssignment(null)
  }

  return (
    <div className={`app-shell ${focusMode ? 'focus-mode' : ''} theme-${preferences.theme} accent-${preferences.accent} density-${preferences.density} ${preferences.sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark"><Icon name="spark" size={20} /></span><span>brainiac</span></div>
        <div className="workspace-switcher"><span className="avatar avatar-small">AM</span><span>Alex Morgan</span><span className="chevron">⌄</span></div>
        <nav className="main-nav" aria-label="Main navigation">
          <p className="nav-label">Workspace</p>
          {['Assignments', 'Classes', 'Study plan'].map((item, index) => <button className={`nav-item ${activeNav === item ? 'active' : ''}`} key={item} onClick={() => setActiveNav(item)}><Icon name={index === 0 ? 'list' : index === 1 ? 'book' : 'calendar'} size={17} /><span>{item}</span>{item === 'Assignments' && <span className="nav-count">{assignments.filter((assignment) => assignment.status !== 'done').length}</span>}</button>)}
          <p className="nav-label nav-label-spaced">Personal</p>
          <button className={`nav-item ${activeNav === 'Progress' ? 'active' : ''}`} onClick={() => setActiveNav('Progress')}><Icon name="pulse" size={17} /><span>My progress</span></button>
          <button className={`nav-item ${activeNav === 'Settings' ? 'active' : ''}`} onClick={() => { setActiveNav('Settings'); setShowSettings(true) }}><Icon name="settings" size={17} /><span>Settings</span></button>
        </nav>
        <div className="sidebar-bottom"><div className="streak-card"><div className="flame">✦</div><div><strong>{completed ? `${completed} completed` : 'Ready to begin'}</strong><span>Small steps add up.</span></div></div><div className="sidebar-footer"><span className="status-dot" /> Saved on this device</div></div>
      </aside>

      <main className="content">
        <header className="topbar"><div className="mobile-brand brand"><span className="brand-mark"><Icon name="spark" size={19} /></span><span>brainiac</span></div><label className="search-box"><Icon name="search" size={18} /><input aria-label="Search assignments" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search assignments..." /><kbd>⌘ K</kbd></label><div className="top-actions"><button className="icon-button notification-button" aria-label="Notifications"><Icon name="bell" size={18} /><span /></button><button className="icon-button settings-trigger" aria-label="Customize interface" onClick={() => setShowSettings(true)}><Icon name="settings" size={18} /></button><button className="avatar">AM</button></div></header>
        <div className="page-wrap">
          <section className="homework-welcome"><div><p className="eyebrow">Tuesday, October 24, 2025</p><h1>Your school day, <em>organized.</em></h1><p className="subtitle">Bring your classwork here. Figure it out one step at a time.</p></div><button className={`focus-button ${focusMode ? 'is-on' : ''}`} onClick={() => setFocusMode(!focusMode)}><span className="focus-orb"><Icon name="spark" size={15} /></span>{focusMode ? 'Focus mode on' : 'Focus mode'}</button></section>
          <section className="homework-hero"><div className="hero-copy"><div className="hero-tag"><span className="live-dot" /> Your command center</div><h2>Everything due.<br /><em>Nothing forgotten.</em></h2><p>Import your assignments once, then use Brainiac to decide what to do next.</p><button className="primary-button" onClick={() => { setShowImporter(true); setImportMessage('') }}><Icon name="upload" size={16} /> Import classwork</button></div><div className="hero-illustration" aria-hidden="true"><div className="paper paper-back" /><div className="paper paper-mid" /><div className="paper paper-front"><span>MON</span><b>26</b><i /><i /><i /></div><div className="hero-star">✦</div></div><div className="hero-progress"><span style={{ width: `${assignments.length ? (completed / assignments.length) * 100 : 0}%` }} /></div></section>

          {preferences.showStats && <section className="homework-stats"><div className="homework-stat"><div className="stat-icon green"><Icon name="calendar" size={18} /></div><div><span className="stat-label">On your plate</span><strong>{assignments.filter((assignment) => assignment.status !== 'done').length}</strong><small>active assignment{assignments.filter((assignment) => assignment.status !== 'done').length === 1 ? '' : 's'}</small></div></div><div className="homework-stat"><div className="stat-icon orange"><Icon name="clock" size={18} /></div><div><span className="stat-label">Coming up</span><strong>{dueSoon}</strong><small>due within 3 days</small></div></div><div className="homework-stat"><div className="stat-icon purple"><Icon name="checkCircle" size={18} /></div><div><span className="stat-label">Finished</span><strong>{completed}</strong><small>nice work, keep going</small></div></div></section>}

          <section className="assignment-section"><div className="section-heading"><div><p className="eyebrow">Your workspace</p><h2>Assignments</h2></div><button className="import-button" onClick={() => { setShowImporter(true); setImportMessage('') }}><Icon name="plus" size={15} /> Add assignment</button></div><div className="workspace-toolbar"><div className="class-filters">{classNames.map((className) => <button className={activeClass === className ? 'selected' : ''} key={className} onClick={() => setActiveClass(className)}>{className !== 'All classes' && <span className={`class-dot ${classColors[className] || 'purple'}`} />}{className}</button>)}</div><div className="status-filter"><Icon name="filter" size={15} />{(['all', 'todo', 'in-progress', 'done'] as const).map((filter) => <button key={filter} className={activeFilter === filter ? 'selected' : ''} onClick={() => setActiveFilter(filter)}>{filter === 'all' ? 'All' : filter === 'in-progress' ? 'In progress' : filter === 'todo' ? 'To do' : 'Done'}</button>)}</div></div>
            <div className="assignment-list">{filteredAssignments.length ? filteredAssignments.map((assignment) => <article className={`assignment-row ${assignment.status}`} key={assignment.id} onClick={() => setSelectedAssignment(assignment)}><button className={`assignment-check ${assignment.status}`} aria-label={`Mark ${assignment.title} ${assignment.status === 'done' ? 'to do' : 'done'}`} onClick={(event) => { event.stopPropagation(); updateAssignment(assignment.id, { status: assignment.status === 'done' ? 'todo' : 'done' }) }}>{assignment.status === 'done' && <Icon name="check" size={14} />}</button><div className="assignment-main"><div className="assignment-title-row"><h3>{assignment.title}</h3>{assignment.source === 'imported' && <span className="imported-label"><Icon name="file" size={11} /> Imported</span>}</div><p><span className={`class-dot ${classColors[assignment.className] || 'purple'}`} />{assignment.className}<span className="row-divider" />{assignment.details}</p></div><div className={`due-date ${assignment.status === 'done' ? 'complete' : ''}`}><Icon name={assignment.status === 'done' ? 'checkCircle' : 'calendar'} size={14} /><span>{assignment.status === 'done' ? 'Completed' : formatDueDate(assignment.dueDate)}</span></div><Icon name="chevron" size={16} /></article>) : <div className="empty-state"><span className="empty-icon"><Icon name="search" size={22} /></span><h3>No assignments found</h3><p>Try a different search or import your next piece of classwork.</p><button className="text-button" onClick={() => { setShowImporter(true); setImportMessage('') }}>Import an assignment <Icon name="arrow" size={15} /></button></div>}</div>
          </section>
          <section className="tip-card"><div className="tip-icon"><Icon name="spark" size={18} /></div><div><p className="eyebrow">A better way to start</p><h2>Don’t wait for motivation. Start with 10 minutes.</h2><p>Open the assignment that feels easiest and make one tiny bit of progress.</p></div><button className="outline-button" onClick={() => setFocusMode(true)}>Start a focus session <Icon name="arrow" size={15} /></button></section>
        </div>
      </main>

      {showSettings && <div className="modal-backdrop" onClick={() => setShowSettings(false)}><div className="settings-modal" onClick={(event) => event.stopPropagation()}><button className="modal-close light-close" aria-label="Close customization" onClick={() => setShowSettings(false)}><Icon name="close" size={17} /></button><div className="modal-heading"><span className="modal-icon"><Icon name="settings" size={19} /></span><div><p className="eyebrow">Make it yours</p><h2>Customize Brainiac</h2></div></div><p className="modal-description">Adjust the way your homework workspace looks and feels. Your preferences stay on this device.</p><div className="settings-group"><div><h3>Appearance</h3><p>Choose a calm visual tone.</p></div><div className="choice-grid theme-choices">{([['light', 'Light', 'Clean and bright'], ['dark', 'Dark', 'Easy on the eyes'], ['paper', 'Paper', 'Warm and focused']] as const).map(([value, label, description]) => <button key={value} className={`choice-card ${preferences.theme === value ? 'selected' : ''}`} onClick={() => setPreferences((current) => ({ ...current, theme: value }))}><span className={`theme-preview ${value}`} /><span><b>{label}</b><small>{description}</small></span>{preferences.theme === value && <Icon name="checkCircle" size={16} />}</button>)}</div></div><div className="settings-group"><div><h3>Accent color</h3><p>Pick the energy for buttons and highlights.</p></div><div className="accent-choices">{([['lime', '#c6d98a'], ['sky', '#9edfe0'], ['coral', '#f1ad92'], ['violet', '#c3b5ed']] as const).map(([value, color]) => <button key={value} aria-label={`${value} accent`} className={`accent-choice ${value} ${preferences.accent === value ? 'selected' : ''}`} style={{ '--swatch': color } as React.CSSProperties} onClick={() => setPreferences((current) => ({ ...current, accent: value }))}><span /></button>)}</div></div><div className="settings-group"><div><h3>Workspace density</h3><p>Control how much fits on screen.</p></div><div className="segmented-control"><button className={preferences.density === 'comfortable' ? 'selected' : ''} onClick={() => setPreferences((current) => ({ ...current, density: 'comfortable' }))}>Comfortable</button><button className={preferences.density === 'compact' ? 'selected' : ''} onClick={() => setPreferences((current) => ({ ...current, density: 'compact' }))}>Compact</button></div></div><div className="settings-toggles"><label className="setting-toggle"><span><b>Collapse sidebar</b><small>Give your assignments more room</small></span><input type="checkbox" checked={preferences.sidebarCollapsed} onChange={(event) => setPreferences((current) => ({ ...current, sidebarCollapsed: event.target.checked }))} /><i /></label><label className="setting-toggle"><span><b>Show homework stats</b><small>Keep the progress summary visible</small></span><input type="checkbox" checked={preferences.showStats} onChange={(event) => setPreferences((current) => ({ ...current, showStats: event.target.checked }))} /><i /></label></div><button className="settings-done" onClick={() => setShowSettings(false)}>Done customizing</button></div></div>}
      {showImporter && <div className="modal-backdrop" onClick={() => setShowImporter(false)}><div className="import-modal" onClick={(event) => event.stopPropagation()}><button className="modal-close" aria-label="Close importer" onClick={() => setShowImporter(false)}><Icon name="close" size={17} /></button><div className="modal-heading"><span className="modal-icon"><Icon name="upload" size={19} /></span><div><p className="eyebrow">Bring it in</p><h2>Import your classwork</h2></div></div><p className="modal-description">Download a Google Doc, upload it here, review the extracted text, then turn each line into a homework task. Word, PDF, TXT, and CSV downloads are supported.</p><label className={`drop-zone ${isReadingFile ? 'is-reading' : ''}`}><Icon name="file" size={24} /><strong>{isReadingFile ? 'Reading your document…' : 'Drop a download here or click to browse'}</strong><span>{importFileName || 'Google Docs: File → Download → .docx or .pdf'}</span><input type="file" accept=".txt,.csv,.docx,.pdf,text/plain,text/csv,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={handleFile} disabled={isReadingFile} /></label><div className="or-divider"><span>or paste a list</span></div><textarea className="import-textarea" value={importText} onChange={(event) => setImportText(event.target.value)} placeholder={'Read chapter 4 | English | 2025-10-24\nPractice set 1-20 | Mathematics | 2025-10-25'} /><div className="import-footer"><span className={importMessage.includes('added') ? 'success-message' : 'import-message'}>{importMessage || 'Your file stays in this browser; only the extracted text is used.'}</span><button className="primary-button" onClick={importAssignments} disabled={isReadingFile}><Icon name="plus" size={15} /> Add to workspace</button></div></div></div>}
      {selectedAssignment && <div className="modal-backdrop" onClick={() => setSelectedAssignment(null)}><div className="assignment-modal" onClick={(event) => event.stopPropagation()}><button className="modal-close light-close" aria-label="Close assignment" onClick={() => setSelectedAssignment(null)}><Icon name="close" size={17} /></button><div className={`assignment-modal-band ${classColors[selectedAssignment.className] || 'purple'}`}><span className="class-dot" />{selectedAssignment.className}<span className="modal-source">{selectedAssignment.source === 'imported' ? 'Imported' : 'Added manually'}</span></div><p className="eyebrow">{selectedAssignment.status === 'done' ? 'Completed assignment' : 'Your next step'}</p><h2>{selectedAssignment.title}</h2><div className="detail-meta"><span><Icon name="calendar" size={15} /> {selectedAssignment.status === 'done' ? 'Finished' : formatDueDate(selectedAssignment.dueDate)}</span><span><Icon name="clock" size={15} /> 25 min focus</span></div><p className="modal-description">{selectedAssignment.details}</p><div className="assignment-actions"><button className="primary-button" onClick={() => updateAssignment(selectedAssignment.id, { status: selectedAssignment.status === 'done' ? 'todo' : 'done' })}><Icon name={selectedAssignment.status === 'done' ? 'play' : 'check'} size={15} /> {selectedAssignment.status === 'done' ? 'Move back to to do' : 'Mark as complete'}</button><button className="delete-button" onClick={() => deleteAssignment(selectedAssignment.id)}><Icon name="trash" size={15} /> Delete</button></div></div></div>}
    </div>
  )
}

export default App
