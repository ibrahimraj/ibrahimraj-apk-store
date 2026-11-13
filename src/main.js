
import './style.css'

const apps = [
  {
    id: 1,
    name: 'DevPocket',
    category: 'Developer Tools',
    icon: 'DP',
    description: 'Your portable developer toolkit for everyday coding tasks.',
    version: 'Coming Soon',
    featured: true
  },
  {
    id: 2,
    name: 'MoveCraft',
    category: 'Productivity',
    icon: 'MC',
    description: 'Smart moving, packing and inventory management.',
    version: 'Coming Soon',
    featured: true
  },
  {
    id: 3,
    name: 'ProbashiPal',
    category: 'Utilities',
    icon: 'PP',
    description: 'Useful services and information for expatriates.',
    version: 'Coming Soon',
    featured: false
  },
  {
    id: 4,
    name: 'ZakatMate+',
    category: 'Lifestyle',
    icon: 'ZM',
    description: 'A simple toolkit for managing Zakat calculations.',
    version: 'Coming Soon',
    featured: false
  },
  {
    id: 5,
    name: 'EchoWave',
    category: 'Entertainment',
    icon: 'EW',
    description: 'Discover a new digital entertainment experience.',
    version: 'Coming Soon',
    featured: false
  }
]

const categories = [
  'All Apps',
  'Developer Tools',
  'Productivity',
  'Utilities',
  'Lifestyle',
  'Entertainment'
]

document.querySelector('#app').innerHTML = `
  <header class="navbar">
    <a href="#" class="brand">
      <span class="brand-icon">IR</span>
      <span>Ibrahim<span class="green">Raj</span></span>
    </a>

    <nav class="nav-links">
      <a href="#home">Home</a>
      <a href="#apps">Explore Apps</a>
      <a href="#categories">Categories</a>
      <a href="#about">About</a>
    </nav>

    <a href="#apps" class="nav-button">Explore Store ↗</a>
  </header>

  <main>
    <section class="hero" id="home">
      <div class="hero-content">
        <span class="eyebrow">✦ INDEPENDENT ANDROID APP MARKETPLACE</span>

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
        <span class="floating-tag">ANDROID APPS</span>
      </div>
    </section>

    <section class="stats">
      <div>
        <h2>100%</h2>
        <p>Independent Platform</p>
      </div>
      <div>
        <h2>Android</h2>
        <p>App Collection</p>
      </div>
      <div>
        <h2>IR</h2>
        <p>Developer Brand</p>
      </div>
    </section>

    <section class="apps-section" id="apps">
      <div class="section-heading">
        <div>
          <span class="eyebrow">DISCOVER OUR COLLECTION</span>
          <h2>Explore Applications</h2>
          <p>Find useful tools made for your everyday needs.</p>
        </div>
      </div>

      <div class="search-box">
        <span>⌕</span>
        <input
          id="searchInput"
          type="search"
          placeholder="Search applications..."
        >
      </div>

      <div class="category-list" id="categories">
        ${categories.map((category, index) => `
          <button
            class="category-btn ${index === 0 ? 'active' : ''}"
            data-category="${category}">
            ${category}
          </button>
        `).join('')}
      </div>

      <div class="app-grid" id="appGrid"></div>

      <p class="empty-state" id="emptyState" hidden>
        No applications found. Try another search.
      </p>
    </section>

    <section class="featured-section">
      <div class="featured-content">
        <span class="eyebrow">OUR MISSION</span>
        <h2>Technology made simple.</h2>
        <p>
          IbrahimRaj is an independent software brand
          focused on building useful Android applications
          and practical digital tools.
        </p>
        <a href="#about" class="primary-button">Discover Our Story ↗</a>
      </div>
    </section>

    <section class="about" id="about">
      <span class="eyebrow">ABOUT IBRAHIMRAJ</span>
      <h2>Built with passion.<br><span class="green">Made for everyone.</span></h2>
      <p>
        Our mission is to create simple, useful and
        reliable digital applications for Android users.
      </p>
    </section>
  </main>

  <footer>
    <div class="footer-brand">
      <span class="brand-icon">IR</span>
      <strong>Ibrahim<span class="green">Raj</span></strong>
    </div>

    <p>© 2026 IbrahimRaj APK Store. All rights reserved.</p>

    <div class="footer-links">
      <a href="#about">About</a>
      <a href="#apps">Applications</a>
      <a href="mailto:support@ibrahimraj.org">Contact</a>
    </div>
  </footer>

  <div class="modal-overlay" id="appModal" hidden>
    <div class="modal">
      <button class="modal-close" id="closeModal">×</button>
      <div id="modalContent"></div>
    </div>
  </div>
`

const appGrid = document.querySelector('#appGrid')
const searchInput = document.querySelector('#searchInput')
const emptyState = document.querySelector('#emptyState')
const modal = document.querySelector('#appModal')
const modalContent = document.querySelector('#modalContent')

let selectedCategory = 'All Apps'

function renderApps() {
  const query = searchInput.value.toLowerCase().trim()

  const filteredApps = apps.filter(app => {
    const matchesSearch =
      app.name.toLowerCase().includes(query) ||
      app.category.toLowerCase().includes(query) ||
      app.description.toLowerCase().includes(query)

    const matchesCategory =
      selectedCategory === 'All Apps' ||
      app.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  appGrid.innerHTML = filteredApps.map(app => `
    <article class="app-card">
      <div class="card-top">
        <div class="app-icon">${app.icon}</div>
        <span class="app-status">COMING SOON</span>
      </div>

      <span class="category-label">${app.category}</span>
      <h3>${app.name}</h3>
      <p>${app.description}</p>

      <div class="card-bottom">
        <span>${app.version}</span>
        <button class="details-btn" data-id="${app.id}">
          Details ↗
        </button>
      </div>
    </article>
  `).join('')

  emptyState.hidden = filteredApps.length > 0
}

searchInput.addEventListener('input', renderApps)

document.querySelectorAll('.category-btn').forEach(button => {
  button.addEventListener('click', () => {
    selectedCategory = button.dataset.category

    document.querySelectorAll('.category-btn').forEach(btn => {
      btn.classList.remove('active')
    })

    button.classList.add('active')
    renderApps()
  })
})

appGrid.addEventListener('click', event => {
  const button = event.target.closest('.details-btn')

  if (!button) return

  const app = apps.find(item => item.id === Number(button.dataset.id))

  if (!app) return

  modalContent.innerHTML = `
    <div class="modal-icon">${app.icon}</div>
    <span class="eyebrow">${app.category}</span>
    <h2>${app.name}</h2>
    <p>${app.description}</p>
    <div class="modal-version">Status: ${app.version}</div>
    <p class="modal-note">
      This application is not published yet.
      Please check back for future releases.
    </p>
  `

  modal.hidden = false
})

document.querySelector('#closeModal').addEventListener('click', () => {
  modal.hidden = true
})

modal.addEventListener('click', event => {
  if (event.target === modal) {
    modal.hidden = true
  }
})

renderApps()
