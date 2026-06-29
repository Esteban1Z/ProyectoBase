import { useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'

type Item = {
  id: number
  name: string
  quantity: number
}

function Inventory() {
  const [items, setItems] = useState<Item[]>([
    { id: 1, name: 'Cuadernos', quantity: 24 },
    { id: 2, name: 'Lapiceros', quantity: 120 },
    { id: 3, name: 'Papelería ABC', quantity: 8 }
  ])
  const [name, setName] = useState('')
  const [quantity, setQuantity] = useState(1)

  const handleAdd = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmedName = name.trim()
    if (!trimmedName) return

    setItems((current) => [
      ...current,
      {
        id: current.length ? current[current.length - 1].id + 1 : 1,
        name: trimmedName,
        quantity: quantity > 0 ? quantity : 1
      }
    ])
    setName('')
    setQuantity(1)
  }

  const handleRemove = (id: number) => {
    setItems((current) => current.filter((item) => item.id !== id))
  }

  const handleQuantityChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = Number(event.target.value)
    setQuantity(value >= 0 ? value : 0)
  }

  return (
    <section className="card-panel inventory-panel">
      <div className="inventory-header">
        <div>
          <h2>Inventario</h2>
          <p>Administra productos, revisa existencias y agrega nuevos artículos al stock.</p>
        </div>
      </div>

      <form className="inventory-form" onSubmit={handleAdd}>
        <div className="input-group">
          <label htmlFor="productName">Nombre del producto</label>
          <input
            id="productName"
            type="text"
            placeholder="Nuevo artículo"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
        </div>

        <div className="input-group">
          <label htmlFor="productQuantity">Cantidad</label>
          <input
            id="productQuantity"
            type="number"
            min="1"
            value={quantity}
            onChange={handleQuantityChange}
            required
          />
        </div>

        <button type="submit" className="primary-button primary-action">
          Agregar producto
        </button>
      </form>

      <div className="inventory-table-wrapper">
        <table className="inventory-table">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Cantidad</th>
              <th>Estado</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>{item.quantity}</td>
                <td>
                  <span className={`tag ${item.quantity > 10 ? 'in-stock' : 'low-stock'}`}>
                    {item.quantity > 10 ? 'Disponible' : 'Bajo stock'}
                  </span>
                </td>
                <td>
                  <button
                    type="button"
                    className="remove-button"
                    onClick={() => handleRemove(item.id)}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default Inventory
