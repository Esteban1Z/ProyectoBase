package com.papelsoft;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "productos")
public class Producto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
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
