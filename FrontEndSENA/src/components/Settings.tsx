import { useState } from 'react'

interface Category {
  id?: number
  nombre: string
  descripcion: string
}

interface User {
  id?: number
  nombre: string
  email: string
  password?: string
  rol: string
  createdAt?: string
}

interface SettingsProps {
  categories: Category[]
  users: User[]
  connectionMode: 'backend' | 'demo'
  onAddCategory: (c: Category) => Promise<boolean>
  onEditCategory: (id: number, c: Category) => Promise<boolean>
  onRemoveCategory: (id: number) => Promise<boolean>
  onAddUser: (u: User) => Promise<boolean>
  onEditUser: (id: number, u: User) => Promise<boolean>
  onRemoveUser: (id: number) => Promise<boolean>
  onResetDemoData: () => void
  currentUserRole: string
}

function Settings({
  categories,
  users,
  connectionMode,
  onAddCategory,
  onEditCategory,
  onRemoveCategory,
  onAddUser,
  onEditUser,
  onRemoveUser,
  onResetDemoData,
  currentUserRole
}: SettingsProps) {
  const [activeTab, setActiveTab] = useState<'categories' | 'users' | 'system'>('categories')

  // Modales
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
  const [isEditCategoryModalOpen, setIsEditCategoryModalOpen] = useState(false)
  const [isUserModalOpen, setIsUserModalOpen] = useState(false)
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false)

  // Estados Formularios Categorías
  const [catId, setCatId] = useState<number | null>(null)
  const [catName, setCatName] = useState('')
  const [catDescription, setCatDescription] = useState('')

  // Estados Formularios Usuarios
  const [userId, setUserId] = useState<number | null>(null)
  const [userName, setUserName] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [userPassword, setUserPassword] = useState('')
  const [userRole, setUserRole] = useState('Vendedor')

  // Helpers Limpieza
  const clearCategoryForm = () => {
    setCatName('')
    setCatDescription('')
    setCatId(null)
  }

  const clearUserForm = () => {
    setUserName('')
    setUserEmail('')
    setUserPassword('')
    setUserRole('Vendedor')
    setUserId(null)
  }

  // Categorías Handlers
  const handleAddCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!catName.trim()) return
    const success = await onAddCategory({ nombre: catName.trim(), descripcion: catDescription.trim() })
    if (success) {
      setIsCategoryModalOpen(false)
      clearCategoryForm()
    }
  }

  const handleEditCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (catId === null || !catName.trim()) return
    const success = await onEditCategory(catId, { nombre: catName.trim(), descripcion: catDescription.trim() })
    if (success) {
      setIsEditCategoryModalOpen(false)
      clearCategoryForm()
    }
  }

  const handleDeleteCategory = async (id?: number) => {
    if (!id) return
    if (window.confirm('¿Está seguro de eliminar esta categoría? Si tiene productos asociados, podrían quedar sin categoría.')) {
      await onRemoveCategory(id)
    }
  }

  // Usuarios Handlers
  const handleAddUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userName.trim() || !userEmail.trim() || !userPassword.trim()) return
    const success = await onAddUser({
      nombre: userName.trim(),
      email: userEmail.trim(),
      password: userPassword.trim(),
      rol: userRole
    })
    if (success) {
      setIsUserModalOpen(false)
      clearUserForm()
    }
  }

  const handleEditUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (userId === null || !userName.trim() || !userEmail.trim()) return
    const success = await onEditUser(userId, {
      nombre: userName.trim(),
      email: userEmail.trim(),
      password: userPassword.trim() || undefined, // Clave opcional al editar
      rol: userRole
    })
    if (success) {
      setIsEditUserModalOpen(false)
      clearUserForm()
    }
  }

  const handleDeleteUser = async (id?: number) => {
    if (!id) return
    if (id === 999) {
      alert('No es posible eliminar el usuario administrador de demostración.')
      return
    }
    if (window.confirm('¿Está seguro de eliminar esta cuenta de usuario del sistema?')) {
      await onRemoveUser(id)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Selector de Pestañas */}
      <div style={{ display: 'flex', gap: '12px' }}>
        <button
          className={`btn ${activeTab === 'categories' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('categories')}
        >
          📁 Categorías de Productos
        </button>
        <button
          className={`btn ${activeTab === 'users' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('users')}
        >
          👥 Cuentas de Usuarios
        </button>
        <button
          className={`btn ${activeTab === 'system' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('system')}
        >
          ⚙️ Diagnóstico del Sistema
        </button>
      </div>

      {/* PESTAÑA 1: Categorías */}
      {activeTab === 'categories' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card control-bar">
            <div>
              <h3 style={{ fontFamily: 'var(--font-title)', fontWeight: 700 }}>Categorías del Inventario</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Agrupa tus cuadernos, lapiceros y papelería general.</p>
            </div>
            <button className="btn btn-primary" onClick={() => { clearCategoryForm(); setIsCategoryModalOpen(true); }}>
              ➕ Nueva Categoría
            </button>
          </div>

          <div className="card">
            <div className="table-responsive">
              {categories.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '36px 0', color: 'var(--text-muted)' }}>
                  <span>No hay categorías definidas.</span>
                </div>
              ) : (
                <table className="table-modern">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Nombre de Categoría</th>
                      <th>Descripción</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map((c) => (
                      <tr key={c.id}>
                        <td style={{ fontWeight: 700, color: 'var(--text-light)' }}>#{c.id}</td>
                        <td style={{ fontWeight: 700 }}>{c.nombre}</td>
                        <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{c.descripcion || 'Sin descripción'}</td>
                        <td>
                          <div className="action-buttons">
                            <button
                              className="btn btn-secondary btn-sm btn-icon"
                              onClick={() => {
                                setCatId(c.id || null);
                                setCatName(c.nombre);
                                setCatDescription(c.descripcion);
                                setIsEditCategoryModalOpen(true);
                              }}
                            >
                              ✏️
                            </button>
                            <button
                              className="btn btn-secondary btn-sm btn-icon"
                              style={{ color: 'var(--danger)' }}
                              onClick={() => handleDeleteCategory(c.id)}
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* PESTAÑA 2: Usuarios */}
      {activeTab === 'users' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card control-bar">
            <div>
              <h3 style={{ fontFamily: 'var(--font-title)', fontWeight: 700 }}>Cuentas de Usuarios</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Define quiénes pueden iniciar sesión y sus privilegios.</p>
            </div>
            {currentUserRole === 'Administrador' ? (
              <button className="btn btn-primary" onClick={() => { clearUserForm(); setIsUserModalOpen(true); }}>
                ➕ Crear Usuario
              </button>
            ) : (
              <span className="badge badge-warning">Vista de solo lectura (Se requiere Rol Administrador)</span>
            )}
          </div>

          <div className="card">
            <div className="table-responsive">
              <table className="table-modern">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Correo de Acceso</th>
                    <th>Clave</th>
                    <th>Rol Asignado</th>
                    {currentUserRole === 'Administrador' && <th>Acciones</th>}
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td style={{ fontWeight: 700 }}>{u.nombre}</td>
                      <td>{u.email}</td>
                      <td style={{ fontFamily: 'monospace', color: 'var(--text-light)', fontSize: '0.85rem' }}>
                        {u.password ? '••••••••' : '(Seguro)'}
                      </td>
                      <td>
                        <span className={`badge ${u.rol === 'Administrador' ? 'badge-danger' : 'badge-info'}`}>
                          {u.rol}
                        </span>
                      </td>
                      {currentUserRole === 'Administrador' && (
                        <td>
                          <div className="action-buttons">
                            <button
                              className="btn btn-secondary btn-sm btn-icon"
                              onClick={() => {
                                setUserId(u.id || null);
                                setUserName(u.nombre);
                                setUserEmail(u.email);
                                setUserPassword('');
                                setUserRole(u.rol);
                                setIsEditUserModalOpen(true);
                              }}
                            >
                              ✏️
                            </button>
                            <button
                              className="btn btn-secondary btn-sm btn-icon"
                              style={{ color: 'var(--danger)' }}
                              onClick={() => handleDeleteUser(u.id)}
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* PESTAÑA 3: Diagnóstico */}
      {activeTab === 'system' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          {/* Card Estado de Conexión */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontFamily: 'var(--font-title)', fontWeight: 700 }}>Conexión del Sistema</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', borderRadius: '12px', backgroundColor: 'var(--bg-input)' }}>
              <span className={`status-dot ${connectionMode === 'backend' ? 'online' : 'offline'}`} style={{ width: 14, height: 14 }} />
              <div>
                <p style={{ fontWeight: 700 }}>
                  {connectionMode === 'backend' ? 'MODO SERVIDOR ACTIVO' : 'MODO DEMOSTRACIÓN'}
                </p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {connectionMode === 'backend'
                    ? 'La aplicación se está comunicando con la base de datos MySQL mediante Spring Boot.'
                    : 'La base de datos MySQL no está disponible. Usando almacenamiento interno del navegador.'}
                </p>
              </div>
            </div>
          </div>

          {/* Card de Acciones de Prueba */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontFamily: 'var(--font-title)', fontWeight: 700 }}>Herramientas de Desarrollador</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              Si estás en Modo Demo y quieres restablecer las cantidades iniciales, borrar tus ventas registradas de prueba y limpiar la papelera local:
            </p>
            <button
              className="btn btn-danger"
              style={{ width: 'fit-content' }}
              onClick={() => {
                if (window.confirm('¿Restablecer el inventario demo? Esto borrará tus cambios locales guardados en el navegador.')) {
                  onResetDemoData()
                }
              }}
            >
              🔄 Restaurar Base de Datos Demo
            </button>
          </div>
        </div>
      )}

      {/* MODAL: Agregar Categoría */}
      {isCategoryModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Crear Nueva Categoría</h2>
              <button className="btn btn-icon" onClick={() => setIsCategoryModalOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleAddCategorySubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Nombre de Categoría *</label>
                  <input type="text" className="form-control" placeholder="Ej. Cuadernos Escolares" value={catName} onChange={(e) => setCatName(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Descripción</label>
                  <textarea className="form-control" rows={3} placeholder="Detalles de esta categoría..." value={catDescription} onChange={(e) => setCatDescription(e.target.value)} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsCategoryModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Crear</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Editar Categoría */}
      {isEditCategoryModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Editar Categoría</h2>
              <button className="btn btn-icon" onClick={() => setIsEditCategoryModalOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleEditCategorySubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Nombre de Categoría *</label>
                  <input type="text" className="form-control" value={catName} onChange={(e) => setCatName(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Descripción</label>
                  <textarea className="form-control" rows={3} value={catDescription} onChange={(e) => setCatDescription(e.target.value)} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsEditCategoryModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Guardar Cambios</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Agregar Usuario */}
      {isUserModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Crear Usuario de Sistema</h2>
              <button className="btn btn-icon" onClick={() => setIsUserModalOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleAddUserSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Nombre del Colaborador *</label>
                  <input type="text" className="form-control" placeholder="Ej. Carlos Mendoza" value={userName} onChange={(e) => setUserName(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Correo Electrónico *</label>
                  <input type="email" className="form-control" placeholder="carlos@mail.com" value={userEmail} onChange={(e) => setUserEmail(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Contraseña de Acceso *</label>
                  <input type="password" className="form-control" placeholder="Mínimo 6 caracteres" value={userPassword} onChange={(e) => setUserPassword(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Rol / Privilegios</label>
                  <select className="form-control" value={userRole} onChange={(e) => setUserRole(e.target.value)}>
                    <option value="Administrador">Administrador (Control Total)</option>
                    <option value="Vendedor">Vendedor (Ventas e Inventario)</option>
                    <option value="Gestor">Gestor (Inventario y Compras)</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsUserModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Crear Cuenta</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Editar Usuario */}
      {isEditUserModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Editar Cuenta de Usuario</h2>
              <button className="btn btn-icon" onClick={() => setIsEditUserModalOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleEditUserSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Nombre del Colaborador *</label>
                  <input type="text" className="form-control" value={userName} onChange={(e) => setUserName(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Correo Electrónico *</label>
                  <input type="email" className="form-control" value={userEmail} onChange={(e) => setUserEmail(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Nueva Contraseña (Dejar vacío para conservar clave anterior)</label>
                  <input type="password" className="form-control" placeholder="••••••••" value={userPassword} onChange={(e) => setUserPassword(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Rol / Privilegios</label>
                  <select className="form-control" value={userRole} onChange={(e) => setUserRole(e.target.value)}>
                    <option value="Administrador">Administrador (Control Total)</option>
                    <option value="Vendedor">Vendedor (Ventas e Inventario)</option>
                    <option value="Gestor">Gestor (Inventario y Compras)</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsEditUserModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Guardar Cambios</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}

export default Settings
