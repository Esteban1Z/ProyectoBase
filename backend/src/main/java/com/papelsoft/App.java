// Paquete principal de la aplicacion
package com.papelsoft;

// Importaciones de Spring Boot y JPA
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.math.BigDecimal;
import java.util.*;

// Clase principal - Backend de Papelsoft (API REST)
@SpringBootApplication
@RestController
@RequestMapping("/api")
@Transactional
public class App {

    // Manejador de entidades JPA para base de datos
    @Autowired
    private EntityManager em;

    // Punto de entrada de la aplicacion
    public static void main(String[] args) {
        SpringApplication.run(App.class, args);
    }

    // Entidad: Usuarios del sistema
    @Entity @Table(name = "usuarios")
    public static class Usuario {
        @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
        public Integer id;
        public String nombre, email, password, rol;
        @Column(name = "created_at")
        public LocalDateTime createdAt;
    }

    // Entidad: Categorias de productos
    @Entity @Table(name = "categorias")
    public static class Categoria {
        @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
        public Integer id;
        public String nombre, descripcion;
    }

    // Entidad: Productos del inventario
    @Entity @Table(name = "productos")
    public static class Producto {
        @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
        public Integer id;
        public String nombre, descripcion;
        public BigDecimal precio;
        public Integer stock;
        @Column(name = "categoria_id")
        public Integer categoriaId;
        @Column(name = "codigo_barras")
        public String codigoBarras;
        @Column(name = "created_at")
        public LocalDateTime createdAt;
    }

    // Entidad: Proveedores
    @Entity @Table(name = "proveedores")
    public static class Proveedor {
        @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
        public Integer id;
        public String nombre, telefono, email, direccion;
    }

    // Entidad: Compras a proveedores
    @Entity @Table(name = "compras")
    public static class Compra {
        @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
        public Integer id;
        @Column(name = "proveedor_id")
        public Integer proveedorId;
        @Column(name = "usuario_id")
        public Integer usuarioId;
        public LocalDateTime fecha;
        public BigDecimal total;
    }

    // Entidad: Detalle de cada compra
    @Entity @Table(name = "detalle_compras")
    public static class DetalleCompra {
        @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
        public Integer id;
        @Column(name = "compra_id")
        public Integer compraId;
        @Column(name = "producto_id")
        public Integer productoId;
        public Integer cantidad;
        @Column(name = "precio_compra")
        public BigDecimal precioCompra;
    }

    // Entidad: Clientes
    @Entity @Table(name = "clientes")
    public static class Cliente {
        @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
        public Integer id;
        public String nombre, telefono, email;
    }

    // Entidad: Ventas realizadas
    @Entity @Table(name = "ventas")
    public static class Venta {
        @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
        public Integer id;
        @Column(name = "cliente_id")
        public Integer clienteId;
        @Column(name = "usuario_id")
        public Integer usuarioId;
        public LocalDateTime fecha;
        public BigDecimal total;
    }

    // Entidad: Detalle de cada venta
    @Entity @Table(name = "detalle_ventas")
    public static class DetalleVenta {
        @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
        public Integer id;
        @Column(name = "venta_id")
        public Integer ventaId;
        @Column(name = "producto_id")
        public Integer productoId;
        public Integer cantidad;
        @Column(name = "precio_venta")
        public BigDecimal precioVenta;
    }

    // CRUD: Listar todos los productos
    @GetMapping("/productos")
    public List listarProductos() {
        return em.createQuery("from Producto").getResultList();
    }

    // CRUD: Obtener un producto por ID
    @GetMapping("/productos/{id}")
    public Object obtenerProducto(@PathVariable Integer id) {
        return em.find(Producto.class, id);
    }

    // CRUD: Crear un nuevo producto
    @PostMapping("/productos")
    public Object crearProducto(@RequestBody Producto p) {
        p.createdAt = LocalDateTime.now();
        em.persist(p);
        return p;
    }

    // CRUD: Actualizar un producto existente
    @PutMapping("/productos/{id}")
    public Object actualizarProducto(@PathVariable Integer id, @RequestBody Producto p) {
        Producto e = em.find(Producto.class, id);
        if (e == null) return null;
        e.nombre = p.nombre;
        e.descripcion = p.descripcion;
        e.precio = p.precio;
        e.stock = p.stock;
        e.categoriaId = p.categoriaId;
        e.codigoBarras = p.codigoBarras;
        return e;
    }

    // CRUD: Eliminar un producto
    @DeleteMapping("/productos/{id}")
    public void eliminarProducto(@PathVariable Integer id) {
        Producto e = em.find(Producto.class, id);
        if (e != null) em.remove(e);
    }

    // Buscar productos por categoria
    @GetMapping("/productos/categoria/{categoriaId}")
    public List buscarProductosPorCategoria(@PathVariable Integer categoriaId) {
        return em.createQuery("from Producto where categoriaId = :c")
                .setParameter("c", categoriaId)
                .getResultList();
    }

    // CRUD: Listar todos los usuarios
    @GetMapping("/usuarios")
    public List listarUsuarios() {
        return em.createQuery("from Usuario").getResultList();
    }

    // CRUD: Obtener un usuario por ID
    @GetMapping("/usuarios/{id}")
    public Object obtenerUsuario(@PathVariable Integer id) {
        return em.find(Usuario.class, id);
    }

    // CRUD: Crear un nuevo usuario
    @PostMapping("/usuarios")
    public Object crearUsuario(@RequestBody Usuario u) {
        u.createdAt = LocalDateTime.now();
        em.persist(u);
        return u;
    }

    // CRUD: Actualizar un usuario existente
    @PutMapping("/usuarios/{id}")
    public Object actualizarUsuario(@PathVariable Integer id, @RequestBody Usuario u) {
        Usuario e = em.find(Usuario.class, id);
        if (e == null) return null;
        e.nombre = u.nombre;
        e.email = u.email;
        e.password = u.password;
        e.rol = u.rol;
        return e;
    }

    // CRUD: Eliminar un usuario
    @DeleteMapping("/usuarios/{id}")
    public void eliminarUsuario(@PathVariable Integer id) {
        Usuario e = em.find(Usuario.class, id);
        if (e != null) em.remove(e);
    }

    // Login: autenticar usuario por email y password
    @PostMapping("/usuarios/login")
    public Map login(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String password = body.get("password");
        List<Usuario> list = em.createQuery("from Usuario where email = :e", Usuario.class)
                .setParameter("e", email)
                .getResultList();
        if (!list.isEmpty() && list.get(0).password.equals(password)) {
            Usuario u = list.get(0);
            return Map.of("id", u.id, "nombre", u.nombre, "email", u.email, "rol", u.rol);
        }
        return Map.of("error", "Credenciales invalidas");
    }

    // CRUD: Listar todas las categorias
    @GetMapping("/categorias")
    public List listarCategorias() {
        return em.createQuery("from Categoria").getResultList();
    }

    // CRUD: Obtener una categoria por ID
    @GetMapping("/categorias/{id}")
    public Object obtenerCategoria(@PathVariable Integer id) {
        return em.find(Categoria.class, id);
    }

    // CRUD: Crear una nueva categoria
    @PostMapping("/categorias")
    public Object crearCategoria(@RequestBody Categoria c) {
        em.persist(c);
        return c;
    }

    // CRUD: Actualizar una categoria existente
    @PutMapping("/categorias/{id}")
    public Object actualizarCategoria(@PathVariable Integer id, @RequestBody Categoria c) {
        Categoria e = em.find(Categoria.class, id);
        if (e == null) return null;
        e.nombre = c.nombre;
        e.descripcion = c.descripcion;
        return e;
    }

    // CRUD: Eliminar una categoria
    @DeleteMapping("/categorias/{id}")
    public void eliminarCategoria(@PathVariable Integer id) {
        Categoria e = em.find(Categoria.class, id);
        if (e != null) em.remove(e);
    }

    // CRUD: Listar todos los proveedores
    @GetMapping("/proveedores")
    public List listarProveedores() {
        return em.createQuery("from Proveedor").getResultList();
    }

    // CRUD: Obtener un proveedor por ID
    @GetMapping("/proveedores/{id}")
    public Object obtenerProveedor(@PathVariable Integer id) {
        return em.find(Proveedor.class, id);
    }

    // CRUD: Crear un nuevo proveedor
    @PostMapping("/proveedores")
    public Object crearProveedor(@RequestBody Proveedor p) {
        em.persist(p);
        return p;
    }

    // CRUD: Actualizar un proveedor existente
    @PutMapping("/proveedores/{id}")
    public Object actualizarProveedor(@PathVariable Integer id, @RequestBody Proveedor p) {
        Proveedor e = em.find(Proveedor.class, id);
        if (e == null) return null;
        e.nombre = p.nombre;
        e.telefono = p.telefono;
        e.email = p.email;
        e.direccion = p.direccion;
        return e;
    }

    // CRUD: Eliminar un proveedor
    @DeleteMapping("/proveedores/{id}")
    public void eliminarProveedor(@PathVariable Integer id) {
        Proveedor e = em.find(Proveedor.class, id);
        if (e != null) em.remove(e);
    }

    // CRUD: Listar todos los clientes
    @GetMapping("/clientes")
    public List listarClientes() {
        return em.createQuery("from Cliente").getResultList();
    }

    // CRUD: Obtener un cliente por ID
    @GetMapping("/clientes/{id}")
    public Object obtenerCliente(@PathVariable Integer id) {
        return em.find(Cliente.class, id);
    }

    // CRUD: Crear un nuevo cliente
    @PostMapping("/clientes")
    public Object crearCliente(@RequestBody Cliente c) {
        em.persist(c);
        return c;
    }

    // CRUD: Actualizar un cliente existente
    @PutMapping("/clientes/{id}")
    public Object actualizarCliente(@PathVariable Integer id, @RequestBody Cliente c) {
        Cliente e = em.find(Cliente.class, id);
        if (e == null) return null;
        e.nombre = c.nombre;
        e.telefono = c.telefono;
        e.email = c.email;
        return e;
    }

    // CRUD: Eliminar un cliente
    @DeleteMapping("/clientes/{id}")
    public void eliminarCliente(@PathVariable Integer id) {
        Cliente e = em.find(Cliente.class, id);
        if (e != null) em.remove(e);
    }

    // CRUD: Listar todas las compras
    @GetMapping("/compras")
    public List listarCompras() {
        return em.createQuery("from Compra").getResultList();
    }

    // CRUD: Obtener una compra por ID
    @GetMapping("/compras/{id}")
    public Object obtenerCompra(@PathVariable Integer id) {
        return em.find(Compra.class, id);
    }

    // CRUD: Crear una nueva compra
    @PostMapping("/compras")
    public Object crearCompra(@RequestBody Compra c) {
        c.fecha = LocalDateTime.now();
        em.persist(c);
        return c;
    }

    // CRUD: Actualizar una compra existente
    @PutMapping("/compras/{id}")
    public Object actualizarCompra(@PathVariable Integer id, @RequestBody Compra c) {
        Compra e = em.find(Compra.class, id);
        if (e == null) return null;
        e.proveedorId = c.proveedorId;
        e.usuarioId = c.usuarioId;
        e.total = c.total;
        return e;
    }

    // CRUD: Eliminar una compra
    @DeleteMapping("/compras/{id}")
    public void eliminarCompra(@PathVariable Integer id) {
        Compra e = em.find(Compra.class, id);
        if (e != null) em.remove(e);
    }

    // CRUD: Listar todos los detalles de compras
    @GetMapping("/detalle-compras")
    public List listarDetalleCompras() {
        return em.createQuery("from DetalleCompra").getResultList();
    }

    // CRUD: Obtener un detalle de compra por ID
    @GetMapping("/detalle-compras/{id}")
    public Object obtenerDetalleCompra(@PathVariable Integer id) {
        return em.find(DetalleCompra.class, id);
    }

    // CRUD: Crear un nuevo detalle de compra
    @PostMapping("/detalle-compras")
    public Object crearDetalleCompra(@RequestBody DetalleCompra d) {
        em.persist(d);
        return d;
    }

    // CRUD: Actualizar un detalle de compra existente
    @PutMapping("/detalle-compras/{id}")
    public Object actualizarDetalleCompra(@PathVariable Integer id, @RequestBody DetalleCompra d) {
        DetalleCompra e = em.find(DetalleCompra.class, id);
        if (e == null) return null;
        e.compraId = d.compraId;
        e.productoId = d.productoId;
        e.cantidad = d.cantidad;
        e.precioCompra = d.precioCompra;
        return e;
    }

    // CRUD: Eliminar un detalle de compra
    @DeleteMapping("/detalle-compras/{id}")
    public void eliminarDetalleCompra(@PathVariable Integer id) {
        DetalleCompra e = em.find(DetalleCompra.class, id);
        if (e != null) em.remove(e);
    }

    // Buscar detalles por compra
    @GetMapping("/detalle-compras/compra/{compraId}")
    public List buscarDetallePorCompra(@PathVariable Integer compraId) {
        return em.createQuery("from DetalleCompra where compraId = :c")
                .setParameter("c", compraId)
                .getResultList();
    }

    // CRUD: Listar todas las ventas
    @GetMapping("/ventas")
    public List listarVentas() {
        return em.createQuery("from Venta").getResultList();
    }

    // CRUD: Obtener una venta por ID
    @GetMapping("/ventas/{id}")
    public Object obtenerVenta(@PathVariable Integer id) {
        return em.find(Venta.class, id);
    }

    // CRUD: Crear una nueva venta
    @PostMapping("/ventas")
    public Object crearVenta(@RequestBody Venta v) {
        v.fecha = LocalDateTime.now();
        em.persist(v);
        return v;
    }

    // CRUD: Actualizar una venta existente
    @PutMapping("/ventas/{id}")
    public Object actualizarVenta(@PathVariable Integer id, @RequestBody Venta v) {
        Venta e = em.find(Venta.class, id);
        if (e == null) return null;
        e.clienteId = v.clienteId;
        e.usuarioId = v.usuarioId;
        e.total = v.total;
        return e;
    }

    // CRUD: Eliminar una venta
    @DeleteMapping("/ventas/{id}")
    public void eliminarVenta(@PathVariable Integer id) {
        Venta e = em.find(Venta.class, id);
        if (e != null) em.remove(e);
    }

    // CRUD: Listar todos los detalles de ventas
    @GetMapping("/detalle-ventas")
    public List listarDetalleVentas() {
        return em.createQuery("from DetalleVenta").getResultList();
    }

    // CRUD: Obtener un detalle de venta por ID
    @GetMapping("/detalle-ventas/{id}")
    public Object obtenerDetalleVenta(@PathVariable Integer id) {
        return em.find(DetalleVenta.class, id);
    }

    // CRUD: Crear un nuevo detalle de venta
    @PostMapping("/detalle-ventas")
    public Object crearDetalleVenta(@RequestBody DetalleVenta d) {
        em.persist(d);
        return d;
    }

    // CRUD: Actualizar un detalle de venta existente
    @PutMapping("/detalle-ventas/{id}")
    public Object actualizarDetalleVenta(@PathVariable Integer id, @RequestBody DetalleVenta d) {
        DetalleVenta e = em.find(DetalleVenta.class, id);
        if (e == null) return null;
        e.ventaId = d.ventaId;
        e.productoId = d.productoId;
        e.cantidad = d.cantidad;
        e.precioVenta = d.precioVenta;
        return e;
    }

    // CRUD: Eliminar un detalle de venta
    @DeleteMapping("/detalle-ventas/{id}")
    public void eliminarDetalleVenta(@PathVariable Integer id) {
        DetalleVenta e = em.find(DetalleVenta.class, id);
        if (e != null) em.remove(e);
    }

    // Buscar detalles por venta
    @GetMapping("/detalle-ventas/venta/{ventaId}")
    public List buscarDetallePorVenta(@PathVariable Integer ventaId) {
        return em.createQuery("from DetalleVenta where ventaId = :v")
                .setParameter("v", ventaId)
                .getResultList();
    }
}
