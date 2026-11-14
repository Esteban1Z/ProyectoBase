// Paquete principal de la aplicacion
package com.papelsoft;

// Importaciones de Spring Boot y JPA
import org.springframework.boot.SpringApplication;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import jakarta.persistence.EntityManager;
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

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    // Punto de entrada de la aplicacion
    public static void main(String[] args) {
        SpringApplication.run(App.class, args);
    }

    @Bean
    public WebMvcConfigurer corsConfigurer(
            @Value("${app.cors.allowed-origin-patterns}") String allowedOrigins) {
        String[] originPatterns = Arrays.stream(allowedOrigins.split(","))
                .map(String::trim)
                .filter(origin -> !origin.isEmpty())
                .toArray(String[]::new);

        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**")
                        .allowedOriginPatterns(originPatterns)
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                        .allowedHeaders("Content-Type", "Authorization");
            }
        };
    }

    @Bean
    public CommandLineRunner seedTestUser(
            PlatformTransactionManager transactionManager,
            @Value("${app.seed.test-user.enabled:false}") boolean enabled,
            @Value("${app.seed.test-user.email:}") String email,
            @Value("${app.seed.test-user.password:}") String password) {
        return args -> {
            if (!enabled) return;
            if (email.isBlank() || password.isBlank()) {
                throw new IllegalStateException(
                        "SEED_TEST_USER_EMAIL y SEED_TEST_USER_PASSWORD son obligatorios cuando SEED_TEST_USER_ENABLED=true");
            }

            new TransactionTemplate(transactionManager).executeWithoutResult(status -> {
                List<Usuario> existingUsers = em.createQuery(
                                "from Usuario where lower(email) = :email", Usuario.class)
                        .setParameter("email", email.toLowerCase(Locale.ROOT))
                        .getResultList();
                if (!existingUsers.isEmpty()) return;

                Usuario user = new Usuario();
                user.nombre = "Usuario de pruebas";
                user.email = email.trim().toLowerCase(Locale.ROOT);
                user.password = passwordEncoder.encode(password);
                user.rol = "admin";
                user.createdAt = LocalDateTime.now();
                em.persist(user);
            });
        };
    }

    @GetMapping("/health")
    public Map<String, String> health() {
        em.createNativeQuery("SELECT 1").getSingleResult();
        return Map.of("status", "UP", "database", "UP");
    }

    private String normalizeRole(String role) {
        if ("admin".equalsIgnoreCase(role) || "administrador".equalsIgnoreCase(role)) return "admin";
        if ("gestor".equalsIgnoreCase(role)) return "gestor";
        if ("vendedor".equalsIgnoreCase(role)) return "vendedor";
        throw new IllegalArgumentException("Rol de usuario no válido");
    }

    private String displayRole(String role) {
        if ("admin".equalsIgnoreCase(role) || "administrador".equalsIgnoreCase(role)) return "Administrador";
        if ("gestor".equalsIgnoreCase(role)) return "Gestor";
        return "Vendedor";
    }

    private Map<String, Object> userResponse(Usuario user) {
        Map<String, Object> response = new HashMap<>();
        response.put("id", user.id);
        response.put("nombre", user.nombre);
        response.put("email", user.email);
        response.put("rol", displayRole(user.rol));
        response.put("createdAt", user.createdAt);
        return response;
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
    public List<Map<String, Object>> listarUsuarios() {
        List<Usuario> users = em.createQuery("from Usuario", Usuario.class).getResultList();
        return users.stream().map(this::userResponse).toList();
    }

    // CRUD: Obtener un usuario por ID
    @GetMapping("/usuarios/{id}")
    public Object obtenerUsuario(@PathVariable Integer id) {
        Usuario user = em.find(Usuario.class, id);
        return user == null ? null : userResponse(user);
    }

    // CRUD: Crear un nuevo usuario
    @PostMapping("/usuarios")
    public Object crearUsuario(@RequestBody Usuario u) {
        u.rol = normalizeRole(u.rol);
        if (u.password == null || u.password.isBlank()) {
            throw new IllegalArgumentException("La contraseña es obligatoria");
        }
        u.password = passwordEncoder.encode(u.password);
        u.createdAt = LocalDateTime.now();
        em.persist(u);
        return userResponse(u);
    }

    // CRUD: Actualizar un usuario existente
    @PutMapping("/usuarios/{id}")
    public Object actualizarUsuario(@PathVariable Integer id, @RequestBody Usuario u) {
        Usuario e = em.find(Usuario.class, id);
        if (e == null) return null;
        e.nombre = u.nombre;
        e.email = u.email;
        e.rol = normalizeRole(u.rol);
        if (u.password != null && !u.password.isBlank()) {
            e.password = passwordEncoder.encode(u.password);
        }
        return userResponse(e);
    }

    // CRUD: Eliminar un usuario
    @DeleteMapping("/usuarios/{id}")
    public void eliminarUsuario(@PathVariable Integer id) {
        Usuario e = em.find(Usuario.class, id);
        if (e != null) em.remove(e);
    }

    // Login: autenticar usuario por email y password
    @PostMapping("/usuarios/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String password = body.get("password");
        if (email == null || password == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Credenciales inválidas"));
        }
        List<Usuario> list = em.createQuery("from Usuario where email = :e", Usuario.class)
                .setParameter("e", email.trim().toLowerCase(Locale.ROOT))
                .getResultList();
        if (!list.isEmpty()) {
            Usuario u = list.get(0);
            boolean encodedPassword = u.password != null && u.password.startsWith("$2");
            boolean passwordMatches = encodedPassword
                    ? passwordEncoder.matches(password, u.password)
                    : Objects.equals(password, u.password);
            if (passwordMatches) {
                if (!encodedPassword) u.password = passwordEncoder.encode(password);
                Map<String, Object> response = userResponse(u);
                response.put("token", jwtService.createToken(u.email, u.rol));
                return ResponseEntity.ok(response);
            }
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("error", "Credenciales inválidas"));
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
