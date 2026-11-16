
import { supabase } from '../supabase.js'
import './apps.css'
import './reviews.css'

const app = document.querySelector('#app')

let allReviews = []
let currentPage = 1
const PAGE_SIZE = 15
let currentFilter = 'all'
let searchTerm = ''

const escapeHTML = (value = '') => String(value).replace(/[&<>"']/g, char => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#039;'
})[char])

async function initReviews() {
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    window.location.href = '/admin/login'
    return
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    window.location.href = '/admin/login'
    return
  }

  renderLayout()
  await loadReviews()
}

function renderLayout() {
  app.innerHTML = `
    <div class="admin-layout">

      <aside class="admin-sidebar">
        <div class="admin-brand">
          <h2>IR <span>IbrahimRaj</span></h2>
        </div>

        <p class="sidebar-heading">MAIN MENU</p>

        <nav class="admin-nav">
          <a href="/admin/dashboard">▦ Dashboard</a>
          <a href="/admin/apps">▣ Applications</a>
          <a href="/admin/categories">▤ Categories</a>
          <a href="/admin/downloads">⇩ Downloads</a>
          <a class="active" href="/admin/reviews">☆ Reviews</a>
          <a href="/admin/users">♙ Users</a>
          <a href="/admin/settings">⚙ Settings</a>
        </nav>

        <div class="sidebar-bottom">
          <a href="/">↗ View Website</a>
          <button id="signOutBtn">⇥ Sign Out</button>
        </div>
      </aside>

      <main class="admin-main">

        <header class="reviews-header">
          <div>
            <p class="reviews-eyebrow">MODERATION / REVIEWS</p>
            <h1>Reviews Management</h1>
            <p>Monitor and manage application reviews.</p>
          </div>

          <button id="refreshBtn">↻ Refresh</button>
        </header>

        <section class="reviews-stats">
          <div class="reviews-stat">
            <span>Total Reviews</span>
            <strong id="totalReviews">0</strong>
          </div>

          <div class="reviews-stat">
            <span>Pending Reviews</span>
            <strong id="pendingReviews">0</strong>
          </div>

          <div class="reviews-stat">
            <span>Published Reviews</span>
            <strong id="publishedReviews">0</strong>
          </div>

          <div class="reviews-stat">
            <span>Average Rating</span>
            <strong id="averageRating">0.0</strong>
          </div>
        </section>

        <section class="reviews-panel">

          <div class="reviews-toolbar">
            <input
              id="reviewSearch"
              type="search"
              placeholder="Search reviews..."
            />

            <select id="reviewFilter">
              <option value="all">All Reviews</option>
              <option value="pending">Pending</option>
              <option value="published">Published</option>
              <option value="hidden">Hidden</option>
            </select>
          </div>

          <div id="reviewsMessage"></div>

          <div class="reviews-table-wrap">
            <table class="reviews-table">
              <thead>
                <tr>
                  <th>APPLICATION</th>
                  <th>USER</th>
                  <th>RATING</th>
                  <th>REVIEW</th>
                  <th>DATE</th>
                  <th>STATUS</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>

              <tbody id="reviewsTableBody">
                <tr>
                  <td colspan="7">Loading reviews...</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="reviews-pagination">
            <span id="pageInfo">Page 1</span>
            <div>
              <button id="prevPage">← Previous</button>
              <button id="nextPage">Next →</button>
            </div>
          </div>

        </section>

      </main>
    </div>
  `

  document.getElementById('refreshBtn').onclick = loadReviews

  document.getElementById('reviewSearch').addEventListener('input', e => {
    searchTerm = e.target.value.toLowerCase()
    currentPage = 1
    renderReviews()
  })

  document.getElementById('reviewFilter').onchange = e => {
    currentFilter = e.target.value
    currentPage = 1
    renderReviews()
  }

  document.getElementById('prevPage').onclick = () => {
    if (currentPage > 1) {
      currentPage--
      renderReviews()
    }
  }

  document.getElementById('nextPage').onclick = () => {
    currentPage++
    renderReviews()
  }

  document.getElementById('signOutBtn').onclick = async () => {
    await supabase.auth.signOut()
    window.location.href = '/admin/login'
  }
}

async function loadReviews() {
  const message = document.getElementById('reviewsMessage')
  message.textContent = 'Loading reviews...'

  const { data, error } = await supabase
    .from('reviews')
    .select(`
      id,
      app_id,
      user_id,
      rating,
      title,
      comment,
      status,
      created_at,
      apps(name),
      profiles(full_name, email)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    message.textContent = 'Error loading reviews: ' + error.message
    allReviews = []
    updateStats()
    renderReviews()
    return
  }

  allReviews = data || []

  updateStats()
  renderReviews()

  message.textContent = allReviews.length
    ? ''
    : 'No reviews found.'
}

function updateStats() {
  const total = allReviews.length
  const pending = allReviews.filter(r => r.status === 'pending').length
  const published = allReviews.filter(r => r.status === 'published').length

  const ratings = allReviews
    .map(r => Number(r.rating))
    .filter(r => r >= 1 && r <= 5)

  const average = ratings.length
    ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)
    : '0.0'

  document.getElementById('totalReviews').textContent = total
  document.getElementById('pendingReviews').textContent = pending
  document.getElementById('publishedReviews').textContent = published
  document.getElementById('averageRating').textContent = average
}

function renderReviews() {
  const tbody = document.getElementById('reviewsTableBody')

  let filtered = allReviews.filter(review => {
    const statusMatch =
      currentFilter === 'all' ||
      review.status === currentFilter

    const searchText = [
      review.apps?.name,
      review.profiles?.full_name,
      review.profiles?.email,
      review.title,
      review.comment
    ].join(' ').toLowerCase()

    return statusMatch && searchText.includes(searchTerm)
  })

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))

  if (currentPage > totalPages) currentPage = totalPages

  const start = (currentPage - 1) * PAGE_SIZE
  const pageItems = filtered.slice(start, start + PAGE_SIZE)

  if (!pageItems.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7">No reviews found.</td>
      </tr>
    `
  } else {
    tbody.innerHTML = pageItems.map(review => {
      const date = review.created_at
        ? new Date(review.created_at).toLocaleDateString()
        : '—'

      const rating = Math.max(0, Math.min(5, Number(review.rating) || 0))

      return `
        <tr>
          <td>${escapeHTML(review.apps?.name || 'Unknown App')}</td>

          <td>
            ${escapeHTML(review.profiles?.full_name || 'User')}
            <small>${escapeHTML(review.profiles?.email || '')}</small>
          </td>

          <td class="review-rating">${'★'.repeat(rating)}${'☆'.repeat(5 - rating)}</td>

          <td>
            <strong>${escapeHTML(review.title || '')}</strong>
            <p>${escapeHTML(review.comment || '')}</p>
          </td>

          <td>${escapeHTML(date)}</td>

          <td>
            <span class="review-status status-${escapeHTML(review.status || 'pending')}">
              ${escapeHTML(review.status || 'pending')}
            </span>
          </td>

          <td>
            <div class="review-actions">
              ${review.status !== 'published'
                ? `<button data-action="published" data-id="${escapeHTML(review.id)}">Approve</button>`
                : `<button data-action="hidden" data-id="${escapeHTML(review.id)}">Hide</button>`
              }

              <button class="delete-review"
                data-action="delete"
                data-id="${escapeHTML(review.id)}">
                Delete
              </button>
            </div>
          </td>
        </tr>
      `
    }).join('')
  }

  document.getElementById('pageInfo').textContent =
    `Page ${currentPage} of ${totalPages}`

  document.getElementById('prevPage').disabled = currentPage <= 1
  document.getElementById('nextPage').disabled = currentPage >= totalPages

  tbody.querySelectorAll('button[data-action]').forEach(button => {
    button.onclick = () => handleReviewAction(
      button.dataset.id,
      button.dataset.action
    )
  })
}

async function handleReviewAction(id, action) {
  if (action === 'delete') {
    if (!confirm('Are you sure you want to delete this review?')) return

    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', id)

    if (error) {
      alert(error.message)
      return
    }
  } else {
    const { error } = await supabase
      .from('reviews')
      .update({ status: action })
      .eq('id', id)

    if (error) {
      alert(error.message)
      return
    }
  }

  await loadReviews()
}

initReviews()
