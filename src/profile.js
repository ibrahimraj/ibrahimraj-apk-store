
import { supabase } from './supabase.js'
import './style.css'

const root = document.querySelector('#app')

let currentUser = null
let currentTab = new URLSearchParams(window.location.search).get('tab') || 'profile'

const escapeHTML = value =>
  String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  })[char])

const getName = user =>
  user.user_metadata?.full_name ||
  user.user_metadata?.name ||
  user.email?.split('@')[0] ||
  'APPNEXA User'

const getAvatar = user =>
  user.user_metadata?.avatar_url ||
  user.user_metadata?.picture ||
  ''

const formatDate = value => {
  if (!value) return 'Unavailable'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return 'Unavailable'

  return date.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

function renderProfile() {
  const name = getName(currentUser)
  const email = currentUser.email || ''
  const avatar = getAvatar(currentUser)

  const createdDate = formatDate(currentUser.created_at)

  root.innerHTML = `
    <header class="nx-header">

      <a href="/" class="nx-brand">
        <span class="nx-brand-icon">A</span>

        <span class="nx-brand-name">
          APP<span>NEXA</span>
          <small>BY IBRAHIMRAJ</small>
        </span>
      </a>

      <a href="/" class="nx-header-button">
        ← Back to Store
      </a>

    </header>

    <main class="nx-profile-page">

      <div class="nx-profile-heading">
        <span class="nx-eyebrow">APPNEXA ACCOUNT</span>
        <h1>My Profile</h1>
        <p>Manage your account and personal information.</p>
      </div>

      <section class="nx-profile-card">

        <div class="nx-profile-avatar">
          ${
            avatar
              ? `<img src="${escapeHTML(avatar)}" alt="Profile picture">`
              : `<span>${escapeHTML(name.charAt(0).toUpperCase())}</span>`
          }
        </div>

        <div class="nx-profile-user-info">
          <h2>${escapeHTML(name)}</h2>
          <p>${escapeHTML(email)}</p>
          <span class="nx-profile-member">APPNEXA MEMBER</span>
        </div>

      </section>

      <nav class="nx-profile-tabs">

        <button data-tab="profile"
          class="${currentTab === 'profile' ? 'active' : ''}">
          Profile
        </button>

        <button data-tab="downloads"
          class="${currentTab === 'downloads' ? 'active' : ''}">
          My Downloads
        </button>

        <button data-tab="reviews"
          class="${currentTab === 'reviews' ? 'active' : ''}">
          My Reviews
        </button>

      </nav>

      <section class="nx-profile-content" id="nxProfileContent"></section>

    </main>

    <footer class="nx-footer">
      <div>
        <strong>APPNEXA</strong>
        <small>By IbrahimRaj</small>
      </div>

      <p>© 2026 APPNEXA. All rights reserved.</p>
    </footer>
  `

  renderTab()

  root.querySelectorAll('[data-tab]').forEach(button => {
    button.addEventListener('click', () => {
      currentTab = button.dataset.tab

      root.querySelectorAll('[data-tab]').forEach(item => {
        item.classList.toggle('active', item === button)
      })

      const url = new URL(window.location.href)
      url.searchParams.set('tab', currentTab)
      history.replaceState({}, '', url)

      renderTab()
    })
  })
}

function renderTab() {
  const content = document.querySelector('#nxProfileContent')

  if (!content) return

  if (currentTab === 'downloads') {
    content.innerHTML = `
      <div class="nx-profile-section">
        <h2>My Downloads</h2>
        <p>Your downloaded applications will appear here.</p>
        <div class="nx-profile-empty">
          <span>↓</span>
          <h3>Download History</h3>
          <p>Download history will be connected in the next step.</p>
          <a href="/" class="nx-primary-button">Explore Apps</a>
        </div>
      </div>
    `
    return
  }

  if (currentTab === 'reviews') {
    content.innerHTML = `
      <div class="nx-profile-section">
        <h2>My Reviews</h2>
        <p>Manage your APPNEXA reviews and comments.</p>
        <div class="nx-profile-empty">
          <span>☆</span>
          <h3>No Reviews Yet</h3>
          <p>Your submitted reviews will appear here.</p>
        </div>
      </div>
    `
    return
  }

  const name = getName(currentUser)

  content.innerHTML = `
    <div class="nx-profile-section">

      <h2>Personal Information</h2>

      <div class="nx-profile-info-grid">

        <div>
          <span>Full Name</span>
          <strong>${escapeHTML(name)}</strong>
        </div>

        <div>
          <span>Email Address</span>
          <strong>${escapeHTML(currentUser.email)}</strong>
        </div>

        <div>
          <span>Account Created</span>
          <strong>${escapeHTML(formatDate(currentUser.created_at))}</strong>
        </div>

        <div>
          <span>Account Provider</span>
          <strong>
            ${
              currentUser.app_metadata?.provider === 'google'
                ? 'Google'
                : 'Email'
            }
          </strong>
        </div>

      </div>

      <div class="nx-profile-actions">

        <button class="nx-primary-button" id="nxEditProfile">
          Edit Profile
        </button>

        <button class="nx-profile-logout" id="nxProfileLogout">
          Logout
        </button>

      </div>

      <div id="nxEditArea"></div>

    </div>
  `

  document.querySelector('#nxEditProfile')
    ?.addEventListener('click', showEditForm)

  document.querySelector('#nxProfileLogout')
    ?.addEventListener('click', logout)
}

function showEditForm() {
  const area = document.querySelector('#nxEditArea')

  if (!area) return

  area.innerHTML = `
    <form class="nx-edit-form" id="nxEditForm">

      <h3>Edit Your Name</h3>

      <label for="nxNewName">Full Name</label>

      <input
        id="nxNewName"
        type="text"
        maxlength="60"
        required
        value="${escapeHTML(getName(currentUser))}"
      >

      <button type="submit" class="nx-primary-button">
        Save Changes
      </button>

      <p id="nxEditMessage"></p>

    </form>
  `

  document.querySelector('#nxEditForm')
    ?.addEventListener('submit', async event => {
      event.preventDefault()

      const input = document.querySelector('#nxNewName')
      const message = document.querySelector('#nxEditMessage')
      const button = event.currentTarget.querySelector('button')

      const newName = input.value.trim()

      if (!newName) {
        message.textContent = 'Please enter your name.'
        return
      }

      button.disabled = true
      button.textContent = 'Saving...'

      const { data, error } = await supabase.auth.updateUser({
        data: {
          ...currentUser.user_metadata,
          full_name: newName
        }
      })

      if (error) {
        message.textContent = error.message
        button.disabled = false
        button.textContent = 'Save Changes'
        return
      }

      currentUser = data.user

      renderProfile()
    })
}

async function logout() {
  const button = document.querySelector('#nxProfileLogout')

  if (button) {
    button.disabled = true
    button.textContent = 'Signing out...'
  }

  const { error } = await supabase.auth.signOut()

  if (error) {
    alert(error.message)

    if (button) {
      button.disabled = false
      button.textContent = 'Logout'
    }

    return
  }

  window.location.href = '/'
}

async function initializeProfile() {
  root.innerHTML = `
    <div class="nx-loading">
      <div class="nx-loading-icon">A</div>
      <p>Loading your profile...</p>
    </div>
  `

  const { data, error } = await supabase.auth.getUser()

  if (error || !data.user) {
    window.location.href = '/login'
    return
  }

  currentUser = data.user

  if (!['profile', 'downloads', 'reviews'].includes(currentTab)) {
    currentTab = 'profile'
  }

  renderProfile()
}

initializeProfile().catch(error => {
  console.error('Profile initialization error:', error)

  root.innerHTML = `
    <main class="nx-error">
      <h2>Unable to load profile</h2>
      <p>Please refresh the page and try again.</p>
    </main>
  `
})
