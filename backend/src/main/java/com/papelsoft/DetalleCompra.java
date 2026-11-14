package com.papelsoft;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;

@Entity
@Table(name = "detalle_compras")
public class DetalleCompra {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Integer id;
    @Column(name = "compra_id")
    public Integer compraId;
    @Column(name = "producto_id")
    public Integer productoId;
    public Integer cantidad;
    @Column(name = "precio_compra")
    public BigDecimal precioCompra;
}
