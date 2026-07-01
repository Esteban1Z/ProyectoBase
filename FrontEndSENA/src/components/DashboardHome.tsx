import { useMemo } from 'react'

interface Product {
  id?: number
  nombre: string
  descripcion: string
  precio: number
  stock: number
  categoriaId?: number
  codigoBarras?: string
}

interface Sale {
  id?: number
  clienteId?: number
  usuarioId?: number
  fecha: string
  total: number
}

interface Client {
  id?: number
  nombre: string
  telefono: string
  email: string
}

interface DashboardHomeProps {
  products: Product[]
  sales: Sale[]
  clients: Client[]
  onNavigate: (tab: string) => void
}

function DashboardHome({ products, sales, clients, onNavigate }: DashboardHomeProps) {
  // Calcular métricas clave
  const metrics = useMemo(() => {
    const totalProductsCount = products.length
    const lowStockCount = products.filter((p) => p.stock <= 10).length
    const totalIncome = sales.reduce((sum, s) => sum + Number(s.total || 0), 0)
    const activeClientsCount = clients.length

    return {
      totalProductsCount,
      lowStockCount,
      totalIncome,
      activeClientsCount
    }
  }, [products, sales, clients])

  // Obtener los productos con bajo stock (stock <= 10), ordenados de menor a mayor stock
  const lowStockItems = useMemo(() => {
    return products
      .filter((p) => p.stock <= 10)
      .sort((a, b) => a.stock - b.stock)
      .slice(0, 5)
  }, [products])

  // Obtener las últimas 5 ventas
  const recentSales = useMemo(() => {
    return [...sales]
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
      .slice(0, 5)
  }, [sales])

  // Helper para buscar el nombre de un cliente
  const getClientName = (clientId?: number) => {
    if (!clientId) return 'Cliente General'
    const found = clients.find((c) => c.id === clientId)
    return found ? found.nombre : `Cliente #${clientId}`
  }

  // Formatear dinero en Pesos Colombianos / Formato estándar
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(val)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* Grid de Métricas */}
      <div className="dashboard-metrics-grid">
        {/* Productos */}
        <div className="card metric-card" onClick={() => onNavigate('inventory')} style={{ cursor: 'pointer' }}>
          <div className="metric-data">
            <h3>Productos en Stock</h3>
            <span className="value">{metrics.totalProductsCount}</span>
          </div>
          <div className="metric-icon indigo">
            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
              <line x1="12" y1="22.08" x2="12" y2="12" />
            </svg>
          </div>
        </div>

        {/* Bajo Stock */}
        <div className="card metric-card" onClick={() => onNavigate('inventory')} style={{ cursor: 'pointer' }}>
          <div className="metric-data">
            <h3>Alertas de Stock</h3>
            <span className="value" style={{ color: metrics.lowStockCount > 0 ? 'var(--warning)' : 'inherit' }}>
              {metrics.lowStockCount}
            </span>
          </div>
          <div className="metric-icon amber">
            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
        </div>

        {/* Ventas Totales */}
        <div className="card metric-card" onClick={() => onNavigate('sales')} style={{ cursor: 'pointer' }}>
          <div className="metric-data">
            <h3>Ingresos Totales</h3>
            <span className="value" style={{ fontSize: '1.8rem' }}>{formatCurrency(metrics.totalIncome)}</span>
          </div>
          <div className="metric-icon emerald">
            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17  5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
        </div>

        {/* Clientes */}
        <div className="card metric-card" onClick={() => onNavigate('contacts')} style={{ cursor: 'pointer' }}>
          <div className="metric-data">
            <h3>Clientes Registrados</h3>
            <span className="value">{metrics.activeClientsCount}</span>
          </div>
          <div className="metric-icon rose">
            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
        </div>
      </div>

      {/* Grid Dividido */}
      <div className="dashboard-split-grid">
        {/* Alertas de Stock */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-title)', fontWeight: 700 }}>Alertas Críticas de Stock</h2>
            <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('inventory')}>Ver Todo</button>
          </div>

          <div className="table-responsive">
            {lowStockItems.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '36px 0', color: 'var(--text-muted)' }}>
                <svg viewBox="0 0 24 24" width="40" height="40" stroke="var(--success)" strokeWidth="1.5" fill="none" style={{ marginBottom: '10px' }}>
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                <p style={{ fontWeight: 600, color: 'var(--text-main)' }}>¡Todo en orden!</p>
                <p style={{ fontSize: '0.85rem' }}>No hay productos con stock crítico en este momento.</p>
              </div>
            ) : (
              <table className="table-modern">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Stock Físico</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStockItems.map((item) => (
                    <tr key={item.id}>
                      <td style={{ fontWeight: 600 }}>{item.nombre}</td>
                      <td>{item.stock} uds</td>
                      <td>
                        <span className={`badge ${item.stock === 0 ? 'badge-danger' : 'badge-warning'}`}>
                          {item.stock === 0 ? 'Agotado' : 'Bajo Stock'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Actividad Reciente */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-title)', fontWeight: 700 }}>Últimas Ventas</h2>
            <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('sales')}>Nueva Venta</button>
          </div>

          <div className="table-responsive">
            {recentSales.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '36px 0', color: 'var(--text-muted)' }}>
                <svg viewBox="0 0 24 24" width="40" height="40" stroke="var(--text-light)" strokeWidth="1.5" fill="none" style={{ marginBottom: '10px' }}>
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <p style={{ fontWeight: 600 }}>Sin ventas aún</p>
                <p style={{ fontSize: '0.85rem' }}>Registra una venta en el módulo de ventas para comenzar.</p>
              </div>
            ) : (
              <table className="table-modern">
                <thead>
                  <tr>
                    <th>Cliente</th>
                    <th>Fecha</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {recentSales.map((sale) => (
                    <tr key={sale.id}>
                      <td style={{ fontWeight: 600 }}>{getClientName(sale.clienteId)}</td>
                      <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        {new Date(sale.fecha).toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td style={{ fontWeight: 700, color: 'var(--primary)' }}>
                        {formatCurrency(sale.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Tarjeta de Acciones Rápidas */}
      <div className="card" style={{ padding: '24px' }}>
        <h2 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-title)', fontWeight: 700, marginBottom: '18px' }}>Enlaces Rápidos del Sistema</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
          <button className="btn btn-secondary" style={{ padding: '16px' }} onClick={() => onNavigate('inventory')}>
            📦 Gestionar Inventario
          </button>
          <button className="btn btn-secondary" style={{ padding: '16px' }} onClick={() => onNavigate('sales')}>
            🛒 Registrar Nueva Venta
          </button>
          <button className="btn btn-secondary" style={{ padding: '16px' }} onClick={() => onNavigate('purchases')}>
            📥 Registrar Nueva Compra
          </button>
          <button className="btn btn-secondary" style={{ padding: '16px' }} onClick={() => onNavigate('settings')}>
            ⚙️ Panel de Control
          </button>
        </div>
      </div>
    </div>
  )
}

export default DashboardHome
