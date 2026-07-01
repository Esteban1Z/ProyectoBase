import { useState, useEffect, useCallback } from 'react'
import Login from './components/Login'
import DashboardHome from './components/DashboardHome'
import Inventory from './components/Inventory'
import Sales from './components/Sales'
import Purchases from './components/Purchases'
import Contacts from './components/Contacts'
import Settings from './components/Settings'

// interfaces
interface User {
  id: number
  nombre: string
  email: string
  rol: string
  isDemo: boolean
}

interface Product {
  id?: number
  nombre: string
  descripcion: string
  precio: number
  stock: number
  categoriaId?: number
  codigoBarras?: string
}

interface Category {
  id?: number
  nombre: string
  descripcion: string
}

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

interface SystemUser {
  id?: number
  nombre: string
  email: string
  password?: string
  rol: string
  createdAt?: string
}

interface Toast {
  id: number
  message: string
  type: 'success' | 'error' | 'warning'
}

// Datos semilla de demostración
const INITIAL_CATEGORIES: Category[] = [
  { id: 1, nombre: 'Cuadernos y Blocks', descripcion: 'Cuadernos escolares, universitarios y blocks de notas' },
  { id: 2, nombre: 'Escritorio y Oficina', descripcion: 'Lapiceros, marcadores, borradores y consumibles' },
  { id: 3, nombre: 'Papelería General', descripcion: 'Resmas de papel, cartulinas y sobres' },
  { id: 4, nombre: 'Arte y Dibujo', descripcion: 'Block de dibujo, temperas, pinceles y lápices profesionales' }
]

const INITIAL_PRODUCTS: Product[] = [
  { id: 1, nombre: 'Cuaderno Cuadriculado 100H', descripcion: 'Cuaderno cosido de 100 hojas cuadriculadas Norma', precio: 4500, stock: 35, categoriaId: 1, codigoBarras: '770123456001' },
  { id: 2, nombre: 'Lapicero Gel Negro 0.5mm', descripcion: 'Lapicero de tinta gel secado rápido color negro', precio: 2200, stock: 120, categoriaId: 2, codigoBarras: '770123456002' },
  { id: 3, nombre: 'Resma Papel Carta Reprograf', descripcion: 'Resma de 500 hojas de papel bond blanco de 75g', precio: 19500, stock: 8, categoriaId: 3, codigoBarras: '770123456003' },
  { id: 4, nombre: 'Marcador Permanente Negro Edding', descripcion: 'Marcador punta acrílica resistente al agua', precio: 4200, stock: 15, categoriaId: 2, codigoBarras: '770123456004' },
  { id: 5, nombre: 'Caja Colores Kores x24', descripcion: 'Lápices de colores suaves con mina resistente', precio: 14500, stock: 18, categoriaId: 4, codigoBarras: '770123456005' },
  { id: 6, nombre: 'Block Dibujo Hojas Blancas A4', descripcion: 'Block de 20 hojas blancas de 120g para bocetos', precio: 8900, stock: 3, categoriaId: 4, codigoBarras: '770123456006' }
]

const INITIAL_CLIENTS: Client[] = [
  { id: 1, nombre: 'María José Restrepo', telefono: '3124567890', email: 'maria@mail.com' },
  { id: 2, nombre: 'Distribuidora El Colegial', telefono: '6015551234', email: 'ventas@elcolegial.com' }
]

const INITIAL_SUPPLIERS: Supplier[] = [
  { id: 1, nombre: 'Papelería Mayorista Nacional', telefono: '3009876543', email: 'pedidos@mayorista.com', direccion: 'Zona Industrial, Bogotá' },
  { id: 2, nombre: 'Norma Distribuciones S.A.', telefono: '3201112233', email: 'contacto@norma.com', direccion: 'Av. Las Américas, Cali' }
]

const INITIAL_USERS: SystemUser[] = [
  { id: 999, nombre: 'Administrador Demo', email: 'admin@mail.com', password: '123456', rol: 'Administrador', createdAt: new Date().toISOString() },
  { id: 998, nombre: 'Juan Vendedor', email: 'juan@mail.com', password: '123', rol: 'Vendedor', createdAt: new Date().toISOString() }
]

const INITIAL_SALES: Sale[] = [
  { id: 1, clienteId: 1, usuarioId: 999, fecha: new Date(Date.now() - 3600000 * 2).toISOString(), total: 15400 }
]

const INITIAL_SALE_DETAILS: SaleDetail[] = [
  { id: 1, ventaId: 1, productoId: 1, cantidad: 2, precioVenta: 4500 },
  { id: 2, ventaId: 1, productoId: 2, cantidad: 2, precioVenta: 2200 },
  { id: 3, ventaId: 1, productoId: 4, cantidad: 1, precioVenta: 4200 }
]

const INITIAL_PURCHASES: Purchase[] = [
  { id: 1, proveedorId: 1, usuarioId: 999, fecha: new Date(Date.now() - 86400000 * 3).toISOString(), total: 420000 }
]

const INITIAL_PURCHASE_DETAILS: PurchaseDetail[] = [
  { id: 1, compraId: 1, productoId: 3, cantidad: 30, precioCompra: 14000 }
]

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [activeTab, setActiveTab] = useState<string>('dashboard')
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false)

  // Modo de conexión detectado
  const [connectionMode, setConnectionMode] = useState<'backend' | 'demo'>('demo')

  // Listas de datos globales
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [sales, setSales] = useState<Sale[]>([])
  const [saleDetails, setSaleDetails] = useState<SaleDetail[]>([])
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [purchaseDetails, setPurchaseDetails] = useState<PurchaseDetail[]>([])
  const [users, setUsers] = useState<SystemUser[]>([])

  // Notificaciones Toast
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((message: string, type: 'success' | 'error' | 'warning' = 'success') => {
    const id = Date.now()
    setToasts((current) => [...current, { id, message, type }])
    setTimeout(() => {
      setToasts((current) => current.filter((t) => t.id !== id))
    }, 4000)
  }, [])

  // Inicializar Tema desde LocalStorage
  useEffect(() => {
    const storedDark = localStorage.getItem('papelsoft_dark_mode')
    if (storedDark === 'true') {
      setIsDarkMode(true)
      document.body.classList.add('dark-mode')
    } else {
      setIsDarkMode(false)
      document.body.classList.remove('dark-mode')
    }
  }, [])

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => {
      const next = !prev
      if (next) {
        document.body.classList.add('dark-mode')
        localStorage.setItem('papelsoft_dark_mode', 'true')
      } else {
        document.body.classList.remove('dark-mode')
        localStorage.setItem('papelsoft_dark_mode', 'false')
      }
      return next
    })
  }

  // Detectar si el backend está activo y cargar datos
  useEffect(() => {
    const checkAndLoad = async () => {
      try {
        const controller = new AbortController()
        const id = setTimeout(() => controller.abort(), 2000)
        const res = await fetch('http://localhost:8080/api/productos', { signal: controller.signal })
        clearTimeout(id)
        
        if (res.ok) {
          setConnectionMode('backend')
          await loadFromBackend()
        } else {
          setConnectionMode('demo')
          loadFromDemo()
        }
      } catch {
        setConnectionMode('demo')
        loadFromDemo()
      }
    }

    if (currentUser) {
      if (currentUser.isDemo) {
        setConnectionMode('demo')
        loadFromDemo()
      } else {
        checkAndLoad()
      }
    }
  }, [currentUser])

  // Carga de backend Spring Boot
  const loadFromBackend = async () => {
    try {
      const endpoints = [
        'productos', 'categorias', 'clientes', 'proveedores',
        'ventas', 'detalle-ventas', 'compras', 'detalle-compras', 'usuarios'
      ]
      
      const responses = await Promise.all(
        endpoints.map(ep => fetch(`http://localhost:8080/api/${ep}`).then(r => r.json()))
      )

      setProducts(responses[0])
      setCategories(responses[1])
      setClients(responses[2])
      setSuppliers(responses[3])
      setSales(responses[4])
      setSaleDetails(responses[5])
      setPurchases(responses[6])
      setPurchaseDetails(responses[7])
      setUsers(responses[8])
    } catch (err) {
      console.error('Error cargando del backend:', err)
      addToast('Error al leer datos del servidor. Usando datos demo.', 'warning')
      setConnectionMode('demo')
      loadFromDemo()
    }
  }

  // Carga de simulador LocalStorage
  const loadFromDemo = () => {
    const getLocal = <T,>(key: string, fallback: T): T => {
      const data = localStorage.getItem(key)
      return data ? JSON.parse(data) : fallback
    }

    setProducts(getLocal('ps_products', INITIAL_PRODUCTS))
    setCategories(getLocal('ps_categories', INITIAL_CATEGORIES))
    setClients(getLocal('ps_clients', INITIAL_CLIENTS))
    setSuppliers(getLocal('ps_suppliers', INITIAL_SUPPLIERS))
    setSales(getLocal('ps_sales', INITIAL_SALES))
    setSaleDetails(getLocal('ps_sale_details', INITIAL_SALE_DETAILS))
    setPurchases(getLocal('ps_purchases', INITIAL_PURCHASES))
    setPurchaseDetails(getLocal('ps_purchase_details', INITIAL_PURCHASE_DETAILS))
    setUsers(getLocal('ps_users', INITIAL_USERS))
  }

  // Guardar cambio en Demo LocalStorage
  const saveDemoState = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data))
  }

  // REESTABLECER MOCKDATA DEMO
  const handleResetDemoData = () => {
    localStorage.removeItem('ps_products')
    localStorage.removeItem('ps_categories')
    localStorage.removeItem('ps_clients')
    localStorage.removeItem('ps_suppliers')
    localStorage.removeItem('ps_sales')
    localStorage.removeItem('ps_sale_details')
    localStorage.removeItem('ps_purchases')
    localStorage.removeItem('ps_purchase_details')
    localStorage.removeItem('ps_users')
    
    loadFromDemo()
    addToast('Base de datos demo restablecida con éxito.', 'success')
  }

  // LOGIN SUCCESS
  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user)
    addToast(`¡Bienvenido de nuevo, ${user.nombre}!`, 'success')
  }

  const handleLogout = () => {
    setCurrentUser(null)
    setActiveTab('dashboard')
  }

  // ==========================================================================
  // OPERACIONES CRUD: PRODUCTOS
  // ==========================================================================
  const handleAddProduct = async (p: Product): Promise<boolean> => {
    if (connectionMode === 'backend') {
      try {
        const res = await fetch('http://localhost:8080/api/productos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(p)
        })
        if (res.ok) {
          await loadFromBackend()
          addToast('Producto agregado al servidor.', 'success')
          return true
        }
      } catch (err) {
        console.error(err)
      }
      addToast('No se pudo guardar el producto en el servidor.', 'error')
      return false
    } else {
      const newProduct = { ...p, id: products.length ? Math.max(...products.map(i => i.id || 0)) + 1 : 1 }
      const updatedList = [...products, newProduct]
      setProducts(updatedList)
      saveDemoState('ps_products', updatedList)
      addToast(`Producto "${p.nombre}" agregado.`, 'success')
      return true
    }
  }

  const handleEditProduct = async (id: number, p: Product): Promise<boolean> => {
    if (connectionMode === 'backend') {
      try {
        const res = await fetch(`http://localhost:8080/api/productos/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(p)
        })
        if (res.ok) {
          await loadFromBackend()
          addToast('Producto actualizado en el servidor.', 'success')
          return true
        }
      } catch (err) {
        console.error(err)
      }
      addToast('No se pudo editar el producto en el servidor.', 'error')
      return false
    } else {
      const updatedList = products.map((item) => (item.id === id ? { ...item, ...p } : item))
      setProducts(updatedList)
      saveDemoState('ps_products', updatedList)
      addToast(`Producto modificado.`, 'success')
      return true
    }
  }

  const handleRemoveProduct = async (id: number): Promise<boolean> => {
    if (connectionMode === 'backend') {
      try {
        const res = await fetch(`http://localhost:8080/api/productos/${id}`, { method: 'DELETE' })
        if (res.ok) {
          await loadFromBackend()
          addToast('Producto eliminado del servidor.', 'success')
          return true
        }
      } catch (err) {
        console.error(err)
      }
      addToast('No se pudo eliminar el producto en el servidor.', 'error')
      return false
    } else {
      const updatedList = products.filter((item) => item.id !== id)
      setProducts(updatedList)
      saveDemoState('ps_products', updatedList)
      addToast('Producto eliminado del inventario.', 'success')
      return true
    }
  }

  // ==========================================================================
  // OPERACIONES: VENTAS
  // ==========================================================================
  const handleAddSale = async (saleData: { clienteId?: number; total: number; details: Omit<SaleDetail, 'id'>[] }): Promise<boolean> => {
    if (connectionMode === 'backend') {
      try {
        // 1. Crear Venta
        const resVenta = await fetch('http://localhost:8080/api/ventas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clienteId: saleData.clienteId,
            usuarioId: currentUser?.id,
            total: saleData.total
          })
        })
        
        if (resVenta.ok) {
          const ventaCreada = await resVenta.json()
          
          // 2. Crear detalles de venta y actualizar existencias de stock en paralelo
          await Promise.all([
            // Guardar detalles
            ...saleData.details.map(d =>
              fetch('http://localhost:8080/api/detalle-ventas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...d, ventaId: ventaCreada.id })
              })
            ),
            // Disminuir existencias de productos
            ...saleData.details.map(async d => {
              if (!d.productoId) return
              const prod = products.find(p => p.id === d.productoId)
              if (prod) {
                const stockNuevo = prod.stock - d.cantidad
                return fetch(`http://localhost:8080/api/productos/${d.productoId}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ ...prod, stock: stockNuevo >= 0 ? stockNuevo : 0 })
                })
              }
            })
          ])

          await loadFromBackend()
          addToast(`Venta #${ventaCreada.id} registrada con éxito.`, 'success')
          return true
        }
      } catch (err) {
        console.error(err)
      }
      addToast('Error al registrar venta en el servidor.', 'error')
      return false
    } else {
      // Registrar Venta Demo Local
      const saleId = sales.length ? Math.max(...sales.map(s => s.id || 0)) + 1 : 1
      const newSale: Sale = {
        id: saleId,
        clienteId: saleData.clienteId,
        usuarioId: currentUser?.id,
        fecha: new Date().toISOString(),
        total: saleData.total
      }
      
      const newDetails: SaleDetail[] = saleData.details.map((d, index) => ({
        id: saleDetails.length + index + 1,
        ventaId: saleId,
        productoId: d.productoId,
        cantidad: d.cantidad,
        precioVenta: d.precioVenta
      }))

      // Restar stock
      const updatedProducts = products.map((p) => {
        const item = saleData.details.find((d) => d.productoId === p.id)
        if (item) {
          const rest = p.stock - item.cantidad
          return { ...p, stock: rest >= 0 ? rest : 0 }
        }
        return p
      })

      const updatedSales = [...sales, newSale]
      const updatedDetails = [...saleDetails, ...newDetails]

      setSales(updatedSales)
      setSaleDetails(updatedDetails)
      setProducts(updatedProducts)

      saveDemoState('ps_sales', updatedSales)
      saveDemoState('ps_sale_details', updatedDetails)
      saveDemoState('ps_products', updatedProducts)

      addToast(`Factura de Venta #${saleId} generada con éxito.`, 'success')
      return true
    }
  }

  // ==========================================================================
  // OPERACIONES: COMPRAS
  // ==========================================================================
  const handleAddPurchase = async (purchaseData: { proveedorId?: number; total: number; details: Omit<PurchaseDetail, 'id'>[] }): Promise<boolean> => {
    if (connectionMode === 'backend') {
      try {
        // 1. Registrar Compra
        const resCompra = await fetch('http://localhost:8080/api/compras', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            proveedorId: purchaseData.proveedorId,
            usuarioId: currentUser?.id,
            total: purchaseData.total
          })
        })

        if (resCompra.ok) {
          const compraCreada = await resCompra.json()

          // 2. Registrar detalles de compra y SUMAR stock
          await Promise.all([
            ...purchaseData.details.map(d =>
              fetch('http://localhost:8080/api/detalle-compras', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...d, compraId: compraCreada.id })
              })
            ),
            ...purchaseData.details.map(async d => {
              if (!d.productoId) return
              const prod = products.find(p => p.id === d.productoId)
              if (prod) {
                const stockNuevo = prod.stock + d.cantidad
                return fetch(`http://localhost:8080/api/productos/${d.productoId}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ ...prod, stock: stockNuevo })
                })
              }
            })
          ])

          await loadFromBackend()
          addToast(`Compra #${compraCreada.id} registrada e ingresada al almacén.`, 'success')
          return true
        }
      } catch (err) {
        console.error(err)
      }
      addToast('Error al registrar la compra en el servidor.', 'error')
      return false
    } else {
      // Registrar Compra Demo Local
      const compId = purchases.length ? Math.max(...purchases.map(c => c.id || 0)) + 1 : 1
      const newPurchase: Purchase = {
        id: compId,
        proveedorId: purchaseData.proveedorId,
        usuarioId: currentUser?.id,
        fecha: new Date().toISOString(),
        total: purchaseData.total
      }

      const newDetails: PurchaseDetail[] = purchaseData.details.map((d, index) => ({
        id: purchaseDetails.length + index + 1,
        compraId: compId,
        productoId: d.productoId,
        cantidad: d.cantidad,
        precioCompra: d.precioCompra
      }))

      // Sumar stock
      const updatedProducts = products.map((p) => {
        const item = purchaseData.details.find((d) => d.productoId === p.id)
        if (item) {
          return { ...p, stock: p.stock + item.cantidad }
        }
        return p
      })

      const updatedPurchases = [...purchases, newPurchase]
      const updatedDetails = [...purchaseDetails, ...newDetails]

      setPurchases(updatedPurchases)
      setPurchaseDetails(updatedDetails)
      setProducts(updatedProducts)

      saveDemoState('ps_purchases', updatedPurchases)
      saveDemoState('ps_purchase_details', updatedDetails)
      saveDemoState('ps_products', updatedProducts)

      addToast(`Compra #${compId} cargada con éxito. Stock incrementado.`, 'success')
      return true
    }
  }

  // ==========================================================================
  // OPERACIONES CRUD: CLIENTES, PROVEEDORES, CATEGORIAS, USUARIOS
  // ==========================================================================
  const executeGenericCrud = async (ep: string, action: 'add' | 'edit' | 'remove', id?: number, bodyData?: any, demoKey?: string, listState?: any[], setListState?: any): Promise<boolean> => {
    if (connectionMode === 'backend') {
      try {
        let res
        if (action === 'add') {
          res = await fetch(`http://localhost:8080/api/${ep}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bodyData)
          })
        } else if (action === 'edit') {
          res = await fetch(`http://localhost:8080/api/${ep}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bodyData)
          })
        } else {
          res = await fetch(`http://localhost:8080/api/${ep}/${id}`, { method: 'DELETE' })
        }
        if (res.ok) {
          await loadFromBackend()
          addToast(`Operación en ${ep} realizada.`, 'success')
          return true
        }
      } catch (err) {
        console.error(err)
      }
      addToast(`Error en la operación del servidor para ${ep}.`, 'error')
      return false
    } else {
      // Local
      let updatedList = [...(listState || [])]
      if (action === 'add') {
        const newId = updatedList.length ? Math.max(...updatedList.map(i => i.id || 0)) + 1 : 1
        updatedList.push({ ...bodyData, id: newId })
      } else if (action === 'edit') {
        updatedList = updatedList.map((item) => (item.id === id ? { ...item, ...bodyData } : item))
      } else {
        updatedList = updatedList.filter((item) => item.id !== id)
      }
      setListState(updatedList)
      if (demoKey) saveDemoState(demoKey, updatedList)
      addToast('Cambios guardados localmente.', 'success')
      return true
    }
  }

  // Wrappers
  const handleAddClient = (c: Client) => executeGenericCrud('clientes', 'add', undefined, c, 'ps_clients', clients, setClients)
  const handleEditClient = (id: number, c: Client) => executeGenericCrud('clientes', 'edit', id, c, 'ps_clients', clients, setClients)
  const handleRemoveClient = (id: number) => executeGenericCrud('clientes', 'remove', id, undefined, 'ps_clients', clients, setClients)

  const handleAddSupplier = (s: Supplier) => executeGenericCrud('proveedores', 'add', undefined, s, 'ps_suppliers', suppliers, setSuppliers)
  const handleEditSupplier = (id: number, s: Supplier) => executeGenericCrud('proveedores', 'edit', id, s, 'ps_suppliers', suppliers, setSuppliers)
  const handleRemoveSupplier = (id: number) => executeGenericCrud('proveedores', 'remove', id, undefined, 'ps_suppliers', suppliers, setSuppliers)

  const handleAddCategory = (c: Category) => executeGenericCrud('categorias', 'add', undefined, c, 'ps_categories', categories, setCategories)
  const handleEditCategory = (id: number, c: Category) => executeGenericCrud('categorias', 'edit', id, c, 'ps_categories', categories, setCategories)
  const handleRemoveCategory = (id: number) => executeGenericCrud('categorias', 'remove', id, undefined, 'ps_categories', categories, setCategories)

  const handleAddUser = (u: SystemUser) => executeGenericCrud('usuarios', 'add', undefined, u, 'ps_users', users, setUsers)
  const handleEditUser = (id: number, u: SystemUser) => executeGenericCrud('usuarios', 'edit', id, u, 'ps_users', users, setUsers)
  const handleRemoveUser = (id: number) => executeGenericCrud('usuarios', 'remove', id, undefined, 'ps_users', users, setUsers)


  // Si no ha iniciado sesión, mostrar la pantalla de Login
  if (!currentUser) {
    return <Login onLoginSuccess={handleLoginSuccess} />
  }

  return (
    <div className="app-layout">
      {/* 1. BARRA LATERAL (SIDEBAR) */}
      <aside className={`sidebar ${isMobileSidebarOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <svg
            viewBox="0 0 24 24"
            width="32"
            height="32"
            stroke="url(#sidebarIconGrad)"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <defs>
              <linearGradient id="sidebarIconGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#4f46e5" />
              </linearGradient>
            </defs>
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
          <span className="sidebar-brand">Papelsoft</span>
        </div>

        <ul className="sidebar-menu">
          <li className={`sidebar-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => { setActiveTab('dashboard'); setIsMobileSidebarOpen(false); }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="3" width="7" height="9" rx="1" /><rect x="14" y="3" width="7" height="5" rx="1" /><rect x="14" y="12" width="7" height="9" rx="1" /><rect x="3" y="16" width="7" height="5" rx="1" /></svg>
            Tablero Principal
          </li>
          <li className={`sidebar-item ${activeTab === 'inventory' ? 'active' : ''}`} onClick={() => { setActiveTab('inventory'); setIsMobileSidebarOpen(false); }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg>
            Inventario
          </li>
          <li className={`sidebar-item ${activeTab === 'sales' ? 'active' : ''}`} onClick={() => { setActiveTab('sales'); setIsMobileSidebarOpen(false); }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" /></svg>
            Punto de Ventas
          </li>
          <li className={`sidebar-item ${activeTab === 'purchases' ? 'active' : ''}`} onClick={() => { setActiveTab('purchases'); setIsMobileSidebarOpen(false); }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
            Compras e Ingresos
          </li>
          <li className={`sidebar-item ${activeTab === 'contacts' ? 'active' : ''}`} onClick={() => { setActiveTab('contacts'); setIsMobileSidebarOpen(false); }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
            Clientes y Proveedores
          </li>
          <li className={`sidebar-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => { setActiveTab('settings'); setIsMobileSidebarOpen(false); }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
            Configuración
          </li>
        </ul>

        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="user-avatar">
              {currentUser.nombre.charAt(0).toUpperCase()}
            </div>
            <div className="user-info">
              <span className="user-name">{currentUser.nombre}</span>
              <span className="user-role">{currentUser.rol}</span>
            </div>
          </div>
          
          <button className="btn btn-secondary btn-sm" style={{ width: '100%', display: 'flex', gap: '6px' }} onClick={handleLogout}>
            <span>🚪</span> Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* 2. ÁREA PRINCIPAL */}
      <main className="main-content">
        
        {/* ENCABEZADO SUPERIOR */}
        <header className="content-header">
          {/* Botón menú móvil */}
          <button 
            className="btn btn-secondary btn-icon mobile-menu-toggle" 
            style={{ display: 'none', marginRight: '10px' }} 
            onClick={() => setIsMobileSidebarOpen(true)}
          >
            ☰
          </button>
          
          <div className="page-title">
            <h1>
              {activeTab === 'dashboard' && 'Tablero Principal'}
              {activeTab === 'inventory' && 'Control de Inventario'}
              {activeTab === 'sales' && 'Módulo de Ventas'}
              {activeTab === 'purchases' && 'Compras y Abastecimiento'}
              {activeTab === 'contacts' && 'Clientes y Proveedores'}
              {activeTab === 'settings' && 'Panel de Control'}
            </h1>
            <p>
              {activeTab === 'dashboard' && 'Resumen financiero, stock crítico y actividades recientes.'}
              {activeTab === 'inventory' && 'Administración de catálogo, stock físico y códigos de barras.'}
              {activeTab === 'sales' && 'Punto de facturación al cliente y consulta de folios históricos.'}
              {activeTab === 'purchases' && 'Abastecimiento del almacén e ingresos de mercancías.'}
              {activeTab === 'contacts' && 'Directorio de relaciones comerciales de la empresa.'}
              {activeTab === 'settings' && 'Gestión de categorías de productos, cuentas de usuario y auditoría.'}
            </p>
          </div>

          <div className="header-actions">
            {/* Toggler de Dark Mode */}
            <button className="btn btn-secondary btn-icon" style={{ borderRadius: '50%', width: '42px', height: '42px', display: 'grid', placeItems: 'center', fontSize: '1.25rem' }} onClick={toggleDarkMode} title="Cambiar Tema">
              {isDarkMode ? '☀️' : '🌙'}
            </button>

            {/* Estado de la Base de Datos */}
            <div className="connection-status">
              <span className={`status-dot ${connectionMode === 'backend' ? 'online' : 'offline'}`} />
              <span>{connectionMode === 'backend' ? 'MySQL' : 'Demo Local'}</span>
            </div>
          </div>
        </header>

        {/* CONTENIDO DE MÓDULO SELECCIONADO */}
        <section className="module-viewport">
          {activeTab === 'dashboard' && (
            <DashboardHome
              products={products}
              sales={sales}
              clients={clients}
              onNavigate={setActiveTab}
            />
          )}

          {activeTab === 'inventory' && (
            <Inventory
              products={products}
              categories={categories}
              onAddProduct={handleAddProduct}
              onEditProduct={handleEditProduct}
              onRemoveProduct={handleRemoveProduct}
            />
          )}

          {activeTab === 'sales' && (
            <Sales
              sales={sales}
              saleDetails={saleDetails}
              products={products}
              clients={clients}
              onAddSale={handleAddSale}
            />
          )}

          {activeTab === 'purchases' && (
            <Purchases
              purchases={purchases}
              purchaseDetails={purchaseDetails}
              products={products}
              suppliers={suppliers}
              onAddPurchase={handleAddPurchase}
            />
          )}

          {activeTab === 'contacts' && (
            <Contacts
              clients={clients}
              suppliers={suppliers}
              onAddClient={handleAddClient}
              onEditClient={handleEditClient}
              onRemoveClient={handleRemoveClient}
              onAddSupplier={handleAddSupplier}
              onEditSupplier={handleEditSupplier}
              onRemoveSupplier={handleRemoveSupplier}
            />
          )}

          {activeTab === 'settings' && (
            <Settings
              categories={categories}
              users={users}
              connectionMode={connectionMode}
              currentUserRole={currentUser.rol}
              onAddCategory={handleAddCategory}
              onEditCategory={handleEditCategory}
              onRemoveCategory={handleRemoveCategory}
              onAddUser={handleAddUser}
              onEditUser={handleEditUser}
              onRemoveUser={handleRemoveUser}
              onResetDemoData={handleResetDemoData}
            />
          )}
        </section>
      </main>

      {/* TOAST SYSTEM POPUPS */}
      <div className="toast-container">
        {toasts.map((t) => (
          <div key={t.id} className={`toast ${t.type}`}>
            <span style={{ fontSize: '1.2rem' }}>
              {t.type === 'success' && '✓'}
              {t.type === 'error' && '✕'}
              {t.type === 'warning' && '⚠'}
            </span>
            <span className="toast-message">{t.message}</span>
          </div>
        ))}
      </div>

      {/* Sombras y cierres móviles */}
      {isMobileSidebarOpen && (
        <div 
          onClick={() => setIsMobileSidebarOpen(false)} 
          style={{ position: 'fixed', top:0, left:0, right:0, bottom:0, background: 'rgba(0,0,0,0.3)', zIndex: 90 }}
        />
      )}
      
      {/* Estilos inline para mobile-toggle */}
      <style>{`
        @media (max-width: 768px) {
          .mobile-menu-toggle {
            display: grid !important;
            place-items: center;
            width: 42px;
            height: 42px;
            font-size: 1.3rem;
            border-radius: var(--radius-sm);
          }
        }
      `}</style>
    </div>
  )
}

export default App