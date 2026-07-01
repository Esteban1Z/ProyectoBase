import { useState, useMemo } from 'react'

interface Product {
  id?: number
  nombre: string
  precio: number
  stock: number
  codigoBarras?: string
}

interface Supplier {
  id?: number
  nombre: string
  telefono: string
  email: string
  direccion?: string
}

interface Purchase {
  id?: number
  proveedorId?: number
  usuarioId?: number
  fecha: string
  total: number
}

interface PurchaseDetail {
  id?: number
  compraId?: number
  productoId?: number
  cantidad: number
  precioCompra: number
}

interface PurchasesProps {
  purchases: Purchase[]
  purchaseDetails: PurchaseDetail[]
  products: Product[]
  suppliers: Supplier[]
  onAddPurchase: (purchaseData: { proveedorId?: number; total: number; details: Omit<PurchaseDetail, 'id'>[] }) => Promise<boolean>
}

interface CartItem {
  product: Product
  quantity: number
  costPrice: number
}

function Purchases({ purchases, purchaseDetails, products, suppliers, onAddPurchase }: PurchasesProps) {
  const [viewMode, setViewMode] = useState<'list' | 'create'>('list')
  const [searchPurchase, setSearchPurchase] = useState('')
  const [selectedPurchaseForModal, setSelectedPurchaseForModal] = useState<Purchase | null>(null)

  // Estados para Registro de Nueva Compra
  const [selectedSupplierId, setSelectedSupplierId] = useState<number | ''>('')
  const [cart, setCart] = useState<CartItem[]>([])
  const [searchProduct, setSearchProduct] = useState('')
  
  // Entrada para precio de compra personalizado al agregar
  const [customCostPrices, setCustomCostPrices] = useState<Record<number, number>>({})

  // Filtrado de Historial de Compras
  const filteredPurchases = useMemo(() => {
    return purchases
      .filter((p) => {
        const supplierName = suppliers.find((s) => s.id === p.proveedorId)?.nombre || 'Proveedor General'
        const matchesSupplier = supplierName.toLowerCase().includes(searchPurchase.toLowerCase())
        const matchesId = p.id?.toString().includes(searchPurchase)
        return matchesSupplier || matchesId
      })
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
  }, [purchases, suppliers, searchPurchase])

  // Catálogo de Productos
  const catalogProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.nombre.toLowerCase().includes(searchProduct.toLowerCase()) ||
        (p.codigoBarras && p.codigoBarras.includes(searchProduct))
      return matchesSearch
    })
  }, [products, searchProduct])

  // Detalles de la compra seleccionada para el modal
  const activePurchaseDetails = useMemo(() => {
    if (!selectedPurchaseForModal) return []
    return purchaseDetails.filter((d) => d.compraId === selectedPurchaseForModal.id)
  }, [selectedPurchaseForModal, purchaseDetails])

  // Totales de la Compra actual en Carrito
  const cartTotals = useMemo(() => {
    const total = cart.reduce((sum, item) => sum + item.costPrice * item.quantity, 0)
    return { total }
  }, [cart])

  // Manejadores de Carrito
  const addToCart = (product: Product) => {
    if (!product.id) return
    const currentCostInput = customCostPrices[product.id] || Math.round(product.precio * 0.7) // Costo estimado de 70% por defecto si no lo llenaron

    setCart((current) => {
      const existingIndex = current.findIndex((item) => item.product.id === product.id)
      
      if (existingIndex > -1) {
        const updated = [...current]
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + 1,
          costPrice: currentCostInput // Actualiza al costo más reciente ingresado
        }
        return updated
      } else {
        return [...current, { product, quantity: 1, costPrice: currentCostInput }]
      }
    })
  }

  const updateQuantity = (productId: number, delta: number) => {
    if (!productId) return
    setCart((current) => {
      const existingIndex = current.findIndex((item) => item.product.id === productId)
      if (existingIndex === -1) return current

      const item = current[existingIndex]
      const newQty = item.quantity + delta

      if (newQty <= 0) {
        return current.filter((item) => item.product.id !== productId)
      }

      const updated = [...current]
      updated[existingIndex] = { ...item, quantity: newQty }
      return updated
    })
  }

  const updateCostPrice = (productId: number, val: number) => {
    setCart((current) => {
      const existingIndex = current.findIndex((item) => item.product.id === productId)
      if (existingIndex === -1) return current

      const updated = [...current]
      updated[existingIndex] = { ...updated[existingIndex], costPrice: val >= 0 ? val : 0 }
      return updated
    })
  }

  const removeFromCart = (productId?: number) => {
    if (!productId) return
    setCart((current) => current.filter((item) => item.product.id !== productId))
  }

  // Guardar Compra
  const handlePurchaseSubmit = async () => {
    if (cart.length === 0) {
      alert('Agregue al menos un artículo para comprar.')
      return
    }

    if (!selectedSupplierId) {
      alert('Por favor seleccione un Proveedor válido.')
      return
    }

    const purchaseData = {
      proveedorId: Number(selectedSupplierId),
      total: cartTotals.total,
      details: cart.map((item) => ({
        productoId: item.product.id,
        cantidad: item.quantity,
        precioCompra: item.costPrice
      }))
    }

    const success = await onAddPurchase(purchaseData)
    if (success) {
      setCart([])
      setSelectedSupplierId('')
      setCustomCostPrices({})
      setViewMode('list')
    }
  }

  // Helpers
  const getSupplierName = (supplierId?: number) => {
    if (!supplierId) return 'Proveedor General'
    const found = suppliers.find((s) => s.id === supplierId)
    return found ? found.nombre : `Proveedor #${supplierId}`
  }

  const getProductName = (productId?: number) => {
    if (!productId) return 'Producto Desconocido'
    const found = products.find((p) => p.id === productId)
    return found ? found.nombre : `Artículo #${productId}`
  }

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(val)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Botones de Navegación Interna */}
      <div style={{ display: 'flex', gap: '12px' }}>
        <button
          className={`btn ${viewMode === 'list' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setViewMode('list')}
        >
          📄 Registro de Compras
        </button>
        <button
          className={`btn ${viewMode === 'create' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setViewMode('create')}
        >
          📥 Nueva Compra / Ingreso
        </button>
      </div>

      {/* VISTA 1: Lista de Compras */}
      {viewMode === 'list' && (
        <>
          <div className="card control-bar">
            <div className="search-box">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                className="form-control"
                placeholder="Buscar compra por folio o proveedor..."
                value={searchPurchase}
                onChange={(e) => setSearchPurchase(e.target.value)}
              />
            </div>
          </div>

          <div className="card">
            <div className="table-responsive">
              {filteredPurchases.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)' }}>
                  <svg viewBox="0 0 24 24" width="48" height="48" stroke="var(--text-light)" strokeWidth="1.5" fill="none" style={{ marginBottom: '14px' }}>
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <p style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '1.1rem' }}>No se encontraron compras</p>
                  <p style={{ fontSize: '0.9rem' }}>Ingresa nuevo inventario haciendo clic en "Nueva Compra / Ingreso".</p>
                </div>
              ) : (
                <table className="table-modern">
                  <thead>
                    <tr>
                      <th>Folio</th>
                      <th>Fecha</th>
                      <th>Proveedor</th>
                      <th>Costo Total</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPurchases.map((purchase) => (
                      <tr key={purchase.id}>
                        <td style={{ fontWeight: 700, color: 'var(--text-muted)' }}>
                          #{purchase.id}
                        </td>
                        <td>
                          {new Date(purchase.fecha).toLocaleString('es-ES', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                        <td style={{ fontWeight: 600 }}>{getSupplierName(purchase.proveedorId)}</td>
                        <td style={{ fontWeight: 800, color: 'var(--primary)' }}>
                          {formatCurrency(purchase.total)}
                        </td>
                        <td>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => setSelectedPurchaseForModal(purchase)}
                          >
                            👁️ Ver Detalle
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </>
      )}

      {/* VISTA 2: Registrar Nueva Compra */}
      {viewMode === 'create' && (
        <div className="transaction-flow">
          {/* Lado Izquierdo: Buscador de Artículos */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontFamily: 'var(--font-title)', fontWeight: 700 }}>Inventario Existente</h3>
            <div className="search-box" style={{ maxWidth: '100%' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                className="form-control"
                placeholder="Filtrar por nombre o código..."
                value={searchProduct}
                onChange={(e) => setSearchProduct(e.target.value)}
              />
            </div>

            <div className="table-responsive" style={{ maxHeight: '420px', border: '1px solid var(--border-color)' }}>
              <table className="table-modern">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Stock Actual</th>
                    <th>Costo Compra (Est.)</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {catalogProducts.map((p) => {
                    const defaultCost = Math.round(p.precio * 0.7)
                    const costVal = customCostPrices[p.id || 0] !== undefined ? customCostPrices[p.id || 0] : defaultCost

                    return (
                      <tr key={p.id}>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontWeight: 700 }}>{p.nombre}</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', fontFamily: 'monospace' }}>
                              {p.codigoBarras || `ID: ${p.id}`}
                            </span>
                          </div>
                        </td>
                        <td style={{ fontWeight: 600 }}>{p.stock} uds</td>
                        <td>
                          <input
                            type="number"
                            min="0"
                            className="form-control btn-sm"
                            style={{ width: '100px', display: 'inline' }}
                            value={costVal}
                            onChange={(e) => {
                              if (p.id) {
                                setCustomCostPrices({
                                  ...customCostPrices,
                                  [p.id]: Number(e.target.value)
                                })
                              }
                            }}
                          />
                        </td>
                        <td>
                          <button className="btn btn-primary btn-sm" onClick={() => addToCart(p)}>
                            ➕ Comprar
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Lado Derecho: Carrito de Compras */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ fontFamily: 'var(--font-title)', fontWeight: 700 }}>Resumen de Ingreso</h3>

            {/* Selector de Proveedor */}
            <div className="form-group">
              <label>Proveedor Asociado *</label>
              <select
                className="form-control"
                value={selectedSupplierId}
                onChange={(e) => setSelectedSupplierId(e.target.value === '' ? '' : Number(e.target.value))}
                required
              >
                <option value="">-- Seleccionar Proveedor --</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Listado de Artículos a comprar */}
            <div className="cart-items">
              {cart.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-light)', border: '1px dashed var(--border-color)', borderRadius: '12px' }}>
                  <span>Selecciona productos de la lista</span>
                </div>
              ) : (
                cart.map((item) => (
                  <div className="cart-item" key={item.product.id} style={{ flexDirection: 'column', alignItems: 'stretch', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span className="cart-item-title">{item.product.nombre}</span>
                      <button
                        className="btn btn-icon btn-sm"
                        style={{ color: 'var(--danger)', padding: 0 }}
                        onClick={() => removeFromCart(item.product.id)}
                      >
                        ✕
                      </button>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      {/* Precio compra configurable en el carrito */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Costo:</span>
                        <input
                          type="number"
                          min="0"
                          className="form-control btn-sm"
                          style={{ width: '80px', padding: '4px' }}
                          value={item.costPrice}
                          onChange={(e) => updateCostPrice(Number(item.product.id), Number(e.target.value))}
                        />
                      </div>

                      {/* Cantidad */}
                      <div className="cart-quantity-spinner">
                        <button type="button" onClick={() => updateQuantity(item.product.id!, -1)}>-</button>
                        <span>{item.quantity}</span>
                        <button type="button" onClick={() => updateQuantity(item.product.id!, 1)}>+</button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Sumario */}
            <div className="cart-summary-panel">
              <div className="summary-row total">
                <span>Inversión Total</span>
                <span>{formatCurrency(cartTotals.total)}</span>
              </div>

              <button
                className="btn btn-primary"
                style={{ width: '100%', padding: '12px' }}
                onClick={handlePurchaseSubmit}
                disabled={cart.length === 0 || !selectedSupplierId}
              >
                📥 Confirmar e Ingresar Stock
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Detalle de Compra Histórica */}
      {selectedPurchaseForModal && (
        <div className="modal-overlay">
          <div className="modal-content large">
            <div className="modal-header">
              <h2>Detalle de Compra #{selectedPurchaseForModal.id}</h2>
              <button className="btn btn-icon" onClick={() => setSelectedPurchaseForModal(null)}>
                <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>
            <div className="modal-body">
              {/* Información General */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px', backgroundColor: 'var(--bg-input)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                <div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>PROVEEDOR ORIGEN</p>
                  <p style={{ fontWeight: 700 }}>{getSupplierName(selectedPurchaseForModal.proveedorId)}</p>
                </div>
                <div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>FECHA DE TRANSACCIÓN</p>
                  <p style={{ fontWeight: 700 }}>{new Date(selectedPurchaseForModal.fecha).toLocaleString()}</p>
                </div>
              </div>

              {/* Detalle de Artículos */}
              <table className="table-modern">
                <thead>
                  <tr>
                    <th>Artículo</th>
                    <th>Cantidad Comprada</th>
                    <th>Costo Unitario de Compra</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {activePurchaseDetails.map((d) => (
                    <tr key={d.id}>
                      <td style={{ fontWeight: 700 }}>{getProductName(d.productoId)}</td>
                      <td>{d.cantidad} uds</td>
                      <td>{formatCurrency(d.precioCompra)}</td>
                      <td style={{ fontWeight: 700, color: 'var(--primary)' }}>
                        {formatCurrency(d.cantidad * d.precioCompra)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px', paddingRight: '18px' }}>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600, marginRight: '8px' }}>INVERSIÓN TOTAL DE INGRESO:</span>
                  <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)' }}>
                    {formatCurrency(selectedPurchaseForModal.total)}
                  </span>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setSelectedPurchaseForModal(null)}>Cerrar Detalle</button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default Purchases
