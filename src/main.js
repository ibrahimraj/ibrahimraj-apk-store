import { supabase } from './supabase.js'
import './style.css'


// ==========================================
// ADMIN ROUTES — KEEP UNCHANGED
// ==========================================


if (window.location.pathname === '/admin/categories') {
  await import('./admin/categories.js')


} else if (window.location.pathname === '/admin/reviews') {
  await import('./admin/reviews.js')


} else if (window.location.pathname === '/admin/apps') {
  await import('./admin/apps.js')


} else if (window.location.pathname === '/admin/downloads') {
  await import('./admin/downloads.js')


} else if (window.location.pathname === '/admin/dashboard') {
  await import('./admin/dashboard.js')


} else if (
  window.location.pathname === '/admin' ||
  window.location.pathname === '/admin/' ||
  window.location.pathname === '/admin/login'
) {
  await import('./admin/login.js')


} else {


// ==========================================
// APPNEXA PUBLIC STORE
// ==========================================


const root = document.querySelector('#app')


const BRAND = 'APPNEXA'
const OWNER = 'By IbrahimRaj'


let apps = []
let categories = []
let versions = []
let selectedCategory = 'All Apps'


const escapeHTML = (value = '') =>
  String(value).replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  })[char])


const safeURL = value => {
  try {
    const url = new URL(value)


    if (
      url.protocol === 'https:' ||
      url.protocol === 'http:'
    ) {
      return url.href
    }
  } catch (error) {
    return ''
  }


  return ''
}


const getInitials = (name = 'A') =>
  String(name)
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(word => word[0] || '')
    .join('')
    .toUpperCase()


// ==========================================
// VERSION HELPERS
// ==========================================


const getAppVersions = appId =>
  versions
    .filter(v => String(v.app_id) === String(appId))
    .sort((a, b) => Number(b.version_code || 0) - Number(a.version_code || 0))


const getVersion = appId =>
  getAppVersions(appId)[0] || null


const formatPublishDate = value => {
  if (!value) return 'Publish date unavailable'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 'Publish date unavailable'
  }

  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}


const getCategory = app => {
  const category = categories.find(
    c => String(c.id) === String(app.category_id)
  )


  return category
    ? category.name || category.category_name || category.title || category.slug || 'Other'
    : app.category_name || 'Other'
}


const getAppLink = app =>
  `?app=${encodeURIComponent(app.slug || app.id)}`


const getIcon = app => {
  const url = safeURL(app.icon_url)


  if (url) {
    return `
      <img
        src="${escapeHTML(url)}"
        alt="${escapeHTML(app.name)}"
        onerror="this.style.display='none'"
      >
    `
  }


  return `<span>${escapeHTML(getInitials(app.name))}</span>`
}


// ==========================================
// HEADER
// ==========================================


function renderHeader() {
  return `
    <header class="nx-header">
      <a href="/" class="nx-brand">
        <span class="nx-brand-icon">A</span>
        <span class="nx-brand-name">
          APP<span>NEXA</span>
          <small>BY IBRAHIMRAJ</small>
        </span>
      </a>


      <nav class="nx-nav">
        <a href="/">Home</a>
        <a href="/#collections">Explore</a>
        <a href="/#categories">Categories</a>
      </nav>


      <a href="/#apps" class="nx-header-button">
        Explore Store ↗
      </a>
    </header>
  `
}


// ==========================================
// FOOTER
// ==========================================


function renderFooter() {
  return `
    <footer class="nx-footer">
      <div class="nx-footer-brand">
        <span class="nx-brand-icon">A</span>
        <div>
          <strong>APPNEXA</strong>
          <small>By IbrahimRaj</small>
        </div>
      </div>


      <p>
        © 2026 APPNEXA. All rights reserved.
      </p>


      <a href="mailto:support@ibrahimraj.org">
        Contact
      </a>
    </footer>
  `
}


// ==========================================
// LOAD DATABASE
// ==========================================


async function loadStoreData() {
  const [appResult, categoryResult, versionResult] =
    await Promise.all([
      supabase
        .from('apps')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false }),


      supabase
        .from('categories')
        .select('*'),


      supabase
        .from('app_versions')
        .select('*')
        .eq('status', 'published')
        .order('version_code', { ascending: false })
    ])


  if (appResult.error) {
    console.error('Apps error:', appResult.error)
    throw appResult.error
  }


  apps = appResult.data || []
  categories = categoryResult.data || []
  versions = versionResult.data || []


  if (categoryResult.error) {
    console.warn('Categories error:', categoryResult.error)
  }


  if (versionResult.error) {
    console.warn('Versions error:', versionResult.error)
  }
}


// ==========================================
// APP CARD — ICON + NAME ONLY
// ==========================================


function renderAppCard(app) {
  return `
    <a
      href="${escapeHTML(getAppLink(app))}"
      class="nx-app-card"
      title="${escapeHTML(app.name)}"
    >
      <div class="nx-app-icon">
        ${getIcon(app)}
      </div>


      <span class="nx-app-name">
        ${escapeHTML(app.name)}
      </span>
    </a>
  `
}


// ==========================================
// COLLECTION
// ==========================================


function renderCollection(title, subtitle, items, id = '') {
  if (!items.length) return ''


  return `
    <section class="nx-collection" ${id ? `id="${id}"` : ''}>
      <div class="nx-section-heading">
        <div>
          <h2>${escapeHTML(title)}</h2>
          <p>${escapeHTML(subtitle)}</p>
        </div>
      </div>


      <div class="nx-app-grid">
        ${items.map(renderAppCard).join('')}
      </div>
    </section>
  `
}


// ==========================================
// HOMEPAGE
// ==========================================


function renderHome() {
  const featuredApps = apps.filter(app => app.is_featured)
  const newestApps = apps.slice(0, 8)


  const verifiedApps = apps.filter(app =>
    app.is_verified === true || app.verified === true
  )


  const collectionApps = apps


  root.innerHTML = `
    ${renderHeader()}


    <main class="nx-home">


      <section class="nx-hero">
        <div class="nx-hero-content">


          <span class="nx-eyebrow">
            ✦ YOUR ANDROID APP DESTINATION
          </span>


          <h1>
            Discover Apps.<br>
            <span>Experience More.</span>
          </h1>


          <p>
            Explore useful Android applications,
            smart tools and digital experiences
            in one place.
          </p>


          <a href="#collections" class="nx-primary-button">
            Explore Applications ↗
          </a>


          <div class="nx-hero-caption">
            <span>✓ Curated Applications</span>
            <span>✓ Regular Updates</span>
            <span>✓ By IbrahimRaj</span>
          </div>


        </div>


        <div class="nx-hero-art">
          <div class="nx-hero-orbit"></div>
          <div class="nx-hero-symbol">A</div>
          <span>APPNEXA</span>
        </div>
      </section>


      <section class="nx-store-content" id="collections">


        <div class="nx-search">
          <span>⌕</span>
          <input
            id="nxSearch"
            type="search"
            placeholder="Search apps..."
          >
        </div>


        <div class="nx-category-area" id="categories">
          <div class="nx-category-list" id="nxCategories">
            <button class="nx-category active" data-category="All Apps">
              All Apps
            </button>
          </div>
        </div>


        <div id="nxSearchResults" hidden>
          <div class="nx-section-heading">
            <div>
              <h2>Search Results</h2>
              <p>Applications matching your search</p>
            </div>
          </div>


          <div class="nx-app-grid" id="nxSearchGrid"></div>
          <p class="nx-empty" id="nxSearchEmpty" hidden>
            No applications found.
          </p>
        </div>


        <div id="nxCollections">


          ${renderCollection(
            "Editor's Choice",
            'Selected applications from APPNEXA',
            featuredApps
          )}


          ${renderCollection(
            'Verified Apps',
            'Applications marked as verified',
            verifiedApps
          )}


          ${renderCollection(
            'Newly Published',
            'Discover the latest applications',
            newestApps
          )}


          ${renderCollection(
            'Explore All Apps',
            'Find your next favourite application',
            collectionApps,
            'apps'
          )}


        </div>


        ${apps.length === 0 ? `
          <p class="nx-empty">
            No applications have been published yet.
          </p>
        ` : ''}


      </section>


      <section class="nx-brand-story">
        <span class="nx-eyebrow">OUR MISSION</span>


        <h2>
          Technology made simple.
        </h2>


        <p>
          APPNEXA is an independent Android app marketplace
          created by IbrahimRaj to make discovering
          useful applications easier.
        </p>
      </section>


    </main>


    ${renderFooter()}
  `


  setupHomeEvents()
}


// ==========================================
// HOMEPAGE EVENTS
// ==========================================


function setupHomeEvents() {
  const search = document.querySelector('#nxSearch')
  const categoryBox = document.querySelector('#nxCategories')


  const uniqueCategories = [
    ...new Set(apps.map(getCategory))
  ]


  categoryBox.innerHTML = `
    <button
      class="nx-category active"
      data-category="All Apps"
    >
      All Apps
    </button>


    ${uniqueCategories.map(category => `
      <button
        class="nx-category"
        data-category="${escapeHTML(category)}"
      >
        ${escapeHTML(category)}
      </button>
    `).join('')}
  `


  search.addEventListener('input', renderSearch)


  categoryBox.addEventListener('click', event => {
    const button = event.target.closest('.nx-category')


    if (!button) return


    selectedCategory = button.dataset.category


    categoryBox.querySelectorAll('.nx-category')
      .forEach(item => item.classList.remove('active'))


    button.classList.add('active')


    renderSearch()
  })
}


// ==========================================
// SEARCH + CATEGORY FILTER
// ==========================================


function renderSearch() {
  const query = document.querySelector('#nxSearch')
    .value.toLowerCase().trim()


  const results = apps.filter(app => {
    const matchesText =
      String(app.name || '').toLowerCase().includes(query) ||
      String(app.description || '').toLowerCase().includes(query) ||
      getCategory(app).toLowerCase().includes(query)


    const matchesCategory =
      selectedCategory === 'All Apps' ||
      getCategory(app) === selectedCategory


    return matchesText && matchesCategory
  })


  const searchResults = document.querySelector('#nxSearchResults')
  const collections = document.querySelector('#nxCollections')


  if (query || selectedCategory !== 'All Apps') {
    searchResults.hidden = false
    collections.hidden = true
  } else {
    searchResults.hidden = true
    collections.hidden = false
  }


  document.querySelector('#nxSearchGrid').innerHTML =
    results.map(renderAppCard).join('')


  document.querySelector('#nxSearchEmpty').hidden =
    results.length > 0
}


// ==========================================
// APP DETAILS PAGE
// URL: ?app=APP-SLUG
// ==========================================


function renderDetails(app) {
  const appVersions = getAppVersions(app.id)
  const version = appVersions[0] || null
  const olderVersions = appVersions.slice(1)
  const category = getCategory(app)

  const versionName = version
    ? version.version_name || 'Unknown'
    : 'Not released'

  const latestPublishDate = version
    ? formatPublishDate(version.released_at)
    : 'Not published'

  const latestDownloadURL = version
    ? safeURL(version.apk_object_key)
    : ''

  const latestDownloadButton = version && latestDownloadURL
    ? `
      <button
        class="nx-primary-button nx-download-button"
        data-app-id="${escapeHTML(app.id)}"
        data-version-id="${escapeHTML(version.id)}"
        data-url="${escapeHTML(latestDownloadURL)}"
      >
        Download Latest APK ↓
      </button>
    `
    : `
      <p class="nx-notice">
        No published APK version is available yet.
      </p>
    `

  const olderVersionsHTML = olderVersions.length
    ? olderVersions.map(oldVersion => {
        const oldDownloadURL = safeURL(oldVersion.apk_object_key)

        return `
          <article class="nx-version-item">
            <div class="nx-version-info">
              <strong>Version ${escapeHTML(oldVersion.version_name || 'Unknown')}</strong>
              <span>Published: ${escapeHTML(formatPublishDate(oldVersion.released_at))}</span>
              <span>Minimum Android: ${escapeHTML(oldVersion.min_android_version || 'Not specified')}</span>
              ${oldVersion.changelog ? `
                <p>${escapeHTML(oldVersion.changelog)}</p>
              ` : ''}
            </div>

            ${oldDownloadURL ? `
              <button
                type="button"
                class="nx-secondary-download nx-download-button"
                data-app-id="${escapeHTML(app.id)}"
                data-version-id="${escapeHTML(oldVersion.id)}"
                data-url="${escapeHTML(oldDownloadURL)}"
              >
                Download ↓
              </button>
            ` : `
              <span class="nx-version-unavailable">Unavailable</span>
            `}
          </article>
        `
      }).join('')
    : `
      <p class="nx-version-empty">
        No older versions are available yet.
      </p>
    `

  root.innerHTML = `
    ${renderHeader()}

    <main class="nx-details-page">
      <a href="/" class="nx-back-link">
        ← Back to APPNEXA
      </a>

      <section class="nx-details-hero">
        <div class="nx-details-icon">
          ${getIcon(app)}
        </div>

        <div class="nx-details-heading">
          <span class="nx-eyebrow">
            ${escapeHTML(category)}
          </span>

          <h1>${escapeHTML(app.name)}</h1>

          <p>
            ${escapeHTML(app.developer_name || OWNER)}
          </p>

          <div class="nx-details-meta">
            <span>Latest: ${escapeHTML(versionName)}</span>
            <span>Android Application</span>
          </div>

          ${latestDownloadButton}
        </div>
      </section>

      <section class="nx-details-section nx-latest-version">
        <div class="nx-version-section-heading">
          <div>
            <span class="nx-eyebrow">LATEST RELEASE</span>
            <h2>Latest Update</h2>
          </div>
          <span class="nx-latest-badge">LATEST</span>
        </div>

        ${version ? `
          <div class="nx-latest-version-card">
            <div class="nx-latest-version-top">
              <strong>Version ${escapeHTML(version.version_name || 'Unknown')}</strong>
              <span>Published ${escapeHTML(latestPublishDate)}</span>
            </div>

            <div class="nx-latest-version-meta">
              <span>Version Code: ${escapeHTML(version.version_code ?? '—')}</span>
              <span>Minimum Android: ${escapeHTML(version.min_android_version || 'Not specified')}</span>
            </div>

            ${version.changelog ? `
              <div class="nx-latest-changelog">
                <h3>What's New</h3>
                <p>${escapeHTML(version.changelog)}</p>
              </div>
            ` : ''}
          </div>
        ` : `
          <p class="nx-version-empty">
            This app has not published a version yet.
          </p>
        `}
      </section>

      <section class="nx-details-section">
        <h2>About this app</h2>
        <p class="nx-description">
          ${escapeHTML(app.description || 'No description available.')}
        </p>
      </section>

      <section class="nx-details-section">
        <h2>Application Information</h2>

        <div class="nx-info-grid">
          <div>
            <span>App Name</span>
            <strong>${escapeHTML(app.name)}</strong>
          </div>

          <div>
            <span>Developer</span>
            <strong>${escapeHTML(app.developer_name || OWNER)}</strong>
          </div>

          <div>
            <span>Category</span>
            <strong>${escapeHTML(category)}</strong>
          </div>

          <div>
            <span>Latest Version</span>
            <strong>${escapeHTML(versionName)}</strong>
          </div>

          <div>
            <span>Package Name</span>
            <strong>${escapeHTML(app.package_name || 'Not specified')}</strong>
          </div>

          <div>
            <span>Minimum Android</span>
            <strong>
              ${escapeHTML(version?.min_android_version || 'Not specified')}
            </strong>
          </div>
        </div>
      </section>

      <section class="nx-details-section nx-version-history">
        <div class="nx-version-section-heading">
          <div>
            <span class="nx-eyebrow">RELEASE ARCHIVE</span>
            <h2>Older Versions</h2>
            <p class="nx-version-subtitle">
              Download a previous release of this application.
            </p>
          </div>
          <span class="nx-version-count">${olderVersions.length} ${olderVersions.length === 1 ? 'version' : 'versions'}</span>
        </div>

        <div class="nx-version-list">
          ${olderVersionsHTML}
        </div>
      </section>
    </main>

    ${renderFooter()}
  `

  setupDownloadEvent()
}


// ==========================================
// DOWNLOAD + TRACKING — ALL VERSIONS
// ==========================================


function setupDownloadEvent() {
  const detailsPage = document.querySelector('.nx-details-page')

  if (!detailsPage) return

  detailsPage.addEventListener('click', async event => {
    const button = event.target.closest('.nx-download-button')

    if (!button) return

    const appId = button.dataset.appId
    const versionId = button.dataset.versionId
    const downloadURL = safeURL(button.dataset.url)

    if (!appId || !versionId || !downloadURL) {
      alert('Download information is unavailable.')
      return
    }

    if (button.disabled) return

    const originalText = button.textContent

    button.disabled = true
    button.textContent = 'Preparing...'

    try {
      const { error } = await supabase.rpc(
        'record_app_download',
        {
          p_app_id: appId,
          p_app_version_id: versionId
        }
      )

      if (error) {
        console.error('Download tracking error:', error)
        alert(
          'Download tracking could not be saved, but your download will continue.'
        )
      }

      window.location.href = downloadURL

    } catch (error) {
      console.error('Download error:', error)
      alert('Something went wrong. Please try again.')
      button.disabled = false
      button.textContent = originalText
    }
  })
}


// ==========================================
// PAGE ROUTER
// ==========================================


async function startStore() {
  root.innerHTML = `
    <div class="nx-loading">
      <div class="nx-loading-icon">A</div>
      <p>Loading APPNEXA...</p>
    </div>
  `


  await loadStoreData()


  const params = new URLSearchParams(window.location.search)
  const appSlug = params.get('app')


  if (appSlug) {
    const selectedApp = apps.find(app =>
      String(app.slug || app.id) === appSlug ||
      String(app.id) === appSlug
    )


    if (selectedApp) {
      renderDetails(selectedApp)
      return
    }


    root.innerHTML = `
      ${renderHeader()}


      <main class="nx-not-found">
        <h1>App not found</h1>
        <p>This application may have been removed or is unavailable.</p>
        <a href="/" class="nx-primary-button">
          Back to APPNEXA
        </a>
      </main>


      ${renderFooter()}
    `


    return
  }


  renderHome()
}


// ==========================================
// INITIALIZE
// ==========================================


startStore().catch(error => {
  console.error('APPNEXA initialization error:', error)


  root.innerHTML = `
    <main class="nx-error">
      <h2>Something went wrong</h2>
      <p>Unable to load APPNEXA. Please refresh the page.</p>
      <button onclick="location.reload()">
        Try Again
      </button>
    </main>
  `
})


}