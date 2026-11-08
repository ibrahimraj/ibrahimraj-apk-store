
import './style.css'

const app = document.querySelector('#app')

if (!app) {
  throw new Error('App container #app not found!')
}

app.innerHTML = `
  <header class="navbar">
    <a class="brand" href="#home">
      <span class="brand-icon">IR</span>
      <span>Ibrahim<span class="green">Raj</span></span>
    </a>

    <nav aria-label="Main navigation">
      <a href="#home">Home</a>
      <a href="#apps">Apps</a>
      <a href="#about">About</a>
    </nav>

    <a href="#apps" class="nav-button">Explore Apps</a>
  </header>

  <main>
    <section class="hero" id="home">
      <span class="eyebrow">✦ INDEPENDENT APP MARKETPLACE</span>

      <h1>
        Discover Apps.<br>
        <span class="green">Experience More.</span>
      </h1>

      <p>
        Welcome to IbrahimRaj APK Store.
        Discover useful Android applications
        developed with passion and creativity.
      </p>

      <div class="hero-actions">
        <a href="#apps" class="primary-button">
          Explore Apps ↗
        </a>

        <a href="#about" class="secondary-button">
          Learn More
        </a>
      </div>

      <div class="hero-info">
        <span>✓ Independent Developer</span>
        <span>✓ Android Applications</span>
      </div>
    </section>

    <section class="apps-section" id="apps">
      <div class="section-heading">
        <div>
          <span class="eyebrow">OUR COLLECTION</span>
          <h2>Featured Apps</h2>
        </div>

        <span class="coming">MORE COMING SOON</span>
      </div>

      <div class="app-grid">
        <article class="app-card">
          <div class="app-icon">DP</div>
          <span class="category">DEVELOPER TOOLS</span>
          <h3>DevPocket</h3>
          <p>Your portable developer toolkit.</p>
          <span class="version">Coming Soon</span>
        </article>

        <article class="app-card">
          <div class="app-icon">MC</div>
          <span class="category">PRODUCTIVITY</span>
          <h3>MoveCraft</h3>
          <p>Smart moving and packing management.</p>
          <span class="version">Coming Soon</span>
        </article>

        <article class="app-card">
          <div class="app-icon">IR</div>
          <span class="category">MORE APPS</span>
          <h3>More Projects</h3>
          <p>Discover our upcoming applications.</p>
          <span class="version">Coming Soon</span>
        </article>
      </div>
    </section>

    <section class="about" id="about">
      <span class="eyebrow">ABOUT US</span>
      <h2>Built by IbrahimRaj.</h2>
      <p>
        A home for innovative Android applications,
        useful tools and independent software projects.
      </p>
    </section>
  </main>

  <footer>
    <span>© ${new Date().getFullYear()} IbrahimRaj APK Store</span>
    <span>Made with passion ♥</span>
  </footer>
`
