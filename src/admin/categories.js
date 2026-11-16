
import { supabase } from '../supabase.js'
import './categories.css'

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
        <a href="/admin/dashboard">▦ Dashboard</a>
        <a href="/admin/apps">▣ Applications</a>
        <a href="/admin/categories" class="active">▤ Categories</a>
        <a href="#downloads">⇩ Downloads</a>
        <a href="#reviews">☆ Reviews</a>
        <a href="#users">♙ Users</a>
      </nav>

      <p class="sidebar-label">SYSTEM</p>
      <nav class="admin-nav">
        <a href="#settings">⚙ Settings</a>
        <a href="/" target="_blank">↗ View Website</a>
      </nav>

      <button id="logoutButton" class="logout-button">⇥ Sign Out</button>
    </aside>

    <main class="admin-main">
      <header class="admin-header">
        <div>
          <span class="dashboard-eyebrow">STORE MANAGEMENT</span>
          <h1>Categories</h1>
        </div>

        <div class="admin-user">
          <div class="admin-avatar">IR</div>
          <div>
            <strong>Administrator</strong>
            <small id="adminEmail">Loading...</small>
          </div>
        </div>
      </header>

      <section class="apps-welcome">
        <div>
          <span>CATEGORY CONTROL CENTER</span>
          <h2>Organize your applications.</h2>
          <p>Create and manage categories for your digital store.</p>
        </div>
        <div class="apps-welcome-logo">IR</div>
      </section>

      <section class="apps-toolbar">
        <div>
          <h2>All Categories</h2>
          <p id="categoryCount">Loading categories...</p>
        </div>
        <button id="addCategoryButton" class="primary-button">
          + Add Category
        </button>
      </section>

      <section id="categoryEditor" class="app-editor" hidden></section>

      <section class="apps-table-section">
        <div class="apps-table-wrapper">
          <table class="apps-table">
            <thead>
              <tr>
                <th>CATEGORY NAME</th>
                <th>SLUG</th>
                <th>DESCRIPTION</th>
                <th>STATUS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody id="categoriesTable">
              <tr><td colspan="5">Loading categories...</td></tr>
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
const categoryCount = document.querySelector('#categoryCount')
const categoriesTable = document.querySelector('#categoriesTable')
const categoryEditor = document.querySelector('#categoryEditor')

let categories = []

function escapeHTML(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[char])
}

function createSlug(value) {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

async function checkAdmin() {
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    window.location.href = '/admin/login'
    return null
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profileError || !profile || profile.role !== 'admin') {
    await supabase.auth.signOut()
    window.location.href = '/admin/login'
    return null
  }

  adminEmail.textContent = user.email || 'Administrator'
  return user
}

async function loadCategories() {
  categoriesTable.innerHTML =
    '<tr><td colspan="5">Loading categories...</td></tr>'

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Categories loading error:', error)
    categoriesTable.innerHTML = `
      <tr><td colspan="5">Could not load categories: ${escapeHTML(error.message)}</td></tr>
    `
    categoryCount.textContent = 'Unable to load categories'
    return
  }

  categories = data || []
  categoryCount.textContent =
    `${categories.length} categor${categories.length === 1 ? 'y' : 'ies'} registered`

  if (!categories.length) {
    categoriesTable.innerHTML = `
      <tr>
        <td colspan="5" class="empty-apps">
          No categories yet. Add your first category!
        </td>
      </tr>
    `
    return
  }

  categoriesTable.innerHTML = categories.map(item => `
    <tr>
      <td><strong>${escapeHTML(item.name)}</strong></td>
      <td>${escapeHTML(item.slug)}</td>
      <td>${escapeHTML(item.description || '—')}</td>
      <td>
        <span class="app-status ${item.is_active ? 'status-published' : 'status-archived'}">
          ${item.is_active ? 'Active' : 'Inactive'}
        </span>
      </td>
      <td>
        <div class="app-actions">
          <button class="edit-app-button" data-edit="${escapeHTML(item.id)}">
            Edit
          </button>
          <button class="delete-app-button" data-delete="${escapeHTML(item.id)}">
            Delete
          </button>
        </div>
      </td>
    </tr>
  `).join('')
}

function showEditor(item = null) {
  const editing = Boolean(item)

  categoryEditor.hidden = false
  categoryEditor.innerHTML = `
    <div class="editor-heading">
      <div>
        <span class="dashboard-eyebrow">CATEGORY DETAILS</span>
        <h2>${editing ? 'Edit Category' : 'Add New Category'}</h2>
      </div>
      <button type="button" id="closeCategoryEditor" class="close-editor">✕</button>
    </div>

    <form id="categoryForm">
      <div class="app-form-grid">
        <div class="app-field">
          <label for="categoryName">Category Name *</label>
          <input
            id="categoryName"
            type="text"
            maxlength="100"
            required
            placeholder="Example: Productivity"
            value="${escapeHTML(item?.name || '')}"
          >
        </div>

        <div class="app-field">
          <label for="categorySlug">Category Slug *</label>
          <input
            id="categorySlug"
            type="text"
            maxlength="120"
            required
            placeholder="productivity"
            value="${escapeHTML(item?.slug || '')}"
          >
        </div>

        <div class="app-field full-field">
          <label for="categoryDescription">Description</label>
          <textarea
            id="categoryDescription"
            rows="4"
            maxlength="500"
            placeholder="Describe this category..."
          >${escapeHTML(item?.description || '')}</textarea>
        </div>

        <div class="app-field">
          <label class="featured-label">
            <input
              id="categoryActive"
              type="checkbox"
              ${item?.is_active !== false ? 'checked' : ''}
            >
            Category is Active
          </label>
        </div>
      </div>

      <p id="categoryFormMessage" class="app-form-message"></p>

      <div class="app-form-actions">
        <button type="button" id="cancelCategoryEditor" class="cancel-button">
          Cancel
        </button>
        <button type="submit" id="saveCategoryButton" class="primary-button">
          ${editing ? 'Save Changes' : 'Add Category'}
        </button>
      </div>
    </form>
  `

  document.querySelector('#categoryName').addEventListener('input', () => {
    const slugInput = document.querySelector('#categorySlug')

    if (!editing || !slugInput.dataset.manuallyEdited) {
      slugInput.value = createSlug(
        document.querySelector('#categoryName').value
      )
    }
  })

  document.querySelector('#categorySlug').addEventListener('input', event => {
    event.target.dataset.manuallyEdited = 'true'
    event.target.value = createSlug(event.target.value)
  })

  document.querySelector('#closeCategoryEditor')
    .addEventListener('click', closeEditor)

  document.querySelector('#cancelCategoryEditor')
    .addEventListener('click', closeEditor)

  document.querySelector('#categoryForm')
    .addEventListener('submit', event => saveCategory(event, item))
}

function closeEditor() {
  categoryEditor.hidden = true
  categoryEditor.innerHTML = ''
}

async function saveCategory(event, oldItem) {
  event.preventDefault()

  const message = document.querySelector('#categoryFormMessage')
  const button = document.querySelector('#saveCategoryButton')

  const name = document.querySelector('#categoryName').value.trim()
  const slug = createSlug(document.querySelector('#categorySlug').value)
  const description = document.querySelector('#categoryDescription').value.trim()
  const isActive = document.querySelector('#categoryActive').checked

  if (!name || !slug) {
    message.textContent = 'Category name and slug are required.'
    return
  }

  const payload = {
    name,
    slug,
    description: description || null,
    is_active: isActive
  }

  button.disabled = true
  button.textContent = 'Saving...'
  message.textContent = ''

  try {
    let result

    if (oldItem) {
      result = await supabase
        .from('categories')
        .update(payload)
        .eq('id', oldItem.id)
    } else {
      result = await supabase
        .from('categories')
        .insert(payload)
    }

    if (result.error) throw result.error

    await loadCategories()
    closeEditor()

  } catch (error) {
    console.error('Save category error:', error)
    message.textContent = error.message || 'Could not save category.'
    button.disabled = false
    button.textContent = oldItem ? 'Save Changes' : 'Add Category'
  }
}

async function deleteCategory(id) {
  const item = categories.find(category => category.id === id)
  if (!item) return

  const confirmed = window.confirm(
    `Delete "${item.name}"? Apps using this category may prevent deletion.`
  )

  if (!confirmed) return

  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id)

  if (error) {
    window.alert(
      'Could not delete category: ' + error.message +
      '\n\nIf apps are using this category, assign them to another category first.'
    )
    return
  }

  closeEditor()
  await loadCategories()
}

categoriesTable.addEventListener('click', event => {
  const editButton = event.target.closest('[data-edit]')
  const deleteButton = event.target.closest('[data-delete]')

  if (editButton) {
    const item = categories.find(category =>
      category.id === editButton.dataset.edit
    )
    if (item) showEditor(item)
  }

  if (deleteButton) {
    deleteCategory(deleteButton.dataset.delete)
  }
})

document.querySelector('#addCategoryButton')
  .addEventListener('click', () => showEditor())

document.querySelector('#logoutButton')
  .addEventListener('click', async () => {
    await supabase.auth.signOut()
    window.location.href = '/admin/login'
  })

async function init() {
  const user = await checkAdmin()
  if (!user) return
  await loadCategories()
}

init()
