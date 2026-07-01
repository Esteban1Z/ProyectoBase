import { useState, useMemo } from 'react'

interface Product {
  id?: number
  nombre: string
  precio: number
  stock: number
  codigoBarras?: string
}

interface Client {
  id?: number
  nombre: string
  telefono: string
  email: string
}

interface Sale {
  id?: number
  clienteId?: number
  usuarioId?: number
  fecha: string
  total: number
}

interface SaleDetail {
  id?: number
  ventaId?: number
  productoId?: number
  cantidad: number
  precioVenta: number
}

interface SalesProps {
  sales: Sale[]
  saleDetails: SaleDetail[]
  products: Product[]
  clients: Client[]
  onAddSale: (saleData: { clienteId?: number; total: number; details: Omit<SaleDetail, 'id'>[] }) => Promise<boolean>
}

interface CartItem {
  product: Product
  quantity: number
}

function Sales({ sales, saleDetails, products, clients, onAddSale }: SalesProps) {
  const [viewMode, setViewMode] = useState<'list' | 'create'>('list')
  const [searchSale, setSearchSale] = useState('')
  const [selectedSaleForModal, setSelectedSaleForModal] = useState<Sale | null>(null)

  // Estados para Registro de Nueva Venta
  const [selectedClientId, setSelectedClientId] = useState<number | ''>('')
  const [cart, setCart] = useState<CartItem[]>([])
  const [searchProduct, setSearchProduct] = useState('')

  // Filtrado de Historial de Ventas
  const filteredSales = useMemo(() => {
    return sales
      .filter((s) => {
        const clientName = clients.find((c) => c.id === s.clienteId)?.nombre || 'Cliente General'
        const matchesClient = clientName.toLowerCase().includes(searchSale.toLowerCase())
        const matchesId = s.id?.toString().includes(searchSale)
        return matchesClient || matchesId
      })
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
  }, [sales, clients, searchSale])

  // Filtrado de Catálogo de Productos en la Venta
  const catalogProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.nombre.toLowerCase().includes(searchProduct.toLowerCase()) ||
        (p.codigoBarras && p.codigoBarras.includes(searchProduct))
      return matchesSearch && p.stock > 0
    })
  }, [products, searchProduct])

  // Detalles de la venta seleccionada para el modal
  const activeSaleDetails = useMemo(() => {
    if (!selectedSaleForModal) return []
    return saleDetails.filter((d) => d.ventaId === selectedSaleForModal.id)
  }, [selectedSaleForModal, saleDetails])

  // Totales de la Venta actual en Carrito
  const cartTotals = useMemo(() => {
    const subtotal = cart.reduce((sum, item) => sum + item.product.precio * item.quantity, 0)
    return {
      total: subtotal
    }
  }, [cart])

  // Manejadores de Carrito
  const addToCart = (product: Product) => {
    setCart((current) => {
      const existingIndex = current.findIndex((item) => item.product.id === product.id)
      
      // Validar stock físico antes de sumar
      const currentQty = existingIndex > -1 ? current[existingIndex].quantity : 0
      if (currentQty >= product.stock) {
        alert(`No hay suficiente stock. Stock actual: ${product.stock} unidades.`)
        return current
      }

      if (existingIndex > -1) {
        const updated = [...current]
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + 1
        }
        return updated
      } else {
        return [...current, { product, quantity: 1 }]
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

      // Validar límites de stock
      if (newQty > item.product.stock) {
        alert(`No se pueden vender más de ${item.product.stock} unidades de este artículo.`)
        return current
      }

      const updated = [...current]
      updated[existingIndex] = { ...item, quantity: newQty }
      return updated
    })
  }

  const removeFromCart = (productId?: number) => {
    if (!productId) return
    setCart((current) => current.filter((item) => item.product.id !== productId))
  }

  // Confirmar y Registrar la Venta
  const handleCheckoutSubmit = async () => {
    if (cart.length === 0) {
      alert('Agregue al menos un producto al carrito.')
      return
    }

    const saleData = {
      clienteId: selectedClientId === '' ? undefined : Number(selectedClientId),
      total: cartTotals.total,
      details: cart.map((item) => ({
        productoId: item.product.id,
        cantidad: item.quantity,
        precioVenta: item.product.precio
      }))
    }

    const success = await onAddSale(saleData)
    if (success) {
      setCart([])
      setSelectedClientId('')
      setViewMode('list')
    }
  }

  // Utilidades
  const getClientName = (clientId?: number) => {
    if (!clientId) return 'Cliente General'
    const found = clients.find((c) => c.id === clientId)
    return found ? found.nombre : `Cliente #${clientId}`
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
      
      {/* Botones de navegación interna */}
      <div style={{ display: 'flex', gap: '12px' }}>
        <button
          className={`btn ${viewMode === 'list' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setViewMode('list')}
        >
          📄 Historial de Ventas
        </button>
        <button
          className={`btn ${viewMode === 'create' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setViewMode('create')}
        >
          🛒 Registrar Nueva Venta
        </button>
      </div>

      {/* VISTA 1: Historial de Ventas */}
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
                placeholder="Buscar venta por folio o cliente..."
                value={searchSale}
                onChange={(e) => setSearchSale(e.target.value)}
              />
            </div>
          </div>

          <div className="card">
            <div className="table-responsive">
              {filteredSales.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)' }}>
                  <svg viewBox="0 0 24 24" width="48" height="48" stroke="var(--text-light)" strokeWidth="1.5" fill="none" style={{ marginBottom: '14px' }}>
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <p style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '1.1rem' }}>No se encontraron ventas</p>
                  <p style={{ fontSize: '0.9rem' }}>Realiza tu primera venta haciendo clic en "Registrar Nueva Venta".</p>
                </div>
              ) : (
                <table className="table-modern">
                  <thead>
                    <tr>
                      <th>Folio</th>
                      <th>Fecha y Hora</th>
                      <th>Cliente</th>
                      <th>Total Recibido</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSales.map((sale) => (
                      <tr key={sale.id}>
                        <td style={{ fontWeight: 700, color: 'var(--text-muted)' }}>
                          #{sale.id}
                        </td>
                        <td>
                          {new Date(sale.fecha).toLocaleString('es-ES', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                        <td style={{ fontWeight: 600 }}>{getClientName(sale.clienteId)}</td>
                        <td style={{ fontWeight: 800, color: 'var(--success)' }}>
                          {formatCurrency(sale.total)}
                        </td>
                        <td>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => setSelectedSaleForModal(sale)}
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

      {/* VISTA 2: Registrar Nueva Venta */}
      {viewMode === 'create' && (
        <div className="transaction-flow">
          {/* Lado Izquierdo: Catálogo */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontFamily: 'var(--font-title)', fontWeight: 700 }}>Catálogo de Artículos</h3>
            <div className="search-box" style={{ maxWidth: '100%' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                className="form-control"
                placeholder="Filtrar catálogo..."
                value={searchProduct}
                onChange={(e) => setSearchProduct(e.target.value)}
              />
            </div>

            <div className="table-responsive" style={{ maxHeight: '420px', border: '1px solid var(--border-color)' }}>
              <table className="table-modern">
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Producto</th>
                    <th>Precio</th>
                    <th>Existencia</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {catalogProducts.map((p) => (
                    <tr key={p.id}>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {p.codigoBarras || `COD-${p.id}`}
                      </td>
                      <td style={{ fontWeight: 700 }}>{p.nombre}</td>
                      <td style={{ fontWeight: 600 }}>{formatCurrency(p.precio)}</td>
                      <td style={{ fontWeight: 600, color: p.stock <= 5 ? 'var(--danger)' : 'inherit' }}>
                        {p.stock} uds
                      </td>
                      <td>
                        <button className="btn btn-primary btn-sm" onClick={() => addToCart(p)}>
                          ➕ Añadir
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Lado Derecho: Carrito de Compras */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ fontFamily: 'var(--font-title)', fontWeight: 700 }}>Detalle de Compra</h3>

            {/* Selector de Cliente */}
            <div className="form-group">
              <label>Cliente Receptor</label>
              <select
                className="form-control"
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value === '' ? '' : Number(e.target.value))}
              >
                <option value="">Cliente General (Sin registro)</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Items agregados */}
            <div className="cart-items">
              {cart.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-light)', border: '1px dashed var(--border-color)', borderRadius: '12px' }}>
                  <span>El carrito está vacío</span>
                </div>
              ) : (
                cart.map((item) => (
                  <div className="cart-item" key={item.product.id}>
                    <div className="cart-item-details">
                      <span className="cart-item-title">{item.product.nombre}</span>
                      <span className="cart-item-price">{formatCurrency(item.product.precio)} c/u</span>
                    </div>

                    <div className="cart-item-actions">
                      <div className="cart-quantity-spinner">
                        <button type="button" onClick={() => updateQuantity(item.product.id!, -1)}>-</button>
                        <span>{item.quantity}</span>
                        <button type="button" onClick={() => updateQuantity(item.product.id!, 1)}>+</button>
                      </div>
                      <button
                        className="btn btn-icon btn-sm"
                        style={{ color: 'var(--danger)' }}
                        onClick={() => removeFromCart(item.product.id)}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Sumario de Factura */}
            <div className="cart-summary-panel">
              <div className="summary-row">
                <span>Subtotal</span>
                <span>{formatCurrency(cartTotals.total)}</span>
              </div>
              <div className="summary-row">
                <span>Impuestos (IVA 0%)</span>
                <span>$0</span>
              </div>
              <div className="summary-row total">
                <span>Total a Pagar</span>
                <span>{formatCurrency(cartTotals.total)}</span>
              </div>

              <button
                className="btn btn-primary"
                style={{ width: '100%', padding: '12px' }}
                onClick={handleCheckoutSubmit}
                disabled={cart.length === 0}
              >
                💵 Completar Factura
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Detalle de Venta Histórica */}
      {selectedSaleForModal && (
        <div className="modal-overlay">
          <div className="modal-content large">
            <div className="modal-header">
              <h2>Detalle de Venta #{selectedSaleForModal.id}</h2>
              <button className="btn btn-icon" onClick={() => setSelectedSaleForModal(null)}>
                <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>
            <div className="modal-body">
              {/* Info de Factura */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px', backgroundColor: 'var(--bg-input)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                <div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>CLIENTE</p>
                  <p style={{ fontWeight: 700 }}>{getClientName(selectedSaleForModal.clienteId)}</p>
                </div>
                <div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>FECHA DE EMISIÓN</p>
                  <p style={{ fontWeight: 700 }}>{new Date(selectedSaleForModal.fecha).toLocaleString()}</p>
                </div>
              </div>

              {/* Listado de Productos en la Factura */}
              <table className="table-modern">
                <thead>
                  <tr>
                    <th>Articulo</th>
                    <th>Cantidad</th>
                    <th>Valor Unitario</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {activeSaleDetails.map((d) => (
                    <tr key={d.id}>
                      <td style={{ fontWeight: 700 }}>{getProductName(d.productoId)}</td>
                      <td>{d.cantidad} uds</td>
                      <td>{formatCurrency(d.precioVenta)}</td>
                      <td style={{ fontWeight: 700, color: 'var(--primary)' }}>
                        {formatCurrency(d.cantidad * d.precioVenta)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px', paddingRight: '18px' }}>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600, marginRight: '8px' }}>VALOR TOTAL FACTURADO:</span>
                  <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--success)' }}>
                    {formatCurrency(selectedSaleForModal.total)}
                  </span>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setSelectedSaleForModal(null)}>Cerrar Factura</button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default Sales
