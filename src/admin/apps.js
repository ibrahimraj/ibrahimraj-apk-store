
import { supabase } from '../supabase.js'
import './apps.css'

const WORKER_URL = 'https://ibrahimraj-apk-upload.ibrahimraj34.workers.dev'
const MAX_APK_SIZE = 90 * 1024 * 1024

const app = document.querySelector('#app')

// --------------------------------------------------
// ADMIN LAYOUT
// --------------------------------------------------

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
        <a href="/admin/apps" class="active">▣ Applications</a>
        <a href="/admin/categories">▤ Categories</a>
        <a href="#downloads">⇩ Downloads</a>
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
          <span class="dashboard-eyebrow">STORE MANAGEMENT</span>
          <h1>Applications</h1>
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
          <span>APPLICATION CONTROL CENTER</span>
          <h2>Manage your apps.</h2>
          <p>Add, edit, publish or remove applications from your store.</p>
        </div>
        <div class="apps-welcome-logo">IR</div>
      </section>

      <section class="apps-toolbar">
        <div>
          <h2>All Applications</h2>
          <p id="appsCount">Loading applications...</p>
        </div>

        <button id="addAppButton" class="primary-button">
          + Add New App
        </button>
      </section>

      <section id="appEditor" class="app-editor" hidden></section>

      <!-- APPLICATION TABLE -->

      <section class="apps-table-section">
        <div class="apps-table-wrapper">
          <table class="apps-table">
            <thead>
              <tr>
                <th>APPLICATION</th>
                <th>PACKAGE NAME</th>
                <th>CATEGORY</th>
                <th>STATUS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>

            <tbody id="appsTable">
              <tr>
                <td colspan="5">Loading applications...</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- APK VERSION MANAGEMENT -->

      <section class="apps-table-section version-management-section">

        <div class="apps-toolbar">
          <div>
            <h2>Version Management</h2>
            <p id="versionsCount">Loading versions...</p>
          </div>

          <button
            type="button"
            id="refreshVersionsButton"
            class="cancel-button"
          >
            ↻ Refresh
          </button>
        </div>

        <div class="apps-table-wrapper">
          <table class="apps-table">
            <thead>
              <tr>
                <th>APPLICATION</th>
                <th>VERSION</th>
                <th>VERSION CODE</th>
                <th>STATUS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>

            <tbody id="versionsTable">
              <tr>
                <td colspan="5">Loading versions...</td>
              </tr>
            </tbody>
          </table>
        </div>

      </section>

      <!-- APK VERSION UPLOAD -->

      <section class="apk-upload-panel">

        <div class="apk-panel-heading">
          <div>
            <span class="dashboard-eyebrow">GITHUB RELEASES</span>
            <h2>Upload New APK</h2>
            <p>Upload an Android APK and publish its version information.</p>
          </div>

          <div class="apk-panel-icon">⇧</div>
        </div>

        <form id="apkUploadForm">

          <div class="apk-form-grid">

            <div class="apk-field apk-full">
              <label for="uploadApp">Select Application *</label>
              <select id="uploadApp" required>
                <option value="">Loading applications...</option>
              </select>
            </div>

            <div class="apk-field">
              <label for="versionName">Version Name *</label>
              <input
                id="versionName"
                type="text"
                maxlength="40"
                placeholder="Example: 1.0.0"
                required
              >
            </div>

            <div class="apk-field">
              <label for="versionCode">Version Code *</label>
              <input
                id="versionCode"
                type="number"
                min="1"
                step="1"
                placeholder="Example: 1"
                required
              >
            </div>

            <div class="apk-field">
              <label for="minAndroid">Minimum Android</label>
              <input
                id="minAndroid"
                type="text"
                maxlength="50"
                placeholder="Example: Android 7.0+"
              >
            </div>

            <div class="apk-field">
              <label for="versionStatus">Release Status</label>
              <select id="versionStatus">
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>

            <div class="apk-field apk-full">
              <label for="apkFile">Select APK File *</label>
              <input
                id="apkFile"
                type="file"
                accept=".apk,application/vnd.android.package-archive"
                required
              >
              <small>APK only · Maximum 90 MB</small>
            </div>

            <div class="apk-field apk-full">
              <label for="versionChangelog">What's New / Changelog</label>
              <textarea
                id="versionChangelog"
                rows="4"
                maxlength="5000"
                placeholder="Describe the new features and improvements..."
              ></textarea>
            </div>

          </div>

          <div id="apkFileInfo" class="apk-file-info" hidden></div>

          <p id="apkUploadMessage" class="apk-upload-message"></p>

          <div class="apk-upload-actions">
            <button
              type="reset"
              id="resetUploadButton"
              class="cancel-button"
            >
              Reset
            </button>

            <button
              type="submit"
              id="uploadAPKButton"
              class="primary-button"
            >
              ⇧ Upload APK
            </button>
          </div>

        </form>
      </section>

      <footer class="admin-footer">
        IbrahimRaj APK Store Administration · 2026
      </footer>

    </main>
  </div>
`

// --------------------------------------------------
// ELEMENTS
// --------------------------------------------------

const adminEmail = document.querySelector('#adminEmail')
const appsTable = document.querySelector('#appsTable')
const appsCount = document.querySelector('#appsCount')
const appEditor = document.querySelector('#appEditor')

const versionsTable = document.querySelector('#versionsTable')
const versionsCount = document.querySelector('#versionsCount')
const refreshVersionsButton = document.querySelector('#refreshVersionsButton')

const apkForm = document.querySelector('#apkUploadForm')
const uploadApp = document.querySelector('#uploadApp')
const apkFile = document.querySelector('#apkFile')
const apkFileInfo = document.querySelector('#apkFileInfo')
const apkUploadMessage = document.querySelector('#apkUploadMessage')
const uploadAPKButton = document.querySelector('#uploadAPKButton')

let categories = []
let applications = []

// --------------------------------------------------
// EXTRA CSS
// --------------------------------------------------

const uploadStyles = document.createElement('style')

uploadStyles.textContent = `
.apk-upload-panel {
  margin-top: 32px;
  padding: 28px;
  background: #101713;
  border: 1px solid #26372b;
  border-radius: 16px;
}

.apk-panel-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
  margin-bottom: 25px;
}

.apk-panel-heading h2 {
  margin: 8px 0;
  color: #f1f7f2;
}

.apk-panel-heading p {
  color: #91a397;
  font-size: 13px;
}

.apk-panel-icon {
  width: 48px;
  height: 48px;
  display: grid;
  place-items: center;
  border-radius: 13px;
  background: #b6ff5c;
  color: #080d0b;
  font-size: 25px;
  font-weight: bold;
}

.apk-form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
}

.apk-field {
  display: flex;
  flex-direction: column;
  gap: 9px;
  min-width: 0;
}

.apk-full {
  grid-column: 1 / -1;
}

.apk-field label {
  color: #dce8df;
  font-size: 13px;
  font-weight: 600;
}

.apk-field input,
.apk-field select,
.apk-field textarea {
  width: 100%;
  box-sizing: border-box;
  padding: 13px 14px;
  color: #f1f7f2;
  background: #080d0b;
  border: 1px solid #34463a;
  border-radius: 9px;
  outline: none;
  font: inherit;
  font-size: 13px;
}

.apk-field input:focus,
.apk-field select:focus,
.apk-field textarea:focus {
  border-color: #b6ff5c;
}

.apk-field input[type="file"] {
  cursor: pointer;
}

.apk-field small {
  color: #91a397;
  font-size: 11px;
}

.apk-file-info {
  margin-top: 18px;
  padding: 14px;
  border: 1px solid #34463a;
  border-radius: 9px;
  color: #b6ff5c;
  font-size: 12px;
  overflow-wrap: anywhere;
}

.apk-upload-message {
  margin: 18px 0 0;
  color: #b6ff5c;
  font-size: 13px;
  line-height: 1.6;
  overflow-wrap: anywhere;
}

.apk-upload-message.error {
  color: #ff8585;
}

.apk-upload-message a {
  color: #b6ff5c;
  text-decoration: underline;
}

.apk-upload-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
}

.apk-upload-actions button:disabled,
.app-actions button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.version-management-section {
  margin-top: 32px;
}

@media(max-width: 650px) {
  .apk-upload-panel {
    padding: 18px;
  }

  .apk-form-grid {
    grid-template-columns: 1fr;
  }

  .apk-full {
    grid-column: auto;
  }
}
`

document.head.appendChild(uploadStyles)

// --------------------------------------------------
// HELPERS
// --------------------------------------------------

function escapeHTML(value) {
  return String(value ?? '').replace(/[&<>"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[character])
}

function createSlug(value) {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function formatBytes(bytes) {
  if (!bytes) return '0 Bytes'

  const units = ['Bytes', 'KB', 'MB', 'GB']
  const index = Math.floor(Math.log(bytes) / Math.log(1024))

  return (
    (bytes / Math.pow(1024, index)).toFixed(2) +
    ' ' +
    units[index]
  )
}

function showUploadMessage(message, isError = false) {
  apkUploadMessage.className =
    'apk-upload-message' + (isError ? ' error' : '')

  apkUploadMessage.textContent = message
}

// --------------------------------------------------
// ADMIN AUTHENTICATION
// --------------------------------------------------

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

// --------------------------------------------------
// CATEGORIES
// --------------------------------------------------

async function loadCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('id, name')
    .order('name')

  if (error) {
    console.error('Category loading error:', error)
    categories = []
    return
  }

  categories = data || []
}

// --------------------------------------------------
// APPLICATIONS
// --------------------------------------------------

async function loadApps() {
  appsTable.innerHTML = `
    <tr><td colspan="5">Loading applications...</td></tr>
  `

  const { data, error } = await supabase
    .from('apps')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Apps loading error:', error)

    appsTable.innerHTML = `
      <tr>
        <td colspan="5">
          Could not load applications: ${escapeHTML(error.message)}
        </td>
      </tr>
    `

    appsCount.textContent = 'Unable to load applications'
    return
  }

  applications = data || []

  appsCount.textContent =
    `${applications.length} application(s) registered`

  renderApps()
  renderUploadAppOptions()
}

function renderApps() {
  if (applications.length === 0) {
    appsTable.innerHTML = `
      <tr>
        <td colspan="5" class="empty-apps">
          No applications found. Add your first app!
        </td>
      </tr>
    `
    return
  }

  appsTable.innerHTML = applications.map(item => {
    const category = categories.find(
      cat => cat.id === item.category_id
    )

    return `
      <tr>
        <td>
          <div class="app-name-cell">
            ${
              item.icon_url
                ? `<img
                    src="${escapeHTML(item.icon_url)}"
                    alt=""
                    class="app-icon"
                    onerror="this.style.display='none'"
                  >`
                : `<span class="app-icon-placeholder">IR</span>`
            }

            <strong>${escapeHTML(item.name)}</strong>
          </div>
        </td>

        <td>${escapeHTML(item.package_name)}</td>

        <td>
          ${escapeHTML(category ? category.name : 'Uncategorized')}
        </td>

        <td>
          <span class="app-status status-${escapeHTML(item.status)}">
            ${escapeHTML(item.status)}
          </span>
        </td>

        <td>
          <div class="app-actions">
            <button
              class="edit-app-button"
              data-edit="${escapeHTML(item.id)}"
            >
              Edit
            </button>

            <button
              class="delete-app-button"
              data-delete="${escapeHTML(item.id)}"
            >
              Delete
            </button>
          </div>
        </td>
      </tr>
    `
  }).join('')
}

function renderUploadAppOptions() {
  const previousValue = uploadApp.value

  uploadApp.innerHTML = `
    <option value="">Select Application</option>
    ${applications.map(item => `
      <option value="${escapeHTML(item.id)}">
        ${escapeHTML(item.name)} (${escapeHTML(item.slug)})
      </option>
    `).join('')}
  `

  if (
    previousValue &&
    applications.some(item => item.id === previousValue)
  ) {
    uploadApp.value = previousValue
  }
}

// --------------------------------------------------
// VERSION MANAGEMENT
// --------------------------------------------------

async function loadVersions() {
  versionsTable.innerHTML = `
    <tr><td colspan="5">Loading versions...</td></tr>
  `

  const { data, error } = await supabase
    .from('app_versions')
    .select(`
      id,
      app_id,
      version_name,
      version_code,
      status,
      released_at,
      apps (
        name
      )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Version loading error:', error)

    versionsTable.innerHTML = `
      <tr>
        <td colspan="5">
          Could not load versions: ${escapeHTML(error.message)}
        </td>
      </tr>
    `

    versionsCount.textContent = 'Unable to load versions'
    return
  }

  const versions = data || []

  versionsCount.textContent =
    `${versions.length} version(s) registered`

  if (versions.length === 0) {
    versionsTable.innerHTML = `
      <tr>
        <td colspan="5">No APK versions found.</td>
      </tr>
    `
    return
  }

  versionsTable.innerHTML = versions.map(version => {
    const isPublished = version.status === 'published'

    return `
      <tr>
        <td>
          <strong>
            ${escapeHTML(version.apps?.name || 'Unknown App')}
          </strong>
        </td>

        <td>${escapeHTML(version.version_name)}</td>

        <td>${escapeHTML(version.version_code)}</td>

        <td>
          <span class="app-status status-${escapeHTML(version.status)}">
            ${escapeHTML(version.status)}
          </span>
        </td>

        <td>
          <div class="app-actions">
            <button
              type="button"
              class="${isPublished ? 'delete-app-button' : 'edit-app-button'}"
              data-version-action="${isPublished ? 'draft' : 'published'}"
              data-version-id="${escapeHTML(version.id)}"
            >
              ${isPublished ? 'Unpublish' : 'Publish'}
            </button>
          </div>
        </td>
      </tr>
    `
  }).join('')
}

// --------------------------------------------------
// VERSION STATUS UPDATE
// --------------------------------------------------

versionsTable.addEventListener('click', async event => {
  const button = event.target.closest('[data-version-action]')

  if (!button || button.disabled) return

  const versionId = button.dataset.versionId
  const newStatus = button.dataset.versionAction

  const confirmed = window.confirm(
    `Are you sure you want to ${newStatus === 'published' ? 'publish' : 'unpublish'} this APK version?`
  )

  if (!confirmed) return

  button.disabled = true
  button.textContent = 'Updating...'

  try {
    const { data, error } = await supabase.rpc(
      'admin_update_version_status',
      {
        p_version_id: versionId,
        p_new_status: newStatus
      }
    )

    if (error) throw error

    if (data !== true) {
      throw new Error('Version status update was not confirmed.')
    }

    await loadVersions()

  } catch (error) {
    console.error('Version status update error:', error)

    window.alert(
      'Could not update version: ' + error.message
    )

    await loadVersions()
  }
})

// --------------------------------------------------
// REFRESH VERSIONS
// --------------------------------------------------

refreshVersionsButton.addEventListener('click', loadVersions)

// --------------------------------------------------
// ADD / EDIT APPLICATION
// --------------------------------------------------

function showEditor(item = null) {
  const editing = Boolean(item)

  const categoryOptions = categories.map(category => `
    <option
      value="${escapeHTML(category.id)}"
      ${item && item.category_id === category.id ? 'selected' : ''}
    >
      ${escapeHTML(category.name)}
    </option>
  `).join('')

  appEditor.hidden = false

  appEditor.innerHTML = `
    <div class="editor-heading">
      <div>
        <span class="dashboard-eyebrow">APPLICATION DETAILS</span>
        <h2>${editing ? 'Edit Application' : 'Add New Application'}</h2>
      </div>

      <button type="button" id="closeEditorButton" class="close-editor">
        ✕
      </button>
    </div>

    <form id="appForm">

      <div class="app-form-grid">

        <div class="app-field">
          <label for="appName">Application Name *</label>
          <input
            id="appName"
            type="text"
            maxlength="100"
            required
            placeholder="Example: DevPocket"
            value="${escapeHTML(item?.name || '')}"
          >
        </div>

        <div class="app-field">
          <label for="appSlug">App Slug *</label>
          <input
            id="appSlug"
            type="text"
            maxlength="120"
            required
            placeholder="example-devpocket"
            value="${escapeHTML(item?.slug || '')}"
          >
        </div>

        <div class="app-field">
          <label for="appPackage">Package Name *</label>
          <input
            id="appPackage"
            type="text"
            maxlength="200"
            required
            placeholder="com.ibrahimraj.example"
            value="${escapeHTML(item?.package_name || '')}"
          >
        </div>

        <div class="app-field">
          <label for="appCategory">Category</label>
          <select id="appCategory">
            <option value="">Select Category</option>
            ${categoryOptions}
          </select>
        </div>

        <div class="app-field">
          <label for="appDeveloper">Developer Name</label>
          <input
            id="appDeveloper"
            type="text"
            maxlength="100"
            value="${escapeHTML(item?.developer_name || 'IbrahimRaj')}"
            placeholder="IbrahimRaj"
          >
        </div>

        <div class="app-field">
          <label for="appIcon">App Icon URL</label>
          <input
            id="appIcon"
            type="url"
            placeholder="https://example.com/icon.png"
            value="${escapeHTML(item?.icon_url || '')}"
          >
        </div>

        <div class="app-field">
          <label for="appStatus">Publication Status</label>
          <select id="appStatus">
            <option value="draft" ${item?.status === 'draft' || !item ? 'selected' : ''}>
              Draft
            </option>

            <option value="published" ${item?.status === 'published' ? 'selected' : ''}>
              Published
            </option>

            <option value="archived" ${item?.status === 'archived' ? 'selected' : ''}>
              Archived
            </option>
          </select>
        </div>

        <div class="app-field app-featured-field">
          <label class="featured-label">
            <input
              id="appFeatured"
              type="checkbox"
              ${item?.is_featured ? 'checked' : ''}
            >
            Mark as Featured App
          </label>
        </div>

        <div class="app-field full-field">
          <label for="appDescription">Application Description</label>
          <textarea
            id="appDescription"
            rows="5"
            placeholder="Write a description about this application..."
          >${escapeHTML(item?.description || '')}</textarea>
        </div>

      </div>

      <p id="appFormMessage" class="app-form-message"></p>

      <div class="app-form-actions">
        <button
          type="button"
          id="cancelEditorButton"
          class="cancel-button"
        >
          Cancel
        </button>

        <button type="submit" id="saveAppButton" class="primary-button">
          ${editing ? 'Save Changes' : 'Add Application'}
        </button>
      </div>

    </form>
  `

  document.querySelector('#appName').addEventListener('input', () => {
    const slugInput = document.querySelector('#appSlug')

    if (!editing || !slugInput.dataset.manuallyEdited) {
      slugInput.value = createSlug(
        document.querySelector('#appName').value
      )
    }
  })

  document.querySelector('#appSlug').addEventListener('input', event => {
    event.target.dataset.manuallyEdited = 'true'
    event.target.value = createSlug(event.target.value)
  })

  document.querySelector('#closeEditorButton')
    .addEventListener('click', closeEditor)

  document.querySelector('#cancelEditorButton')
    .addEventListener('click', closeEditor)

  document.querySelector('#appForm')
    .addEventListener('submit', event => saveApp(event, item))
}

function closeEditor() {
  appEditor.hidden = true
  appEditor.innerHTML = ''
}

// --------------------------------------------------
// SAVE APPLICATION
// --------------------------------------------------

async function saveApp(event, oldItem) {
  event.preventDefault()

  const message = document.querySelector('#appFormMessage')
  const saveButton = document.querySelector('#saveAppButton')

  const name = document.querySelector('#appName').value.trim()
  const slug = createSlug(document.querySelector('#appSlug').value)
  const packageName = document.querySelector('#appPackage').value.trim()
  const categoryId = document.querySelector('#appCategory').value || null
  const developerName = document.querySelector('#appDeveloper').value.trim()
  const iconUrl = document.querySelector('#appIcon').value.trim()
  const description = document.querySelector('#appDescription').value.trim()
  const status = document.querySelector('#appStatus').value
  const isFeatured = document.querySelector('#appFeatured').checked

  if (!name || !slug || !packageName) {
    message.textContent = 'Please complete all required fields.'
    return
  }

  if (!/^[a-zA-Z0-9_]+(\.[a-zA-Z0-9_]+)+$/.test(packageName)) {
    message.textContent =
      'Enter a valid package name, e.g. com.ibrahimraj.app'
    return
  }

  // Check published APK version before publishing the application.

  if (status === 'published') {
    if (!oldItem) {
      message.textContent =
        'Please save the application as Draft first.'
      return
    }

    const { count, error: versionCheckError } = await supabase
      .from('app_versions')
      .select('id', { count: 'exact', head: true })
      .eq('app_id', oldItem.id)
      .eq('status', 'published')

    if (versionCheckError) {
      message.textContent =
        'Could not verify published versions: ' + versionCheckError.message
      return
    }

    if (!count || count < 1) {
      message.textContent =
        'Publish at least one APK version before publishing this application.'
      return
    }
  }

  const payload = {
    name,
    slug,
    package_name: packageName,
    description: description || null,
    icon_url: iconUrl || null,
    category_id: categoryId,
    developer_name: developerName || 'IbrahimRaj',
    is_featured: isFeatured,
    status,
    updated_at: new Date().toISOString()
  }

  saveButton.disabled = true
  saveButton.textContent = 'Saving...'
  message.textContent = ''

  try {
    let result

    if (oldItem) {
      result = await supabase
        .from('apps')
        .update(payload)
        .eq('id', oldItem.id)
    } else {
      result = await supabase
        .from('apps')
        .insert(payload)
    }

    if (result.error) throw result.error

    await loadApps()
    await loadVersions()
    closeEditor()

  } catch (error) {
    console.error('Save app error:', error)

    message.textContent =
      error.message || 'Could not save application.'

    saveButton.disabled = false
    saveButton.textContent = oldItem
      ? 'Save Changes'
      : 'Add Application'
  }
}

// --------------------------------------------------
// DELETE APPLICATION
// --------------------------------------------------

async function deleteApp(id) {
  const item = applications.find(appItem => appItem.id === id)

  if (!item) return

  const confirmed = window.confirm(
    `Are you sure you want to delete "${item.name}"?`
  )

  if (!confirmed) return

  const { error } = await supabase
    .from('apps')
    .delete()
    .eq('id', id)

  if (error) {
    window.alert('Delete failed: ' + error.message)
    return
  }

  closeEditor()
  await loadApps()
  await loadVersions()
}

// --------------------------------------------------
// APK FILE INFORMATION
// --------------------------------------------------

apkFile.addEventListener('change', () => {
  const file = apkFile.files[0]

  apkFileInfo.hidden = true
  apkFileInfo.textContent = ''

  if (!file) return

  if (!file.name.toLowerCase().endsWith('.apk')) {
    apkFile.value = ''
    showUploadMessage('Please select a valid APK file.', true)
    return
  }

  if (file.size > MAX_APK_SIZE) {
    apkFile.value = ''
    showUploadMessage('APK exceeds the 90 MB limit.', true)
    return
  }

  apkFileInfo.hidden = false
  apkFileInfo.textContent =
    `Selected: ${file.name} · ${formatBytes(file.size)}`

  showUploadMessage('')
})

// --------------------------------------------------
// SHA-256
// --------------------------------------------------

async function calculateSHA256(file) {
  const buffer = await file.arrayBuffer()

  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer)

  return Array.from(new Uint8Array(hashBuffer))
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('')
}

// --------------------------------------------------
// APK UPLOAD
// --------------------------------------------------

apkForm.addEventListener('submit', async event => {
  event.preventDefault()

  if (uploadAPKButton.disabled) return

  const appId = uploadApp.value
  const versionName = document.querySelector('#versionName').value.trim()
  const versionCode = Number(
    document.querySelector('#versionCode').value
  )
  const minAndroid = document.querySelector('#minAndroid').value.trim()
  const changelog = document.querySelector('#versionChangelog').value.trim()
  const status = document.querySelector('#versionStatus').value
  const file = apkFile.files[0]

  const selectedApp = applications.find(item => item.id === appId)

  if (!selectedApp) {
    showUploadMessage('Please select an application.', true)
    return
  }

  if (!versionName || !Number.isSafeInteger(versionCode) || versionCode < 1) {
    showUploadMessage('Enter a valid version name and version code.', true)
    return
  }

  if (!file || !file.name.toLowerCase().endsWith('.apk')) {
    showUploadMessage('Please select a valid APK file.', true)
    return
  }

  if (file.size === 0 || file.size > MAX_APK_SIZE) {
    showUploadMessage(
      'APK must be greater than 0 and no larger than 90 MB.',
      true
    )
    return
  }

  uploadAPKButton.disabled = true
  uploadAPKButton.textContent = 'Uploading...'

  try {
    showUploadMessage('Checking existing version...')

    // Prevent duplicate version names.

    const { data: existingVersion, error: checkError } = await supabase
      .from('app_versions')
      .select('id')
      .eq('app_id', appId)
      .eq('version_name', versionName)
      .maybeSingle()

    if (checkError) throw checkError

    if (existingVersion) {
      throw new Error(
        'This version name already exists for this application. Use a new version.'
      )
    }

    // Check duplicate version code.

    const { data: existingCode, error: codeCheckError } = await supabase
      .from('app_versions')
      .select('id')
      .eq('app_id', appId)
      .eq('version_code', versionCode)
      .maybeSingle()

    if (codeCheckError) throw codeCheckError

    if (existingCode) {
      throw new Error(
        'This version code already exists for this application. Use a new version code.'
      )
    }

    // Get admin session.

    const { data: sessionData, error: sessionError } =
      await supabase.auth.getSession()

    if (sessionError) throw sessionError

    const accessToken = sessionData.session?.access_token

    if (!accessToken) {
      throw new Error('Admin session expired. Please sign in again.')
    }

    // Calculate SHA-256.

    showUploadMessage('Calculating APK SHA-256...')

    const sha256 = await calculateSHA256(file)

    // Upload APK to GitHub Releases.

    showUploadMessage('Uploading APK to GitHub Releases. Please wait...')

    const uploadURL = new URL(`${WORKER_URL}/upload`)

    uploadURL.searchParams.set('slug', selectedApp.slug)
    uploadURL.searchParams.set('version', versionName)
    uploadURL.searchParams.set('filename', file.name)

    const uploadResponse = await fetch(uploadURL.toString(), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/vnd.android.package-archive'
      },
      body: file
    })

    const responseText = await uploadResponse.text()

    let uploadResult

    try {
      uploadResult = JSON.parse(responseText)
    } catch {
      throw new Error(
        `Upload server returned an invalid response. HTTP ${uploadResponse.status}`
      )
    }

    if (!uploadResponse.ok || uploadResult.success !== true) {
      throw new Error(
        uploadResult.error ||
        uploadResult.message ||
        `GitHub upload failed. HTTP ${uploadResponse.status}`
      )
    }

    const downloadURL = uploadResult.download_url

    if (
      typeof downloadURL !== 'string' ||
      !downloadURL.startsWith('https://github.com/')
    ) {
      throw new Error(
        'GitHub upload response did not contain a valid download URL. Check the Worker response.'
      )
    }

    // Save version information in Supabase.

    showUploadMessage('APK uploaded! Saving version information...')

    const versionPayload = {
      app_id: appId,
      version_name: versionName,
      version_code: versionCode,
      apk_object_key: downloadURL,
      apk_size: file.size,
      sha256,
      min_android_version: minAndroid || null,
      changelog: changelog || null,
      status,
      released_at: status === 'published'
        ? new Date().toISOString()
        : null
    }

    const { error: insertError } = await supabase
      .from('app_versions')
      .insert(versionPayload)

    if (insertError) {
      console.error('Version database save error:', insertError)

      showUploadMessage(
        `APK uploaded to GitHub, but Supabase could not save the version: ${insertError.message}. Download URL: ${downloadURL}`,
        true
      )

      return
    }

    showUploadMessage(
      `Success! ${versionName} uploaded and saved. File size: ${formatBytes(file.size)}.`
    )

    apkForm.reset()

    apkFileInfo.hidden = true
    apkFileInfo.textContent = ''

    await loadVersions()

  } catch (error) {
    console.error('APK upload error:', error)

    showUploadMessage(
      error.message || 'APK upload failed. Please try again.',
      true
    )

  } finally {
    uploadAPKButton.disabled = false
    uploadAPKButton.textContent = '⇧ Upload APK'
  }
})

// --------------------------------------------------
// APPLICATION TABLE EVENTS
// --------------------------------------------------

appsTable.addEventListener('click', event => {
  const editButton = event.target.closest('[data-edit]')
  const deleteButton = event.target.closest('[data-delete]')

  if (editButton) {
    const item = applications.find(
      appItem => appItem.id === editButton.dataset.edit
    )

    if (item) showEditor(item)
  }

  if (deleteButton) {
    deleteApp(deleteButton.dataset.delete)
  }
})

// --------------------------------------------------
// ADD APPLICATION
// --------------------------------------------------

document.querySelector('#addAppButton')
  .addEventListener('click', () => showEditor())

// --------------------------------------------------
// LOGOUT
// --------------------------------------------------

document.querySelector('#logoutButton')
  .addEventListener('click', async () => {
    await supabase.auth.signOut()
    window.location.href = '/admin/login'
  })

// --------------------------------------------------
// INITIALIZE
// --------------------------------------------------

async function init() {
  const user = await checkAdmin()

  if (!user) return

  await loadCategories()
  await loadApps()
  await loadVersions()
}

init()
