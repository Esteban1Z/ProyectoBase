# CAMBIOS - Backend Java

Se creo la carpeta `backend/` con un servidor en **Java Spring Boot** que se conecta a MySQL y expone direcciones web (REST API) para que el frontend guarde y lea datos de la base de datos.

## Archivos creados (3 archivos)

```
backend/
├── pom.xml                           ← Dependencias del proyecto
└── src/main/
    ├── java/com/papelsoft/App.java   ← TODO el codigo Java aqui
    └── resources/application.properties  ← Conexion a MySQL
```

**App.java** contiene todo: las 9 entidades (modelos), y todos los endpoints (controladores). No hay separacion por carpetas complicadas.

## Que necesitas instalar

1. **Java 17** → https://adoptium.net/ (descargar e instalar, todo siguiente)
2. **Maven** → https://maven.apache.org/download.cgi (bajar el zip, extraer en C:/, agregar la carpeta `bin` al PATH)
3. **MySQL** → XAMPP https://www.apachefriends.org/ (instalar, abrir panel, prender MySQL)

## Como ejecutar

1. Prende MySQL (XAMPP → Start MySQL)
2. Abre terminal y crea la base de datos:
   ```
   mysql -u root < BD/4_21_2026.sql
   ```
3. Ve a la carpeta backend:
   ```
   cd C:\CodigoSENA\ProyectoBase\backend
   ```
4. Ejecuta:
   ```
   mvn spring-boot:run
   ```
5. Abre en tu navegador: `http://localhost:8080/api/productos`

Si ves `[]` (un corchete vacio), funciona. No hay productos aun.

## Direcciones web disponibles

Cada modulo tiene 5 operaciones: Listar, Ver 1, Crear, Actualizar, Eliminar.

### Productos
- `GET /api/productos` → lista todos
- `GET /api/productos/1` → muestra el producto con id 1
- `POST /api/productos` → crea uno nuevo (enviar JSON en el body)
- `PUT /api/productos/1` → actualiza el producto id 1
- `DELETE /api/productos/1` → elimina el producto id 1
- `GET /api/productos/categoria/2` → productos de categoria 2

### Usuarios
- `GET /api/usuarios`
- `GET /api/usuarios/1`
- `POST /api/usuarios`
- `PUT /api/usuarios/1`
- `DELETE /api/usuarios/1`
- `POST /api/usuarios/login` → inicia sesion (enviar `{"email":"...","password":"..."}`)

### Categorias, Proveedores, Clientes
- `GET /api/categorias`, `/api/proveedores`, `/api/clientes`
- Mas GET/POST/PUT/DELETE igual que arriba

### Compras y Ventas
- `GET /api/compras`, `/api/ventas`
- Mas GET/POST/PUT/DELETE igual que arriba

### Detalle de Compras
- `GET /api/detalle-compras`
- `GET /api/detalle-compras/1`
- `POST /api/detalle-compras`
- `PUT /api/detalle-compras/1`
- `DELETE /api/detalle-compras/1`
- `GET /api/detalle-compras/compra/1` → detalles de la compra id 1

### Detalle de Ventas
- `GET /api/detalle-ventas`
- `GET /api/detalle-ventas/1`
- `POST /api/detalle-ventas`
- `PUT /api/detalle-ventas/1`
- `DELETE /api/detalle-ventas/1`
- `GET /api/detalle-ventas/venta/1` → detalles de la venta id 1

## Ejemplo para usar desde el frontend (React)

### Traer productos
```tsx
useEffect(() => {
  fetch('http://localhost:8080/api/productos')
    .then(res => res.json())
    .then(data => {
      setItems(data.map(p => ({
        id: p.id,
        name: p.nombre,
        quantity: p.stock
      })))
    })
}, [])
```

### Iniciar sesion
```tsx
const res = await fetch('http://localhost:8080/api/usuarios/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'admin@mail.com', password: '123456' })
})
const data = await res.json()
if (data.id) {
  alert('Bienvenido ' + data.nombre)
} else {
  alert(data.error)
}
```

### Crear producto
```tsx
await fetch('http://localhost:8080/api/productos', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    nombre: 'Cuaderno',
    descripcion: 'Cuaderno cuadriculado',
    precio: 3500,
    stock: 50,
    categoriaId: 1
  })
})
```

## Explicacion del codigo (para que entiendas)

**App.java** tiene 3 partes:

1. **Modelos** (lineas 20-100 aprox) → Clases con @Entity que representan las tablas de MySQL. Cada campo publico es una columna de la tabla. Ej: `Producto` tiene `id`, `nombre`, `precio`, `stock`, etc.

2. **Endpoints** (lineas 100 en adelante) → Metodos con @GetMapping, @PostMapping, etc. Cada metodo se activa cuando alguien visita una URL.
   - `@GetMapping` → cuando alguien visita la URL con GET
   - `@PostMapping` → cuando alguien envia datos con POST
   - `@PutMapping` → cuando alguien actualiza con PUT
   - `@DeleteMapping` → cuando alguien elimina con DELETE

3. **EntityManager (em)** → Es el que habla con MySQL. `em.find()` busca algo, `em.persist()` guarda, `em.remove()` elimina, `em.createQuery()` hace consultas.

El codigo es repetitivo a proposito: cada entidad tiene los mismos 5 metodos (listar, obtener, crear, actualizar, eliminar). Asi es facil de entender y modificar.

## Resumen

```
Frontend (React)  ──fetch──>  http://localhost:8080/api/productos  ──>  MySQL
                                  ↑
                            App.java (todo ahi)
```

Pasos: 1) Prender MySQL, 2) Ejecutar `mvn spring-boot:run`, 3) El frontend llama a `http://localhost:8080/api/...`
