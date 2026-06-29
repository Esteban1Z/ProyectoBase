package com.papelsoft;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.math.BigDecimal;
import java.util.*;

@SpringBootApplication
@RestController
@RequestMapping("/api")
@Transactional
public class App {

    @Autowired
    private EntityManager em;

    public static void main(String[] args) {
        SpringApplication.run(App.class, args);
    }

    @Entity @Table(name = "usuarios")
    public static class Usuario {
        @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
        public Integer id;
        public String nombre, email, password, rol;
        @Column(name = "created_at")
        public LocalDateTime createdAt;
    }

    @Entity @Table(name = "categorias")
    public static class Categoria {
        @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
        public Integer id;
        public String nombre, descripcion;
    }

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

    @Entity @Table(name = "proveedores")
    public static class Proveedor {
        @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
        public Integer id;
        public String nombre, telefono, email, direccion;
    }

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

    @Entity @Table(name = "clientes")
    public static class Cliente {
        @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
        public Integer id;
        public String nombre, telefono, email;
    }

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

    @GetMapping("/productos")
    public List listarProductos() {
        return em.createQuery("from Producto").getResultList();
    }

    @GetMapping("/productos/{id}")
    public Object obtenerProducto(@PathVariable Integer id) {
        return em.find(Producto.class, id);
    }

    @PostMapping("/productos")
    public Object crearProducto(@RequestBody Producto p) {
        p.createdAt = LocalDateTime.now();
        em.persist(p);
        return p;
    }

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

    @DeleteMapping("/productos/{id}")
    public void eliminarProducto(@PathVariable Integer id) {
        Producto e = em.find(Producto.class, id);
        if (e != null) em.remove(e);
    }

    @GetMapping("/productos/categoria/{categoriaId}")
    public List buscarProductosPorCategoria(@PathVariable Integer categoriaId) {
        return em.createQuery("from Producto where categoriaId = :c")
                .setParameter("c", categoriaId)
                .getResultList();
    }

    @GetMapping("/usuarios")
    public List listarUsuarios() {
        return em.createQuery("from Usuario").getResultList();
    }

    @GetMapping("/usuarios/{id}")
    public Object obtenerUsuario(@PathVariable Integer id) {
        return em.find(Usuario.class, id);
    }

    @PostMapping("/usuarios")
    public Object crearUsuario(@RequestBody Usuario u) {
        u.createdAt = LocalDateTime.now();
        em.persist(u);
        return u;
    }

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

    @DeleteMapping("/usuarios/{id}")
    public void eliminarUsuario(@PathVariable Integer id) {
        Usuario e = em.find(Usuario.class, id);
        if (e != null) em.remove(e);
    }

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

    @GetMapping("/categorias")
    public List listarCategorias() {
        return em.createQuery("from Categoria").getResultList();
    }

    @GetMapping("/categorias/{id}")
    public Object obtenerCategoria(@PathVariable Integer id) {
        return em.find(Categoria.class, id);
    }

    @PostMapping("/categorias")
    public Object crearCategoria(@RequestBody Categoria c) {
        em.persist(c);
        return c;
    }

    @PutMapping("/categorias/{id}")
    public Object actualizarCategoria(@PathVariable Integer id, @RequestBody Categoria c) {
        Categoria e = em.find(Categoria.class, id);
        if (e == null) return null;
        e.nombre = c.nombre;
        e.descripcion = c.descripcion;
        return e;
    }

    @DeleteMapping("/categorias/{id}")
    public void eliminarCategoria(@PathVariable Integer id) {
        Categoria e = em.find(Categoria.class, id);
        if (e != null) em.remove(e);
    }

    @GetMapping("/proveedores")
    public List listarProveedores() {
        return em.createQuery("from Proveedor").getResultList();
    }

    @GetMapping("/proveedores/{id}")
    public Object obtenerProveedor(@PathVariable Integer id) {
        return em.find(Proveedor.class, id);
    }

    @PostMapping("/proveedores")
    public Object crearProveedor(@RequestBody Proveedor p) {
        em.persist(p);
        return p;
    }

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

    @DeleteMapping("/proveedores/{id}")
    public void eliminarProveedor(@PathVariable Integer id) {
        Proveedor e = em.find(Proveedor.class, id);
        if (e != null) em.remove(e);
    }

    @GetMapping("/clientes")
    public List listarClientes() {
        return em.createQuery("from Cliente").getResultList();
    }

    @GetMapping("/clientes/{id}")
    public Object obtenerCliente(@PathVariable Integer id) {
        return em.find(Cliente.class, id);
    }

    @PostMapping("/clientes")
    public Object crearCliente(@RequestBody Cliente c) {
        em.persist(c);
        return c;
    }

    @PutMapping("/clientes/{id}")
    public Object actualizarCliente(@PathVariable Integer id, @RequestBody Cliente c) {
        Cliente e = em.find(Cliente.class, id);
        if (e == null) return null;
        e.nombre = c.nombre;
        e.telefono = c.telefono;
        e.email = c.email;
        return e;
    }

    @DeleteMapping("/clientes/{id}")
    public void eliminarCliente(@PathVariable Integer id) {
        Cliente e = em.find(Cliente.class, id);
        if (e != null) em.remove(e);
    }

    @GetMapping("/compras")
    public List listarCompras() {
        return em.createQuery("from Compra").getResultList();
    }

    @GetMapping("/compras/{id}")
    public Object obtenerCompra(@PathVariable Integer id) {
        return em.find(Compra.class, id);
    }

    @PostMapping("/compras")
    public Object crearCompra(@RequestBody Compra c) {
        c.fecha = LocalDateTime.now();
        em.persist(c);
        return c;
    }

    @PutMapping("/compras/{id}")
    public Object actualizarCompra(@PathVariable Integer id, @RequestBody Compra c) {
        Compra e = em.find(Compra.class, id);
        if (e == null) return null;
        e.proveedorId = c.proveedorId;
        e.usuarioId = c.usuarioId;
        e.total = c.total;
        return e;
    }

    @DeleteMapping("/compras/{id}")
    public void eliminarCompra(@PathVariable Integer id) {
        Compra e = em.find(Compra.class, id);
        if (e != null) em.remove(e);
    }

    @GetMapping("/detalle-compras")
    public List listarDetalleCompras() {
        return em.createQuery("from DetalleCompra").getResultList();
    }

    @GetMapping("/detalle-compras/{id}")
    public Object obtenerDetalleCompra(@PathVariable Integer id) {
        return em.find(DetalleCompra.class, id);
    }

    @PostMapping("/detalle-compras")
    public Object crearDetalleCompra(@RequestBody DetalleCompra d) {
        em.persist(d);
        return d;
    }

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

    @DeleteMapping("/detalle-compras/{id}")
    public void eliminarDetalleCompra(@PathVariable Integer id) {
        DetalleCompra e = em.find(DetalleCompra.class, id);
        if (e != null) em.remove(e);
    }

    @GetMapping("/detalle-compras/compra/{compraId}")
    public List buscarDetallePorCompra(@PathVariable Integer compraId) {
        return em.createQuery("from DetalleCompra where compraId = :c")
                .setParameter("c", compraId)
                .getResultList();
    }

    @GetMapping("/ventas")
    public List listarVentas() {
        return em.createQuery("from Venta").getResultList();
    }

    @GetMapping("/ventas/{id}")
    public Object obtenerVenta(@PathVariable Integer id) {
        return em.find(Venta.class, id);
    }

    @PostMapping("/ventas")
    public Object crearVenta(@RequestBody Venta v) {
        v.fecha = LocalDateTime.now();
        em.persist(v);
        return v;
    }

    @PutMapping("/ventas/{id}")
    public Object actualizarVenta(@PathVariable Integer id, @RequestBody Venta v) {
        Venta e = em.find(Venta.class, id);
        if (e == null) return null;
        e.clienteId = v.clienteId;
        e.usuarioId = v.usuarioId;
        e.total = v.total;
        return e;
    }

    @DeleteMapping("/ventas/{id}")
    public void eliminarVenta(@PathVariable Integer id) {
        Venta e = em.find(Venta.class, id);
        if (e != null) em.remove(e);
    }

    @GetMapping("/detalle-ventas")
    public List listarDetalleVentas() {
        return em.createQuery("from DetalleVenta").getResultList();
    }

    @GetMapping("/detalle-ventas/{id}")
    public Object obtenerDetalleVenta(@PathVariable Integer id) {
        return em.find(DetalleVenta.class, id);
    }

    @PostMapping("/detalle-ventas")
    public Object crearDetalleVenta(@RequestBody DetalleVenta d) {
        em.persist(d);
        return d;
    }

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

    @DeleteMapping("/detalle-ventas/{id}")
    public void eliminarDetalleVenta(@PathVariable Integer id) {
        DetalleVenta e = em.find(DetalleVenta.class, id);
        if (e != null) em.remove(e);
    }

    @GetMapping("/detalle-ventas/venta/{ventaId}")
    public List buscarDetallePorVenta(@PathVariable Integer ventaId) {
        return em.createQuery("from DetalleVenta where ventaId = :v")
                .setParameter("v", ventaId)
                .getResultList();
    }
}
