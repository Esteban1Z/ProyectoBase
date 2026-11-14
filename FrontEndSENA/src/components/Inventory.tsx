// Componente de Inventario: Gestion de productos
import { useState, useMemo } from 'react'

// Interfaz para Producto
interface Product {
  id?: number
  nombre: string
  descripcion: string
  precio: number
  stock: number
  categoriaId?: number
  codigoBarras?: string
}

// Interfaz para Categoria
interface Category {
  id?: number
  nombre: string
  descripcion: string
}

// Props del componente
interface InventoryProps {
  products: Product[]
  categories: Category[]
  onAddProduct: (p: Product) => Promise<boolean>
  onEditProduct: (id: number, p: Product) => Promise<boolean>
  onRemoveProduct: (id: number) => Promise<boolean>
}

function Inventory({ products, categories, onAddProduct, onEditProduct, onRemoveProduct }: InventoryProps) {
  // Estado: busqueda y filtro de categoria
  const [search, setSearch] = useState('')
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all')

  // Estado: modales de agregar/editar
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  
  // Estado: ID del producto en edicion
  const [editingId, setEditingId] = useState<number | null>(null)

  // Estado: campos del formulario
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState<number | ''>('')
  const [stock, setStock] = useState<number | ''>('')
  const [categoryId, setCategoryId] = useState<number | ''>('')
  const [barcode, setBarcode] = useState('')
  const [formError, setFormError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  // Limpia los campos del formulario
  const clearForm = () => {
    setName('')
    setDescription('')
    setPrice('')
    setStock('')
    setCategoryId(categories.length > 0 ? Number(categories[0].id) : '')
    setBarcode('')
    setEditingId(null)
    setFormError('')
  }

  // Abre el modal para agregar producto
  const openAddModal = () => {
    clearForm()
    setIsAddModalOpen(true)
  }

  // Abre el modal para editar producto
  const openEditModal = (p: Product) => {
    setName(p.nombre)
    setDescription(p.descripcion || '')
    setPrice(p.precio)
    setStock(p.stock)
    setCategoryId(p.categoriaId !== undefined ? p.categoriaId : '')
    setBarcode(p.codigoBarras || '')
    setEditingId(p.id ?? null)
    setFormError('')
    setIsEditModalOpen(true)
  }

  // Filtra productos por busqueda y categoria
  const filteredProducts = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase('es')
    return products.filter((p) => {
      const matchesSearch =
        p.nombre.toLocaleLowerCase('es').includes(normalizedSearch) ||
        (p.descripcion && p.descripcion.toLocaleLowerCase('es').includes(normalizedSearch)) ||
        (p.codigoBarras && p.codigoBarras.toLocaleLowerCase('es').includes(normalizedSearch))

      const matchesCategory =
        selectedCategoryFilter === 'all' ||
        p.categoriaId?.toString() === selectedCategoryFilter

      return matchesSearch && matchesCategory
    })
  }, [products, search, selectedCategoryFilter])

  const inventorySummary = useMemo(() => ({
    productCount: products.length,
    unitsInStock: products.reduce((total, product) => total + product.stock, 0),
    lowStockCount: products.filter((product) => product.stock <= 10).length,
    inventoryValue: products.reduce((total, product) => total + product.precio * product.stock, 0)
  }), [products])

  // Obtiene el nombre de una categoria por su ID
  const getCategoryName = (catId?: number) => {
    if (catId === undefined) return 'Sin categoría'
    const found = categories.find((c) => c.id === catId)
    return found ? found.nombre : `Categoría #${catId}`
  }

  const buildProductData = (): Product | null => {
    const normalizedName = name.trim()
    const normalizedBarcode = barcode.trim()
    const parsedPrice = price === '' ? Number.NaN : Number(price)
    const parsedStock = stock === '' ? Number.NaN : Number(stock)

    if (!normalizedName) {
      setFormError('Escribe el nombre del producto.')
      return null
    }
    if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
      setFormError('Ingresa un precio válido mayor o igual a cero.')
      return null
    }
    if (!Number.isInteger(parsedStock) || parsedStock < 0) {
      setFormError('El stock debe ser un número entero mayor o igual a cero.')
      return null
    }
    if (normalizedBarcode && products.some((product) =>
      product.id !== editingId &&
      product.codigoBarras?.trim().toLocaleLowerCase('es') === normalizedBarcode.toLocaleLowerCase('es')
    )) {
      setFormError('Ya existe un producto con ese código de barras.')
      return null
    }

    setFormError('')
    return {
      nombre: normalizedName,
      descripcion: description.trim(),
      precio: parsedPrice,
      stock: parsedStock,
      categoriaId: categoryId === '' ? undefined : Number(categoryId),
      codigoBarras: normalizedBarcode || undefined
    }
  }

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const productData = buildProductData()
    if (!productData) return

    setIsSaving(true)
    try {
      const success = await onAddProduct(productData)
      if (success) {
        setIsAddModalOpen(false)
        clearForm()
      } else {
        setFormError('No fue posible guardar el producto. Revisa la conexión e inténtalo de nuevo.')
      }
    } catch (error) {
      console.error('Error al guardar el producto:', error)
      setFormError('Ocurrió un error al guardar el producto. Inténtalo de nuevo.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (editingId === null) return
    const productData = buildProductData()
    if (!productData) return

    setIsSaving(true)
    try {
      const success = await onEditProduct(editingId, productData)
      if (success) {
        setIsEditModalOpen(false)
        clearForm()
      } else {
        setFormError('No fue posible actualizar el producto. Revisa la conexión e inténtalo de nuevo.')
      }
    } catch (error) {
      console.error('Error al actualizar el producto:', error)
      setFormError('Ocurrió un error al actualizar el producto. Inténtalo de nuevo.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id?: number) => {
    if (!id) return
    if (window.confirm('¿Está seguro de eliminar este producto del inventario?')) {
      try {
        await onRemoveProduct(id)
      } catch (error) {
        console.error('Error al eliminar el producto:', error)
        window.alert('No fue posible eliminar el producto. Inténtalo de nuevo.')
      }
    }
  }

  // Formateador moneda
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(val)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="inventory-overview">
        <div className="card inventory-stat">
          <span>Productos registrados</span>
          <strong>{inventorySummary.productCount}</strong>
        </div>
        <div className="card inventory-stat">
          <span>Unidades disponibles</span>
          <strong>{inventorySummary.unitsInStock.toLocaleString('es-CO')}</strong>
        </div>
        <div className="card inventory-stat">
          <span>Alertas de bajo stock</span>
          <strong className={inventorySummary.lowStockCount > 0 ? 'inventory-stat-warning' : ''}>{inventorySummary.lowStockCount}</strong>
        </div>
        <div className="card inventory-stat">
          <span>Valor del inventario</span>
          <strong>{formatCurrency(inventorySummary.inventoryValue)}</strong>
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="card control-bar">
        <div className="search-box">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            className="form-control"
            placeholder="Buscar por nombre o código..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Buscar productos por nombre, descripción o código de barras"
          />
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Selector de Categorías */}
          <select
            className="form-control"
            style={{ width: 'auto', minWidth: '180px' }}
            value={selectedCategoryFilter}
            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
          >
            <option value="all">Todas las categorías</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id?.toString()}>
                {c.nombre}
              </option>
            ))}
          </select>

          {/* Botón Añadir Producto */}
          <button className="btn btn-primary" onClick={openAddModal}>
            <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2.5" fill="none">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Nuevo Producto
          </button>
        </div>
      </div>

      {/* Listado de Productos */}
      <div className="card">
        <div className="table-responsive">
          {filteredProducts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)' }}>
              <svg viewBox="0 0 24 24" width="48" height="48" stroke="var(--text-light)" strokeWidth="1.5" fill="none" style={{ marginBottom: '14px' }}>
                <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
                <line x1="7" y1="2" x2="7" y2="22" />
                <line x1="17" y1="2" x2="17" y2="22" />
                <line x1="2" y1="12" x2="22" y2="12" />
              </svg>
              <p style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '1.1rem' }}>No se encontraron productos</p>
              <p style={{ fontSize: '0.9rem' }}>Intente cambiar el término de búsqueda o agregue un nuevo artículo.</p>
            </div>
          ) : (
            <table className="table-modern">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Nombre del Artículo</th>
                  <th>Categoría</th>
                  <th>Precio Venta</th>
                  <th>Cantidad</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((p) => {
                  let stockBadge = 'badge-success'
                  let stockText = 'Disponible'
                  if (p.stock === 0) {
                    stockBadge = 'badge-danger'
                    stockText = 'Agotado'
                  } else if (p.stock <= 10) {
                    stockBadge = 'badge-warning'
                    stockText = 'Bajo Stock'
                  }

                  return (
                    <tr key={p.id}>
                      <td style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        {p.codigoBarras || `SIN-COD-${p.id}`}
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: 700 }}>{p.nombre}</span>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{p.descripcion}</span>
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-info">{getCategoryName(p.categoriaId)}</span>
                      </td>
                      <td style={{ fontWeight: 700 }}>{formatCurrency(p.precio)}</td>
                      <td style={{ fontWeight: 600 }}>{p.stock} uds</td>
                      <td>
                        <span className={`badge ${stockBadge}`}>{stockText}</span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button className="btn btn-secondary btn-sm btn-icon" title="Editar Producto" onClick={() => openEditModal(p)}>
                            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </button>
                          <button className="btn btn-secondary btn-sm btn-icon" style={{ color: 'var(--danger)' }} title="Eliminar Producto" onClick={() => handleDelete(p.id)}>
                            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                              <line x1="10" y1="11" x2="10" y2="17" />
                              <line x1="14" y1="11" x2="14" y2="17" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* MODAL: Agregar Producto */}
      {isAddModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Agregar Nuevo Producto</h2>
              <button type="button" className="btn btn-icon" aria-label="Cerrar formulario" onClick={() => { setIsAddModalOpen(false); setFormError('') }}>
                <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>
            <form onSubmit={handleAddSubmit}>
              <div className="modal-body">
                {formError && <p className="form-error" role="alert">{formError}</p>}
                <div className="form-group">
                  <label htmlFor="name">Nombre del Producto *</label>
                  <input id="name" type="text" className="form-control" placeholder="Ej. Cuaderno Arvejas" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label htmlFor="description">Descripción</label>
                  <textarea id="description" className="form-control" rows={2} placeholder="Detalles de tamaño, hojas, etc." value={description} onChange={(e) => setDescription(e.target.value)} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group">
                    <label htmlFor="price">Precio Venta (COP) *</label>
                    <input id="price" type="number" min="0" step="1" className="form-control" placeholder="0" value={price} onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))} required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="stock">Stock Físico *</label>
                    <input id="stock" type="number" min="0" step="1" className="form-control" placeholder="0" value={stock} onChange={(e) => setStock(e.target.value === '' ? '' : Number(e.target.value))} required />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="categoryId">Categoría</label>
                  <select id="categoryId" className="form-control" value={categoryId} onChange={(e) => setCategoryId(e.target.value === '' ? '' : Number(e.target.value))}>
                    <option value="">Sin Categoría</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.nombre}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="barcode">Código de Barras</label>
                  <input id="barcode" type="text" className="form-control" placeholder="Ej. 770123456789" value={barcode} onChange={(e) => setBarcode(e.target.value)} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" disabled={isSaving} onClick={() => { setIsAddModalOpen(false); setFormError('') }}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={isSaving}>{isSaving ? 'Guardando...' : 'Registrar producto'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Editar Producto */}
      {isEditModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Editar Producto</h2>
              <button type="button" className="btn btn-icon" aria-label="Cerrar formulario" onClick={() => { setIsEditModalOpen(false); setFormError('') }}>
                <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>
            <form onSubmit={handleEditSubmit}>
              <div className="modal-body">
                {formError && <p className="form-error" role="alert">{formError}</p>}
                <div className="form-group">
                  <label htmlFor="edit_name">Nombre del Producto *</label>
                  <input id="edit_name" type="text" className="form-control" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label htmlFor="edit_description">Descripción</label>
                  <textarea id="edit_description" className="form-control" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group">
                    <label htmlFor="edit_price">Precio Venta (COP) *</label>
                    <input id="edit_price" type="number" min="0" step="1" className="form-control" value={price} onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))} required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="edit_stock">Stock Físico *</label>
                    <input id="edit_stock" type="number" min="0" step="1" className="form-control" value={stock} onChange={(e) => setStock(e.target.value === '' ? '' : Number(e.target.value))} required />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="edit_categoryId">Categoría</label>
                  <select id="edit_categoryId" className="form-control" value={categoryId} onChange={(e) => setCategoryId(e.target.value === '' ? '' : Number(e.target.value))}>
                    <option value="">Sin Categoría</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.nombre}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="edit_barcode">Código de Barras</label>
                  <input id="edit_barcode" type="text" className="form-control" value={barcode} onChange={(e) => setBarcode(e.target.value)} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" disabled={isSaving} onClick={() => { setIsEditModalOpen(false); setFormError('') }}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={isSaving}>{isSaving ? 'Guardando...' : 'Guardar cambios'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}

export default Inventory
