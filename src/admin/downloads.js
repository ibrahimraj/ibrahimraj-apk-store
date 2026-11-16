import { supabase } from '../supabase.js'
import './apps.css'
import './downloads.css'

const app = document.querySelector('#app')

let allDownloads = []
let currentPage = 1
const PAGE_SIZE = 15

const escapeHTML = (value = '') => String(value).replace(/[&<>"']/g, char => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#039;'
})[char])

const formatDate = value => {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleString('en-GB', {
    timeZone: 'Asia/Riyadh',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getApp = item => Array.isArray(item.apps) ? item.apps[0] : item.apps
const getVersion = item => Array.isArray(item.app_versions)
  ? item.app_versions[0]
  : item.app_versions

async function checkAdmin() {
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    window.location.href = '/admin'
    return false
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profileError || profile?.role !== 'admin') {
    await supabase.auth.signOut()
    window.location.href = '/admin'
    return false
  }

  return true
}

function renderLayout() {
  app.innerHTML = `
    <div class="admin-layout">
      <aside class="admin-sidebar">
        <a class="admin-brand" href="/admin/dashboard">
          <span class="admin-brand-icon">IR</span>
          <span>Ibrahim<span class="green">Raj</span></span>
        </a>

        <p class="sidebar-label">MAIN MENU</p>

        <nav class="admin-nav">
          <a href="/admin/dashboard" class="admin-nav-link">
            <span>▦</span> Dashboard
          </a>
          <a href="/admin/apps" class="admin-nav-link">
            <span>▣</span> Applications
          </a>
          <a href="/admin/categories" class="admin-nav-link">
            <span>▤</span> Categories
          </a>
          <a href="/admin/downloads" class="admin-nav-link active">
            <span>⇩</span> Downloads
          </a>
          <a href="/admin/reviews" class="admin-nav-link">
            <span>☆</span> Reviews
          </a>
          <a href="/admin/users" class="admin-nav-link">
            <span>♙</span> Users
          </a>
          <a href="/admin/settings" class="admin-nav-link">
            <span>⚙</span> Settings
          </a>
        </nav>

        <div class="admin-sidebar-bottom">
          <a href="/" class="admin-nav-link">
            <span>↗</span> View Website
          </a>
          <button id="signOutBtn" class="admin-nav-link signout-btn">
            <span>⇥</span> Sign Out
          </button>
        </div>
      </aside>

      <main class="admin-main">
        <header class="downloads-header">
          <div>
            <p class="downloads-eyebrow">ANALYTICS / DOWNLOADS</p>
            <h1>Downloads</h1>
            <p class="downloads-subtitle">
              Track application downloads and version activity.
            </p>
          </div>
          <button id="refreshBtn" class="download-action">
            ↻ Refresh
          </button>
        </header>

        <section class="download-stats">
          <article class="download-stat-card">
            <span class="stat-icon">⇩</span>
            <p>Total Downloads</p>
            <h2 id="totalDownloads">—</h2>
            <small>All recorded downloads</small>
          </article>

          <article class="download-stat-card">
            <span class="stat-icon">▣</span>
            <p>Applications</p>
            <h2 id="totalApps">—</h2>
            <small>Apps with downloads</small>
          </article>

          <article class="download-stat-card">
            <span class="stat-icon">♙</span>
            <p>Unique Users</p>
            <h2 id="uniqueUsers">—</h2>
            <small>Identified user accounts</small>
          </article>

          <article class="download-stat-card">
            <span class="stat-icon">◷</span>
            <p>Latest Download</p>
            <h2 id="latestDownload">—</h2>
            <small>Most recent activity</small>
          </article>
        </section>

        <section class="download-panel">
          <div class="download-panel-heading">
            <div>
              <h2>Download History</h2>
              <p>Review recent APK download activity.</p>
            </div>
            <button id="exportBtn" class="download-export">
              ↓ Export CSV
            </button>
          </div>

          <div class="download-toolbar">
            <input
              id="downloadSearch"
              type="search"
              placeholder="Search app, version or user ID..."
            />
            <select id="appFilter">
              <option value="">All Applications</option>
            </select>
          </div>

          <div id="downloadMessage" class="download-message">
            Loading download records...
          </div>

          <div class="download-table-wrap">
            <table class="download-table">
              <thead>
                <tr>
                  <th>APPLICATION</th>
                  <th>VERSION</th>
                  <th>USER ID</th>
                  <th>DATE & TIME</th>
                </tr>
              </thead>
              <tbody id="downloadRows"></tbody>
            </table>
          </div>

          <div class="download-pagination">
            <span id="pageInfo">Page 1</span>
            <div>
              <button id="prevPage">← Previous</button>
              <button id="nextPage">Next →</button>
            </div>
          </div>
        </section>

        <section class="download-panel top-apps-panel">
          <div class="download-panel-heading">
            <div>
              <h2>Top Downloaded Applications</h2>
              <p>Ranking based on the loaded download records.</p>
            </div>
          </div>
          <div id="topAppsList" class="top-apps-list">
            Loading...
          </div>
        </section>
      </main>
    </div>
  `

  document.getElementById('signOutBtn').addEventListener('click', async () => {
    await supabase.auth.signOut()
    window.location.href = '/admin'
  })

  document.getElementById('refreshBtn').addEventListener('click', loadDownloads)
  document.getElementById('downloadSearch').addEventListener('input', () => {
    currentPage = 1
    renderDownloads()
  })
  document.getElementById('appFilter').addEventListener('change', () => {
    currentPage = 1
    renderDownloads()
  })
  document.getElementById('prevPage').addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--
      renderDownloads()
    }
  })
  document.getElementById('nextPage').addEventListener('click', () => {
    currentPage++
    renderDownloads()
  })
  document.getElementById('exportBtn').addEventListener('click', exportCSV)
}

async function loadDownloads() {
  const message = document.getElementById('downloadMessage')
  message.textContent = 'Loading download records...'

  document.getElementById('refreshBtn').disabled = true

  try {
    const { data, error, count } = await supabase
      .from('downloads')
      .select(`
        id,
        app_id,
        app_version_id,
        user_id,
        created_at,
        apps(name, slug),
        app_versions(version_name, version_code)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .limit(1000)

    if (error) throw error

    allDownloads = data || []

    updateStats(count ?? allDownloads.length)
    updateAppFilter()
    renderDownloads()
    renderTopApps()

    if (allDownloads.length === 0) {
      message.textContent = 'No download records found yet.'
    } else if (count > allDownloads.length) {
      message.textContent =
        `Showing the latest ${allDownloads.length} of ${count} records.`
    } else {
      message.textContent = `${allDownloads.length} download records loaded.`
    }

  } catch (error) {
    console.error('Downloads error:', error)
    message.textContent = `Could not load downloads: ${error.message}`
  } finally {
    document.getElementById('refreshBtn').disabled = false
  }
}

function updateStats(totalCount) {
  const appIds = new Set(allDownloads.map(item => item.app_id).filter(Boolean))
  const userIds = new Set(allDownloads.map(item => item.user_id).filter(Boolean))

  document.getElementById('totalDownloads').textContent =
    Number(totalCount).toLocaleString()

  document.getElementById('totalApps').textContent = appIds.size
  document.getElementById('uniqueUsers').textContent = userIds.size

  const latest = allDownloads[0]?.created_at

  document.getElementById('latestDownload').textContent = latest
    ? new Date(latest).toLocaleDateString('en-GB', {
        timeZone: 'Asia/Riyadh',
        day: '2-digit',
        month: 'short'
      })
    : '—'
}

function updateAppFilter() {
  const select = document.getElementById('appFilter')
  const previousValue = select.value

  const apps = new Map()

  allDownloads.forEach(item => {
    const appInfo = getApp(item)
    if (item.app_id) {
      apps.set(item.app_id, appInfo?.name || 'Unknown App')
    }
  })

  select.innerHTML = '<option value="">All Applications</option>' +
    [...apps.entries()].map(([id, name]) =>
      `<option value="${escapeHTML(id)}">${escapeHTML(name)}</option>`
    ).join('')

  if (apps.has(previousValue)) select.value = previousValue
}

function getFilteredDownloads() {
  const search = document.getElementById('downloadSearch').value
    .trim()
    .toLowerCase()

  const selectedApp = document.getElementById('appFilter').value

  return allDownloads.filter(item => {
    const appInfo = getApp(item)
    const version = getVersion(item)

    const matchesApp = !selectedApp || item.app_id === selectedApp

    const searchable = [
      appInfo?.name,
      appInfo?.slug,
      version?.version_name,
      version?.version_code,
      item.user_id,
      item.id
    ].join(' ').toLowerCase()

    return matchesApp && searchable.includes(search)
  })
}

function renderDownloads() {
  const filtered = getFilteredDownloads()
  const tbody = document.getElementById('downloadRows')

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  currentPage = Math.min(currentPage, totalPages)

  const start = (currentPage - 1) * PAGE_SIZE
  const pageItems = filtered.slice(start, start + PAGE_SIZE)

  if (!pageItems.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="4" class="download-empty">
          No matching download records.
        </td>
      </tr>
    `
  } else {
    tbody.innerHTML = pageItems.map(item => {
      const appInfo = getApp(item)
      const version = getVersion(item)

      return `
        <tr>
          <td>
            <div class="download-app-name">
              <span class="download-app-icon">IR</span>
              <div>
                <strong>${escapeHTML(appInfo?.name || 'Unknown App')}</strong>
                <small>${escapeHTML(appInfo?.slug || item.app_id || '')}</small>
              </div>
            </div>
          </td>
          <td>
            <span class="version-pill">
              ${escapeHTML(version?.version_name || 'Unknown')}
            </span>
          </td>
          <td>
            <span class="user-id" title="${escapeHTML(item.user_id || 'Guest')}">
              ${escapeHTML(item.user_id
                ? item.user_id.slice(0, 8) + '...'
                : 'Guest')}
            </span>
          </td>
          <td>${escapeHTML(formatDate(item.created_at))}</td>
        </tr>
      `
    }).join('')
  }

  document.getElementById('pageInfo').textContent =
    `Page ${currentPage} of ${totalPages} · ${filtered.length} records`

  document.getElementById('prevPage').disabled = currentPage <= 1
  document.getElementById('nextPage').disabled = currentPage >= totalPages
}

function renderTopApps() {
  const counts = new Map()

  allDownloads.forEach(item => {
    const appInfo = getApp(item)
    const key = item.app_id || 'unknown'
    const current = counts.get(key) || {
      name: appInfo?.name || 'Unknown App',
      count: 0
    }
    current.count++
    counts.set(key, current)
  })

  const sorted = [...counts.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  const container = document.getElementById('topAppsList')

  if (!sorted.length) {
    container.innerHTML = '<p class="download-empty">No app activity yet.</p>'
    return
  }

  const max = Math.max(...sorted.map(item => item.count), 1)

  container.innerHTML = sorted.map((item, index) => `
    <div class="top-app-row">
      <div class="top-app-number">${index + 1}</div>
      <div class="top-app-info">
        <div class="top-app-label">
          <strong>${escapeHTML(item.name)}</strong>
          <span>${item.count.toLocaleString()} downloads</span>
        </div>
        <div class="top-app-track">
          <div class="top-app-fill" style="width:${(item.count / max) * 100}%"></div>
        </div>
      </div>
    </div>
  `).join('')
}

function exportCSV() {
  const rows = getFilteredDownloads()

  if (!rows.length) {
    alert('No records available to export.')
    return
  }

  const csvRows = [
    ['App Name', 'App ID', 'Version', 'Version Code', 'User ID', 'Date']
  ]

  rows.forEach(item => {
    const appInfo = getApp(item)
    const version = getVersion(item)

    csvRows.push([
      appInfo?.name || 'Unknown App',
      item.app_id || '',
      version?.version_name || '',
      version?.version_code ?? '',
      item.user_id || 'Guest',
      formatDate(item.created_at)
    ])
  })

  const csv = '\uFEFF' + csvRows.map(row =>
    row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(',')
  ).join('\r\n')

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = `ibrahimraj-downloads-${new Date().toISOString().slice(0, 10)}.csv`
  link.click()

  URL.revokeObjectURL(url)
}

async function init() {
  const allowed = await checkAdmin()
  if (!allowed) return

  renderLayout()
  await loadDownloads()
}

init()
