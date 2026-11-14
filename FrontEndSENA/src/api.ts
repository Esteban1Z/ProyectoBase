const configuredApiUrl = import.meta.env.VITE_API_URL?.trim()

export const API_BASE_URL = (
  configuredApiUrl || (import.meta.env.DEV ? 'http://localhost:8080/api' : '')
).replace(/\/+$/, '')

export const API_CONFIGURED = API_BASE_URL.length > 0

export function apiUrl(path: string): string {
  if (!API_CONFIGURED) {
    throw new Error('La API no está configurada. Define VITE_API_URL en el entorno de despliegue.')
  }

  return `${API_BASE_URL}/${path.replace(/^\/+/, '')}`
}

export function setAuthToken(token: string | null): void {
  if (token) {
    localStorage.setItem('papelsoft_auth_token', token)
  } else {
    localStorage.removeItem('papelsoft_auth_token')
  }
}

export function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers)
  const token = localStorage.getItem('papelsoft_auth_token')
  if (token) headers.set('Authorization', `Bearer ${token}`)

  return fetch(apiUrl(path), { ...init, headers })
}

export const DEMO_ENABLED = import.meta.env.VITE_ENABLE_DEMO === 'true'
