
import { supabase } from './supabase.js'

const root = document.querySelector('#app')

let currentMode = 'login'
let loading = false

function renderAuth() {
  const isLogin = currentMode === 'login'
  const isSignup = currentMode === 'signup'
  const isReset = currentMode === 'reset'

  root.innerHTML = `
    <main class="nx-auth-page">
      <div class="nx-auth-glow"></div>

      <a href="/" class="nx-auth-brand">
        <span class="nx-brand-icon">A</span>
        <span>
          <strong>APPNEXA</strong>
          <small>BY IBRAHIMRAJ</small>
        </span>
      </a>

      <section class="nx-auth-card">

        <div class="nx-auth-logo">A</div>

        <span class="nx-eyebrow">
          ${isReset ? 'ACCOUNT RECOVERY' : 'WELCOME TO APPNEXA'}
        </span>

        <h1>
          ${isReset ? 'Reset Password' :
            isSignup ? 'Create Account' : 'Welcome Back'}
        </h1>

        <p class="nx-auth-subtitle">
          ${isReset
            ? 'Choose a new password for your account.'
            : isSignup
              ? 'Create your free APPNEXA account.'
              : 'Sign in to enjoy your APPNEXA experience.'}
        </p>

        <div id="nxAuthMessage" class="nx-auth-message" hidden></div>

        ${!isReset ? `
          ${isSignup ? `
            <label>Full Name</label>
            <input id="nxAuthName" type="text"
              placeholder="Enter your full name"
              autocomplete="name">
          ` : ''}

          <label>Email Address</label>
          <input id="nxAuthEmail" type="email"
            placeholder="Enter your email"
            autocomplete="email">

          <label>Password</label>
          <input id="nxAuthPassword" type="password"
            placeholder="Enter your password"
            autocomplete="${isLogin ? 'current-password' : 'new-password'}">

          ${isSignup ? `
            <label>Confirm Password</label>
            <input id="nxAuthConfirm" type="password"
              placeholder="Confirm your password"
              autocomplete="new-password">
          ` : ''}

          ${isLogin ? `
            <button type="button" id="nxForgot"
              class="nx-auth-forgot">
              Forgot Password?
            </button>
          ` : ''}

          <button type="button" id="nxAuthSubmit"
            class="nx-auth-submit">
            ${isSignup ? 'Create Account' : 'Sign In'}
          </button>

          <div class="nx-auth-divider">
            <span></span> OR <span></span>
          </div>

          <button type="button" id="nxGoogleLogin"
            class="nx-google-button">
            <span class="nx-google-icon">G</span>
            Continue with Google
          </button>

          <p class="nx-auth-switch">
            ${isLogin
              ? `Don't have an account?
                <button id="nxSwitchSignup">Sign Up</button>`
              : `Already have an account?
                <button id="nxSwitchLogin">Sign In</button>`}
          </p>
        ` : `
          <label>New Password</label>
          <input id="nxNewPassword" type="password"
            placeholder="Enter new password"
            autocomplete="new-password">

          <label>Confirm New Password</label>
          <input id="nxConfirmPassword" type="password"
            placeholder="Confirm new password"
            autocomplete="new-password">

          <button type="button" id="nxResetSubmit"
            class="nx-auth-submit">
            Update Password
          </button>

          <button type="button" id="nxBackLogin"
            class="nx-auth-back">
            ← Back to Sign In
          </button>
        `}
      </section>

      <p class="nx-auth-footer">
        © 2026 APPNEXA · By IbrahimRaj
      </p>
    </main>
  `

  setupAuthEvents()
}

function showMessage(message, type = 'error') {
  const box = document.querySelector('#nxAuthMessage')
  if (!box) return

  box.hidden = false
  box.className = `nx-auth-message ${type}`
  box.textContent = message
}

function setLoading(button, active, text) {
  if (!button) return
  button.disabled = active
  button.textContent = active ? 'Please wait...' : text
}

async function setupAuthEvents() {
  const submit = document.querySelector('#nxAuthSubmit')

  if (submit) {
    submit.addEventListener('click', async () => {
      if (loading) return

      const email = document.querySelector('#nxAuthEmail')?.value.trim()
      const password = document.querySelector('#nxAuthPassword')?.value

      if (!email || !password) {
        showMessage('Please enter your email and password.')
        return
      }

      loading = true
      setLoading(submit, true, currentMode === 'signup'
        ? 'Create Account' : 'Sign In')

      try {
        if (currentMode === 'signup') {
          const name = document.querySelector('#nxAuthName')?.value.trim()
          const confirm = document.querySelector('#nxAuthConfirm')?.value

          if (!name) throw new Error('Please enter your full name.')
          if (password.length < 6) {
            throw new Error('Password must be at least 6 characters.')
          }
          if (password !== confirm) {
            throw new Error('Passwords do not match.')
          }

          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: { full_name: name },
              emailRedirectTo: window.location.origin
            }
          })

          if (error) throw error

          if (data.session) {
            window.location.href = '/'
            return
          }

          showMessage(
            'Account created! Please check your email to verify your account.',
            'success'
          )
        } else {
          const { error } = await supabase.auth.signInWithPassword({
            email,
            password
          })

          if (error) throw error

          window.location.href = '/'
          return
        }
      } catch (error) {
        showMessage(error.message || 'Authentication failed.')
      } finally {
        loading = false
        setLoading(submit, false, currentMode === 'signup'
          ? 'Create Account' : 'Sign In')
      }
    })
  }

  document.querySelector('#nxGoogleLogin')
    ?.addEventListener('click', async event => {
      const button = event.currentTarget
      if (loading) return

      loading = true
      setLoading(button, true, 'Continue with Google')

      try {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: window.location.origin
          }
        })

        if (error) throw error
      } catch (error) {
        showMessage(error.message || 'Google Login failed.')
        loading = false
        setLoading(button, false, 'Continue with Google')
      }
    })

  document.querySelector('#nxForgot')
    ?.addEventListener('click', async () => {
      const email = document.querySelector('#nxAuthEmail')?.value.trim()

      if (!email) {
        showMessage('Enter your email address first.')
        return
      }

      try {
        const { error } = await supabase.auth.resetPasswordForEmail(
          email,
          {
            redirectTo: `${window.location.origin}/login?mode=reset`
          }
        )

        if (error) throw error

        showMessage(
          'Password reset link sent! Please check your email.',
          'success'
        )
      } catch (error) {
        showMessage(error.message || 'Unable to send reset email.')
      }
    })

  document.querySelector('#nxResetSubmit')
    ?.addEventListener('click', async () => {
      const password = document.querySelector('#nxNewPassword')?.value
      const confirm = document.querySelector('#nxConfirmPassword')?.value

      if (!password || password.length < 6) {
        showMessage('Password must contain at least 6 characters.')
        return
      }

      if (password !== confirm) {
        showMessage('Passwords do not match.')
        return
      }

      const button = document.querySelector('#nxResetSubmit')
      setLoading(button, true, 'Update Password')

      try {
        const { error } = await supabase.auth.updateUser({ password })
        if (error) throw error

        showMessage('Password updated successfully!', 'success')

        setTimeout(() => {
          window.location.href = '/'
        }, 1200)
      } catch (error) {
        showMessage(error.message || 'Password update failed.')
      } finally {
        setLoading(button, false, 'Update Password')
      }
    })

  document.querySelector('#nxSwitchSignup')
    ?.addEventListener('click', () => {
      currentMode = 'signup'
      renderAuth()
    })

  document.querySelector('#nxSwitchLogin')
    ?.addEventListener('click', () => {
      currentMode = 'login'
      renderAuth()
    })

  document.querySelector('#nxBackLogin')
    ?.addEventListener('click', () => {
      window.location.href = '/login'
    })
}

async function startAuth() {
  const { data } = await supabase.auth.getSession()


if (data.session && new URLSearchParams(location.search).get('mode') !== 'reset') {
  currentMode = 'login'
  renderAuth()
  return
}


  const mode = new URLSearchParams(location.search).get('mode')
  currentMode = mode === 'reset' ? 'reset' : 'login'

  renderAuth()
}

startAuth().catch(error => {
  console.error('APPNEXA Auth Error:', error)
  root.innerHTML = '<main class="nx-error"><h2>Authentication Error</h2><p>Please refresh and try again.</p></main>'
})
