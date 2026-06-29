import { useState } from 'react'
import type { FormEvent } from 'react'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    window.alert(`Iniciando sesión con ${email}`)
  }

  return (
    <section className="card-panel">
      <h2>Iniciar sesión</h2>
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label htmlFor="email">Correo electrónico</label>
          <input
            id="email"
            type="email"
            placeholder="usuario@dominio.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>

        <div className="input-group">
          <label htmlFor="password">Contraseña</label>
          <input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>

        <div className="form-footer">
          <label>
            <input
              type="checkbox"
              checked={remember}
              onChange={(event) => setRemember(event.target.checked)}
            />
            &nbsp;Recordarme
          </label>
          <small>Acceso rápido y seguro.</small>
        </div>

        <button type="submit" className="primary-button primary-action">
          Entrar
        </button>
      </form>
    </section>
  )
}

export default Login
