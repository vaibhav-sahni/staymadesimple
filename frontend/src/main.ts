import './style.css'

// Default to '/api' so Vite dev server can proxy requests to the backend.
const API_BASE = (import.meta.env.VITE_API_URL as string) || '/api'

const app = document.getElementById('app')!

app.innerHTML = `
  <div>
    <h1>Sign in</h1>
    <div class="card">
      <form id="login-form">
        <div style="margin-bottom:8px">
          <label for="email">Email</label><br />
          <input id="email" name="email" type="email" required style="width:300px;padding:8px" />
        </div>
        <div style="margin-bottom:12px">
          <label for="password">Password</label><br />
          <input id="password" name="password" type="password" required style="width:300px;padding:8px" />
        </div>
        <button type="submit">Sign in</button>
      </form>
      <p id="msg" style="color:#f88;margin-top:8px"></p>
      <pre id="token" style="display:none;white-space:pre-wrap;text-align:left;max-width:640px;margin:12px auto;padding:8px;background:#111;border-radius:6px"></pre>
    </div>
  </div>
`

const form = document.getElementById('login-form') as HTMLFormElement
const msg = document.getElementById('msg') as HTMLParagraphElement
const tokenPre = document.getElementById('token') as HTMLElement

form.addEventListener('submit', async (ev) => {
  ev.preventDefault()
  msg.textContent = ''
  tokenPre.style.display = 'none'

  const formData = new FormData(form)
  const email = String(formData.get('email') || '')
  const password = String(formData.get('password') || '')

  try {
    const res = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      msg.textContent = body.detail || `Login failed (${res.status})`
      return
    }
    const data = await res.json()
    const token = data.access_token
    if (token) {
      localStorage.setItem('access_token', token)
      tokenPre.textContent = `access_token: ${token}`
      tokenPre.style.display = 'block'
      msg.style.color = '#8f8'
      msg.textContent = 'Login successful — token saved to localStorage.'
    } else {
      msg.textContent = 'Login succeeded but no token returned.'
    }
  } catch (err) {
    console.error(err)
    msg.textContent = 'Network error while calling API'
  }
})
