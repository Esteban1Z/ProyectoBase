import { useState, useEffect } from 'react'
import type { FormEvent } from 'react'

interface LoginProps {
  onLoginSuccess: (user: { id: number; nombre: string; email: string; rol: string; isDemo: boolean }) => void
}

function Login({ onLoginSuccess }: LoginProps) {
  const [email, setEmail] = useState('admin@mail.com')
  const [password, setPassword] = useState('123456')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [isBackendAlive, setIsBackendAlive] = useState<boolean | null>(null)

  // Verificar si el backend está activo al montar el componente
  useEffect(() => {
    const checkBackend = async () => {
      try {
        const controller = new AbortController()
        const id = setTimeout(() => controller.abort(), 2000)
        
        const res = await fetch('http://localhost:8080/api/usuarios', {
          signal: controller.signal
        })
        clearTimeout(id)
        if (res.ok || res.status === 401 || res.status === 403 || res.status === 404) {
          setIsBackendAlive(true)
        } else {
          setIsBackendAlive(false)
        }
      } catch {
        setIsBackendAlive(false)
      }
    }
    checkBackend()
  }, [])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMsg('')
    setLoading(true)

    // Si el backend no está activo o se cae, forzar opción de demo o intentar API
    if (isBackendAlive) {
      try {
        const res = await fetch('http://localhost:8080/api/usuarios/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        })
        
        const data = await res.json()
        if (data.id) {
          onLoginSuccess({
            id: data.id,
            nombre: data.nombre,
            email: data.email,
            rol: data.rol || 'Administrador',
            isDemo: false
          })
        } else {
          setErrorMsg(data.error || 'Credenciales incorrectas')
        }
      } catch (err) {
        console.error('Error al conectar con backend:', err)
        setErrorMsg('Error de conexión con el servidor. Intente usar el Modo Demostración.')
      } finally {
        setLoading(false)
      }
    } else {
      // Login Simulador para Modo Demo
      setTimeout(() => {
        setLoading(false)
        if (email === 'admin@mail.com' && password === '123456') {
          onLoginSuccess({
            id: 999,
            nombre: 'Administrador Demo',
            email: 'admin@mail.com',
            rol: 'Administrador',
            isDemo: true
          })
        } else if (email.includes('@') && password.length >= 4) {
          onLoginSuccess({
            id: 998,
            nombre: email.split('@')[0],
            email: email,
            rol: 'Vendedor',
            isDemo: true
          })
        } else {
          setErrorMsg('Para ingresar en Modo Demo use cualquier correo y clave mayor a 4 caracteres.')
        }
      }, 800)
    }
  }

  const handleDemoBypass = () => {
    onLoginSuccess({
      id: 999,
      nombre: 'Administrador Demo',
      email: 'admin@mail.com',
      rol: 'Administrador',
      isDemo: true
    })
  }

  return (
    <div className="login-container">
      <div className="login-card">
        {/* Lado Izquierdo: Diseño de Arte */}
        <div className="login-art">
          <div className="login-logo-container">
            <svg
              className="login-logo-img"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ width: 32, height: 32, color: '#fff' }}
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            <span className="login-logo-text">Papelsoft</span>
          </div>

          <div className="login-art-copy">
            <h2>Gestiona tu inventario con simplicidad y elegancia.</h2>
            <p>
              Optimiza tus existencias, controla tus compras y efectúa tus ventas en un panel unificado diseñado para brindarte velocidad y claridad.
            </p>
          </div>

          <div className="connection-status" style={{ width: 'fit-content', background: 'rgba(255,255,255,0.1)', color: '#fff', borderColor: 'rgba(255,255,255,0.2)' }}>
            <span className={`status-dot ${isBackendAlive ? 'online' : 'offline'}`} />
            {isBackendAlive === null && <span>Verificando conexión...</span>}
            {isBackendAlive === true && <span>Base de Datos: Conectado</span>}
            {isBackendAlive === false && <span>Base de Datos: Desconectado (Usando Demo)</span>}
          </div>
        </div>

        {/* Lado Derecho: Formulario */}
        <div className="login-form-side">
          <h3>Iniciar Sesión</h3>
          <p>Digita tus credenciales para acceder al sistema.</p>

          {errorMsg && (
            <div className="badge badge-danger" style={{ display: 'flex', padding: '12px 16px', borderRadius: '12px', fontSize: '0.85rem', marginBottom: '20px', textTransform: 'none', fontWeight: 600 }}>
              <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Correo Electrónico</label>
              <div style={{ position: 'relative' }}>
                <svg
                  viewBox="0 0 24 24"
                  width="18"
                  height="18"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }}
                >
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                <input
                  id="email"
                  type="email"
                  className="form-control"
                  style={{ paddingLeft: '46px' }}
                  placeholder="usuario@dominio.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label htmlFor="password">Contraseña</label>
              <div style={{ position: 'relative' }}>
                <svg
                  viewBox="0 0 24 24"
                  width="18"
                  height="18"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }}
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <input
                  id="password"
                  type="password"
                  className="form-control"
                  style={{ paddingLeft: '46px' }}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px', borderRadius: '14px' }} disabled={loading}>
              {loading ? 'Accediendo...' : 'Entrar al Sistema'}
            </button>
          </form>

          <div className="login-actions-footer">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '12px 0', color: 'var(--text-light)', fontSize: '0.8rem' }}>
              <span>Ó también puedes probar</span>
            </div>
            
            <button type="button" className="btn btn-demo-mode" onClick={handleDemoBypass} style={{ width: '100%', padding: '12px' }}>
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              Iniciar en Modo Demostración
            </button>
            <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '8px' }}>
              * No requiere prender MySQL ni Spring Boot. Guarda los datos localmente.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
