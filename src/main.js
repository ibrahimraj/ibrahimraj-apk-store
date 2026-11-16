
import { supabase } from './supabase.js'
import './style.css'


// ==========================================
// ADMIN ROUTES
// ==========================================

if (window.location.pathname === '/admin/categories') {

  await import('./admin/categories.js')


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
  // HELPERS
  // ==========================================

  const escapeHTML = (value = '') => {

    return String(value).replace(/[&<>"']/g, char => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    })[char])

  }


  const getInitials = (name = 'IR') => {

    return String(name)
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map(word => word[0] || '')
      .join('')
      .toUpperCase()

  }


  const safeURL = (url) => {

    try {

      const parsed = new URL(url)

      if (
        parsed.protocol === 'https:' ||
        parsed.protocol === 'http:'
      ) {
        return parsed.href
      }

    } catch (error) {

      return ''

    }

    return ''

  }


  // ==========================================
  // PAGE LAYOUT
  // ==========================================

  document.querySelector('#app').innerHTML = `

    <header class="navbar">

      <a href="#" class="brand">

        <span class="brand-icon">IR</span>

        <span>
          Ibrahim<span class="green">Raj</span>
        </span>

      </a>


      <nav class="nav-links">

        <a href="#home">Home</a>
        <a href="#apps">Explore Apps</a>
        <a href="#categories">Categories</a>
        <a href="#about">About</a>

      </nav>


      <a href="#apps" class="nav-button">
        Explore Store ↗
      </a>

    </header>


    <main>


      <section class="hero" id="home">

        <div class="hero-content">


          <span class="eyebrow">
            ✦ INDEPENDENT ANDROID APP MARKETPLACE
          </span>


          <h1>
            Discover Apps.<br>
            <span class="green">Experience More.</span>
          </h1>


          <p>
            Explore useful Android applications,
            smart tools and innovative software
            developed by IbrahimRaj.
          </p>


          <div class="hero-actions">

            <a href="#apps" class="primary-button">
              Explore Applications ↗
            </a>


            <a href="#about" class="secondary-button">
              About IbrahimRaj
            </a>

          </div>


          <div class="hero-info">

            <span>✓ Independent Developer</span>
            <span>✓ Android Applications</span>
            <span>✓ Regular Updates</span>

          </div>


        </div>


        <div class="hero-decoration">

          <div class="orbit orbit-one"></div>
          <div class="orbit orbit-two"></div>

          <div class="hero-logo">IR</div>

          <span class="floating-tag">
            ANDROID APPS
          </span>

        </div>

      </section>


      <section class="apps-section" id="apps">


        <div class="search-box">

          <span>⌕</span>

          <input
            id="searchInput"
            type="search"
            placeholder="Search applications..."
          >

        </div>


        <div class="category-list" id="categories">

          <button
            class="category-btn active"
            data-category="All Apps">

            All Apps

          </button>

        </div>


        <div class="app-grid" id="appGrid"></div>


        <p class="empty-state" id="emptyState" hidden>
          No applications found. Try another search.
        </p>


      </section>


      <section class="featured-section">

        <div class="featured-content">


          <span class="eyebrow">
            OUR MISSION
          </span>


          <h2>
            Technology made simple.
          </h2>


          <p>
            IbrahimRaj is an independent software brand
            focused on building useful Android applications
            and practical digital tools.
          </p>


          <a href="#about" class="primary-button">
            Discover Our Story ↗
          </a>


        </div>

      </section>


      <section class="about" id="about">


        <span class="eyebrow">
          ABOUT IBRAHIMRAJ
        </span>


        <h2>
          Built with passion.<br>
          <span class="green">Made for everyone.</span>
        </h2>


        <p>
          Our mission is to create simple, useful and
          reliable digital applications for Android users.
        </p>


      </section>


    </main>


    <footer>


      <div class="footer-brand">

        <span class="brand-icon">IR</span>

        <strong>
          Ibrahim<span class="green">Raj</span>
        </strong>

      </div>


      <p>
        © 2026 IbrahimRaj APK Store. All rights reserved.
      </p>


      <div class="footer-links">

        <a href="#about">About</a>
        <a href="#apps">Applications</a>
        <a href="mailto:support@ibrahimraj.org">Contact</a>

      </div>


    </footer>


    <div class="modal-overlay" id="appModal" hidden>


      <div class="modal">


        <button class="modal-close" id="closeModal">
          ×
        </button>


        <div id="modalContent"></div>


      </div>


    </div>

  `


  // ==========================================
  // ELEMENTS
  // ==========================================

  const appGrid = document.querySelector('#appGrid')

  const searchInput = document.querySelector('#searchInput')

  const emptyState = document.querySelector('#emptyState')

  const categoryList = document.querySelector('#categories')


  const modal = document.querySelector('#appModal')

  const modalContent = document.querySelector('#modalContent')


  let apps = []

  let selectedCategory = 'All Apps'


  // ==========================================
  // LOAD PUBLISHED APPS FROM SUPABASE
  // ==========================================

  async function loadApps() {


    appGrid.innerHTML = `
      <p class="empty-state">
        Loading applications...
      </p>
    `


    emptyState.hidden = true


    const [appsResult, categoriesResult, versionsResult] =
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


    // Apps query error

    if (appsResult.error) {


      console.error(
        'Apps loading error:',
        appsResult.error
      )


      appGrid.innerHTML = ''


      emptyState.textContent =
        'Unable to load applications. Please try again.'


      emptyState.hidden = false


      return

    }


    const databaseApps = appsResult.data || []

    const databaseCategories = categoriesResult.data || []

    const databaseVersions = versionsResult.data || []


    if (categoriesResult.error) {

      console.warn(
        'Categories loading warning:',
        categoriesResult.error
      )

    }


    if (versionsResult.error) {

      console.warn(
        'Versions loading warning:',
        versionsResult.error
      )

    }


    // ==========================================
    // CATEGORY LOOKUP
    // ==========================================

    const categoryMap = {}


    databaseCategories.forEach(category => {


      const categoryName =
        category.name ||
        category.category_name ||
        category.title ||
        category.slug ||
        'Other'


      categoryMap[String(category.id)] = categoryName


    })


    // ==========================================
    // LATEST VERSION LOOKUP
    // ==========================================

    const versionMap = {}


    databaseVersions.forEach(version => {


      const appId = String(version.app_id)


      if (!versionMap[appId]) {

        versionMap[appId] = version

      }


    })


    // ==========================================
    // PREPARE APPS
    // ==========================================

    apps = databaseApps.map(app => {


      const category =
        categoryMap[String(app.category_id)] ||
        app.category_name ||
        'Other'


      const latestVersion =
        versionMap[String(app.id)] || null


      return {

        ...app,

        category,

        icon: getInitials(app.name),

        version: latestVersion
          ? latestVersion.version_name
          : 'Not released',

        latestVersion

      }


    })


    // ==========================================
    // DYNAMIC CATEGORY FILTERS
    // ==========================================

    const uniqueCategories = [
      ...new Set(apps.map(app => app.category))
    ]


    categoryList.innerHTML = `

      <button
        class="category-btn active"
        data-category="All Apps">

        All Apps

      </button>


      ${uniqueCategories.map(category => `

        <button
          class="category-btn"
          data-category="${escapeHTML(category)}">

          ${escapeHTML(category)}

        </button>

      `).join('')}

    `


    selectedCategory = 'All Apps'


    renderApps()


    console.log(
      'IBRAHIMRAJ LIVE APPS LOADED:',
      apps.length
    )


  }


  // ==========================================
  // RENDER APPLICATIONS
  // ==========================================

  function renderApps() {


    const query = searchInput.value
      .toLowerCase()
      .trim()


    const filteredApps = apps.filter(app => {


      const matchesSearch =

        String(app.name || '')
          .toLowerCase()
          .includes(query) ||


        String(app.category || '')
          .toLowerCase()
          .includes(query) ||


        String(app.description || '')
          .toLowerCase()
          .includes(query)


      const matchesCategory =

        selectedCategory === 'All Apps' ||
        app.category === selectedCategory


      return matchesSearch && matchesCategory


    })


    appGrid.innerHTML = filteredApps.map(app => {


      const iconURL = safeURL(app.icon_url)


      const iconHTML = iconURL

        ? `<img
             src="${escapeHTML(iconURL)}"
             alt="${escapeHTML(app.name)}"
             class="app-icon-image"
             onerror="this.style.display='none'">`

        : escapeHTML(app.icon)


      return `


        <article class="app-card">


          <div class="card-top">


            <div class="app-icon">
              ${iconHTML}
            </div>


            <span class="app-status">
              AVAILABLE
            </span>


          </div>


          <span class="category-label">
            ${escapeHTML(app.category)}
          </span>


          <h3>
            ${escapeHTML(app.name)}
          </h3>


          <p>
            ${escapeHTML(app.description || '')}
          </p>


          <div class="card-bottom">


            <span>

              ${app.latestVersion
                ? 'v' + escapeHTML(app.version)
                : 'No release yet'}

            </span>


            <button
              class="details-btn"
              data-id="${escapeHTML(app.id)}">

              Details ↗

            </button>


          </div>


        </article>


      `


    }).join('')


    emptyState.hidden = filteredApps.length > 0


  }


  // ==========================================
  // SEARCH
  // ==========================================

  searchInput.addEventListener('input', renderApps)


  // ==========================================
  // CATEGORY FILTER
  // ==========================================

  categoryList.addEventListener('click', event => {


    const button = event.target.closest('.category-btn')


    if (!button) return


    selectedCategory = button.dataset.category


    categoryList.querySelectorAll('.category-btn')
      .forEach(btn => btn.classList.remove('active'))


    button.classList.add('active')


    renderApps()


  })


  // ==========================================
  // APP DETAILS MODAL
  // ==========================================

  appGrid.addEventListener('click', event => {


    const button = event.target.closest('.details-btn')


    if (!button) return


    const app = apps.find(item =>
      String(item.id) === button.dataset.id
    )


    if (!app) return


    const version = app.latestVersion


    const downloadURL = version
      ? safeURL(version.apk_object_key)
      : ''


    const iconURL = safeURL(app.icon_url)


    const iconHTML = iconURL

      ? `<img
           src="${escapeHTML(iconURL)}"
           class="modal-app-image"
           alt="${escapeHTML(app.name)}">`

      : `<div class="modal-icon">
           ${escapeHTML(app.icon)}
         </div>`


    modalContent.innerHTML = `


      ${iconHTML}


      <span class="eyebrow">
        ${escapeHTML(app.category)}
      </span>


      <h2>
        ${escapeHTML(app.name)}
      </h2>


      <p>
        ${escapeHTML(app.description || '')}
      </p>


      <div class="modal-version">


        <p>

          <strong>Version:</strong>

          ${version
            ? 'v' + escapeHTML(version.version_name)
            : 'Not released'}

        </p>


        ${version ? `

          <p>

            <strong>Minimum Android:</strong>

            ${escapeHTML(
              version.min_android_version || 'Not specified'
            )}

          </p>

        ` : ''}


      </div>


      ${version && version.changelog ? `

        <div class="modal-changelog">

          <h3>What's New</h3>

          <p>
            ${escapeHTML(version.changelog)}
          </p>

        </div>

      ` : ''}


      ${downloadURL ? `


        <button
          type="button"
          class="primary-button download-button"
          data-download-app-id="${escapeHTML(app.id)}"
          data-download-version-id="${escapeHTML(version.id)}"
          data-download-url="${escapeHTML(downloadURL)}">

          Download APK ↓

        </button>


      ` : `


        <p class="modal-note">

          No published APK version is available yet.
          Please check back for future releases.

        </p>


      `}


    `


    modal.hidden = false


  })


  // ==========================================
  // APK DOWNLOAD + DOWNLOAD TRACKING
  // ==========================================

  modalContent.addEventListener('click', async event => {


    const button = event.target.closest('.download-button')


    if (!button) return


    const appId = button.dataset.downloadAppId

    const versionId = button.dataset.downloadVersionId

    const downloadURL = safeURL(button.dataset.downloadUrl)


    if (!appId || !versionId || !downloadURL) {

      alert(
        'Download information is unavailable. Please try again.'
      )

      return

    }


    if (button.disabled) return


    const originalText = button.textContent


    button.disabled = true

    button.textContent = 'Preparing download...'


    try {


      const { error } = await supabase.rpc(
        'record_app_download',
        {
          p_app_id: appId,
          p_app_version_id: versionId
        }
      )


      if (error) {

        // Keep the APK accessible even if tracking temporarily fails.

        console.error(
          'Download tracking error:',
          error
        )


        alert(
          'Download tracking could not be saved, but your download will continue.'
        )

      }


      window.location.href = downloadURL


    } catch (error) {


      console.error(
        'Download process error:',
        error
      )


      alert(
        'Something went wrong while preparing the download. Please try again.'
      )


      button.disabled = false

      button.textContent = originalText


    }


  })


  // ==========================================
  // MODAL CLOSE
  // ==========================================

  document.querySelector('#closeModal')
    .addEventListener('click', () => {


      modal.hidden = true


    })


  modal.addEventListener('click', event => {


    if (event.target === modal) {

      modal.hidden = true

    }


  })


  document.addEventListener('keydown', event => {


    if (event.key === 'Escape') {

      modal.hidden = true

    }


  })


  // ==========================================
  // START APPLICATION
  // ==========================================

  loadApps().catch(error => {


    console.error(
      'Store initialization error:',
      error
    )


    appGrid.innerHTML = ''


    emptyState.textContent =
      'Something went wrong. Please refresh the page.'


    emptyState.hidden = false


  })


}
