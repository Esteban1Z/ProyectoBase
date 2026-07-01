import { useState, useMemo } from 'react'

interface Client {
  id?: number
  nombre: string
  telefono: string
  email: string
}

interface Supplier {
  id?: number
  nombre: string
  telefono: string
  email: string
  direccion?: string
}

interface ContactsProps {
  clients: Client[]
  suppliers: Supplier[]
  onAddClient: (c: Client) => Promise<boolean>
  onEditClient: (id: number, c: Client) => Promise<boolean>
  onRemoveClient: (id: number) => Promise<boolean>
  onAddSupplier: (s: Supplier) => Promise<boolean>
  onEditSupplier: (id: number, s: Supplier) => Promise<boolean>
  onRemoveSupplier: (id: number) => Promise<boolean>
}

function Contacts({
  clients,
  suppliers,
  onAddClient,
  onEditClient,
  onRemoveClient,
  onAddSupplier,
  onEditSupplier,
  onRemoveSupplier
}: ContactsProps) {
  const [activeTab, setActiveTab] = useState<'clients' | 'suppliers'>('clients')
  const [search, setSearch] = useState('')

  // Modales
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  // Estados Formulario
  const [editingId, setEditingId] = useState<number | null>(null)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [address, setAddress] = useState('')

  // Limpiar
  const clearForm = () => {
    setName('')
    setPhone('')
    setEmail('')
    setAddress('')
    setEditingId(null)
  }

  // Abrir Agregar
  const openAddModal = () => {
    clearForm()
    setIsAddModalOpen(true)
  }

  // Abrir Editar
  const openEditModal = (item: any) => {
    setName(item.nombre)
    setPhone(item.telefono)
    setEmail(item.email)
    if (activeTab === 'suppliers') {
      setAddress(item.direccion || '')
    }
    setEditingId(item.id || null)
    setIsEditModalOpen(true)
  }

  // Filtrado
  const filteredClients = useMemo(() => {
    if (activeTab !== 'clients') return []
    return clients.filter((c) => {
      return (
        c.nombre.toLowerCase().includes(search.toLowerCase()) ||
        c.telefono.includes(search) ||
        c.email.toLowerCase().includes(search.toLowerCase())
      )
    })
  }, [clients, search, activeTab])

  const filteredSuppliers = useMemo(() => {
    if (activeTab !== 'suppliers') return []
    return suppliers.filter((s) => {
      return (
        s.nombre.toLowerCase().includes(search.toLowerCase()) ||
        s.telefono.includes(search) ||
        s.email.toLowerCase().includes(search.toLowerCase()) ||
        (s.direccion && s.direccion.toLowerCase().includes(search.toLowerCase()))
      )
    })
  }, [suppliers, search, activeTab])

  // Enviar Agregar
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    let success = false
    if (activeTab === 'clients') {
      success = await onAddClient({
        nombre: name.trim(),
        telefono: phone.trim(),
        email: email.trim()
      })
    } else {
      success = await onAddSupplier({
        nombre: name.trim(),
        telefono: phone.trim(),
        email: email.trim(),
        direccion: address.trim() || undefined
      })
    }

    if (success) {
      setIsAddModalOpen(false)
      clearForm()
    }
  }

  // Enviar Editar
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (editingId === null || !name.trim()) return

    let success = false
    if (activeTab === 'clients') {
      success = await onEditClient(editingId, {
        nombre: name.trim(),
        telefono: phone.trim(),
        email: email.trim()
      })
    } else {
      success = await onEditSupplier(editingId, {
        nombre: name.trim(),
        telefono: phone.trim(),
        email: email.trim(),
        direccion: address.trim() || undefined
      })
    }

    if (success) {
      setIsEditModalOpen(false)
      clearForm()
    }
  }

  // Eliminar
  const handleDelete = async (id?: number) => {
    if (!id) return
    const text = activeTab === 'clients' ? 'cliente' : 'proveedor'
    if (window.confirm(`¿Está seguro de eliminar este ${text}?`)) {
      if (activeTab === 'clients') {
        await onRemoveClient(id)
      } else {
        await onRemoveSupplier(id)
      }
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Pestañas */}
      <div style={{ display: 'flex', gap: '12px' }}>
        <button
          className={`btn ${activeTab === 'clients' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => {
            setActiveTab('clients')
            setSearch('')
          }}
        >
          👤 Clientes ({clients.length})
        </button>
        <button
          className={`btn ${activeTab === 'suppliers' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => {
            setActiveTab('suppliers')
            setSearch('')
          }}
        >
          🏭 Proveedores ({suppliers.length})
        </button>
      </div>

      {/* Control bar */}
      <div className="card control-bar">
        <div className="search-box">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            className="form-control"
            placeholder={activeTab === 'clients' ? 'Buscar cliente...' : 'Buscar proveedor...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <button className="btn btn-primary" onClick={openAddModal}>
          <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2.5" fill="none">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          {activeTab === 'clients' ? 'Nuevo Cliente' : 'Nuevo Proveedor'}
        </button>
      </div>

      {/* Listas */}
      <div className="card">
        <div className="table-responsive">
          {activeTab === 'clients' ? (
            filteredClients.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                <p style={{ fontWeight: 700, color: 'var(--text-main)' }}>No hay clientes registrados</p>
                <p style={{ fontSize: '0.85rem' }}>Agregue un cliente para asociarlo a las facturas de venta.</p>
              </div>
            ) : (
              <table className="table-modern">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nombre Completo</th>
                    <th>Teléfono</th>
                    <th>Correo Electrónico</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClients.map((c) => (
                    <tr key={c.id}>
                      <td style={{ fontWeight: 700, color: 'var(--text-muted)' }}>#{c.id}</td>
                      <td style={{ fontWeight: 700 }}>{c.nombre}</td>
                      <td>{c.telefono || 'Sin teléfono'}</td>
                      <td>{c.email || 'Sin correo'}</td>
                      <td>
                        <div className="action-buttons">
                          <button className="btn btn-secondary btn-sm btn-icon" title="Editar" onClick={() => openEditModal(c)}>
                            ✏️
                          </button>
                          <button className="btn btn-secondary btn-sm btn-icon" style={{ color: 'var(--danger)' }} title="Eliminar" onClick={() => handleDelete(c.id)}>
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          ) : (
            filteredSuppliers.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                <p style={{ fontWeight: 700, color: 'var(--text-main)' }}>No hay proveedores registrados</p>
                <p style={{ fontSize: '0.85rem' }}>Agregue un proveedor para poder registrar ingresos al stock.</p>
              </div>
            ) : (
              <table className="table-modern">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nombre Proveedor</th>
                    <th>Contacto</th>
                    <th>Correo Electrónico</th>
                    <th>Dirección</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSuppliers.map((s) => (
                    <tr key={s.id}>
                      <td style={{ fontWeight: 700, color: 'var(--text-muted)' }}>#{s.id}</td>
                      <td style={{ fontWeight: 700 }}>{s.nombre}</td>
                      <td>{s.telefono}</td>
                      <td>{s.email}</td>
                      <td style={{ fontSize: '0.85rem' }}>{s.direccion || 'Sin dirección'}</td>
                      <td>
                        <div className="action-buttons">
                          <button className="btn btn-secondary btn-sm btn-icon" title="Editar" onClick={() => openEditModal(s)}>
                            ✏️
                          </button>
                          <button className="btn btn-secondary btn-sm btn-icon" style={{ color: 'var(--danger)' }} title="Eliminar" onClick={() => handleDelete(s.id)}>
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          )}
        </div>
      </div>

      {/* MODAL: Agregar */}
      {isAddModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Agregar {activeTab === 'clients' ? 'Cliente' : 'Proveedor'}</h2>
              <button className="btn btn-icon" onClick={() => setIsAddModalOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleAddSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Nombre Completo *</label>
                  <input type="text" className="form-control" placeholder="Ej. Juan Pérez" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Número Telefónico</label>
                  <input type="text" className="form-control" placeholder="Ej. 3112345678" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Correo Electrónico</label>
                  <input type="email" className="form-control" placeholder="Ej. juan@dominio.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                {activeTab === 'suppliers' && (
                  <div className="form-group">
                    <label>Dirección Física / Bodega</label>
                    <input type="text" className="form-control" placeholder="Ej. Calle 10 # 5-20" value={address} onChange={(e) => setAddress(e.target.value)} />
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsAddModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Registrar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Editar */}
      {isEditModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Editar {activeTab === 'clients' ? 'Cliente' : 'Proveedor'}</h2>
              <button className="btn btn-icon" onClick={() => setIsEditModalOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleEditSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Nombre Completo *</label>
                  <input type="text" className="form-control" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Número Telefónico</label>
                  <input type="text" className="form-control" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Correo Electrónico</label>
                  <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                {activeTab === 'suppliers' && (
                  <div className="form-group">
                    <label>Dirección Física / Bodega</label>
                    <input type="text" className="form-control" value={address} onChange={(e) => setAddress(e.target.value)} />
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsEditModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Guardar Cambios</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}

export default Contacts
