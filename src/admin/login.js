
import { supabase } from '../supabase.js'
import './login.css'

const app = document.querySelector('#app')

app.innerHTML = `
  <main class="admin-login-page">
    <div class="login-card">
      <div class="login-logo">IR</div>

      <span class="login-label">IBRAHIMRAJ ADMINISTRATION</span>
      <h1>Welcome Back</h1>
      <p>Sign in to manage your APK Store.</p>

      <form id="adminLoginForm">
        <label>Email Address</label>
        <input
          type="email"
          id="adminEmail"
          placeholder="admin@example.com"
          required
        >

        <label>Password</label>
        <input
          type="password"
          id="adminPassword"
          placeholder="Enter your password"
          required
        >

        <button type="submit" id="loginButton">
          Sign In to Dashboard
        </button>

        <p id="loginMessage"></p>
      </form>

      <a class="back-home" href="/">← Back to Store</a>
    </div>
  </main>
`

const form = document.querySelector('#adminLoginForm')
const message = document.querySelector('#loginMessage')
const button = document.querySelector('#loginButton')

form.addEventListener('submit', async (event) => {
  event.preventDefault()

  button.disabled = true
  button.textContent = 'Signing In...'
  message.textContent = ''

  const email = document.querySelector('#adminEmail').value.trim()
  const password = document.querySelector('#adminPassword').value

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) throw error

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single()

    if (profileError || !profile || profile.role !== 'admin') {
      await supabase.auth.signOut()
      throw new Error('You are not authorized as an admin.')
    }

    message.textContent = 'Login successful!'

    window.location.href = '/admin/dashboard'

  } catch (error) {
    message.textContent = error.message
  }

  button.disabled = false
  button.textContent = 'Sign In to Dashboard'
})
