
import { supabase } from '../supabase.js'
import './dashboard.css'

const app = document.querySelector('#app')

app.innerHTML = `
  <div class="admin-layout">

    <aside class="admin-sidebar">
      <div class="admin-brand">
        <span class="admin-brand-icon">IR</span>
        <span>Ibrahim<span>Raj</span></span>
      </div>

      <p class="sidebar-label">MAIN MENU</p>

      <nav class="admin-nav">
        <a href="/admin/dashboard" class="active">▦ Dashboard</a>
        <a href="/admin/apps">▣ Applications</a>
       <a href="/admin/categories">▤ Categories</a>
        <a href="/admin/downloads">⇩ Downloads</a>
        <a href="#reviews">☆ Reviews</a>
        <a href="#users">♙ Users</a>
      </nav>

      <p class="sidebar-label">SYSTEM</p>

      <nav class="admin-nav">
        <a href="#settings">⚙ Settings</a>
        <a href="/" target="_blank">↗ View Website</a>
      </nav>

      <button id="logoutButton" class="logout-button">
        ⇥ Sign Out
      </button>
    </aside>

    <main class="admin-main">

      <header class="admin-header">
        <div>
          <span class="dashboard-eyebrow">ADMINISTRATION</span>
          <h1>Dashboard</h1>
        </div>

        <div class="admin-user">
          <div class="admin-avatar">IR</div>
          <div>
            <strong>Administrator</strong>
            <small id="adminEmail">Loading...</small>
          </div>
        </div>
      </header>

      <section class="welcome-panel">
        <div>
          <span>WELCOME BACK 👋</span>
          <h2>Manage your digital store.</h2>
          <p>Everything you need to manage IbrahimRaj APK Store.</p>
        </div>
        <div class="welcome-logo">IR</div>
      </section>

      <section class="dashboard-stats">

        <div class="stat-card">
          <span>Total Applications</span>
          <h2 id="totalApps">—</h2>
          <small>All registered apps</small>
        </div>

        <div class="stat-card">
          <span>Published Apps</span>
          <h2 id="publishedApps">—</h2>
          <small>Currently published</small>
        </div>

        <div class="stat-card">
          <span>Categories</span>
          <h2 id="totalCategories">—</h2>
          <small>Active categories</small>
        </div>

        <div class="stat-card">
          <span>Total Downloads</span>
          <h2 id="totalDownloads">—</h2>
          <small>Recorded downloads</small>
        </div>

      </section>

      <section class="management-section">
        <div class="management-heading">
          <div>
            <span class="dashboard-eyebrow">STORE MANAGEMENT</span>
            <h2>Recent Applications</h2>
          </div>

          <button id="refreshButton">↻ Refresh</button>
        </div>

        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>APPLICATION</th>
                <th>PACKAGE NAME</th>
                <th>STATUS</th>
                <th>CREATED</th>
              </tr>
            </thead>

            <tbody id="appsTable">
              <tr>
                <td colspan="4">Loading applications...</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <footer class="admin-footer">
        IbrahimRaj APK Store Administration · 2026
      </footer>

    </main>
  </div>
`

const adminEmail = document.querySelector('#adminEmail')
const appsTable = document.querySelector('#appsTable')

async function checkAdmin() {
  const { data: { user }, error } =
    await supabase.auth.getUser()

  if (error || !user) {
    window.location.href = '/admin/login'
    return null
  }

  const { data: profile, error: profileError } =
    await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

  if (profileError || !profile || profile.role !== 'admin') {
    await supabase.auth.signOut()
    window.location.href = '/admin/login'
    return null
  }

  adminEmail.textContent = user.email

  return user
}

async function loadDashboard() {
  const user = await checkAdmin()

  if (!user) return

  const queries = await Promise.all([
    supabase.from('apps').select('*', { count: 'exact', head: true }),
    supabase.from('apps').select('*', { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('categories').select('*', { count: 'exact', head: true }),
    supabase.from('downloads').select('*', { count: 'exact', head: true }),
    supabase.from('apps')
      .select('name, package_name, status, created_at')
      .order('created_at', { ascending: false })
      .limit(10)
  ])

  const [
    apps,
    published,
    categories,
    downloads,
    recent
  ] = queries

  const errors = queries.filter(result => result.error)

  if (errors.length) {
    console.error('Dashboard data error:', errors)
    appsTable.innerHTML = `
      <tr><td colspan="4">Could not load dashboard data.</td></tr>
    `
    return
  }

  document.querySelector('#totalApps').textContent = apps.count ?? 0
  document.querySelector('#publishedApps').textContent = published.count ?? 0
  document.querySelector('#totalCategories').textContent = categories.count ?? 0
  document.querySelector('#totalDownloads').textContent = downloads.count ?? 0

  if (!recent.data || recent.data.length === 0) {
    appsTable.innerHTML = `
      <tr><td colspan="4">No applications added yet.</td></tr>
    `
    return
  }

  appsTable.innerHTML = recent.data.map(item => `
    <tr>
      <td>${escapeHTML(item.name)}</td>
      <td>${escapeHTML(item.package_name)}</td>
      <td>
        <span class="status ${item.status}">
          ${escapeHTML(item.status)}
        </span>
      </td>
      <td>${new Date(item.created_at).toLocaleDateString()}</td>
    </tr>
  `).join('')
}

function escapeHTML(value) {
  return String(value ?? '').replace(/[&<>"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[character])
}

document.querySelector('#refreshButton')
  .addEventListener('click', loadDashboard)

document.querySelector('#logoutButton')
  .addEventListener('click', async () => {
    await supabase.auth.signOut()
    window.location.href = '/admin/login'
  })

loadDashboard()
