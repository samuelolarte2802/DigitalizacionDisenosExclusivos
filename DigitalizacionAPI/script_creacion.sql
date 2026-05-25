CREATE TABLE roles (
    id_rol INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre_rol VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE usuarios (
    id_usuario INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_rol INT,
    nombre VARCHAR(100) NOT NULL,
    credencial_hash VARCHAR(255) NOT NULL,
    FOREIGN KEY (id_rol) REFERENCES roles(id_rol)
);

CREATE TABLE clientes (
    id_cliente INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre_completo VARCHAR(150) NOT NULL,
    alias_cliente VARCHAR(50),
    celular VARCHAR(20),
    fecha_registro DATE DEFAULT CURRENT_DATE
);

CREATE TABLE proveedores (
    id_proveedor INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- o SERIAL
    nombre_empresa VARCHAR(150) NOT NULL,
    alias VARCHAR(100),
    telefono VARCHAR(20),
    insumo_principal VARCHAR(100),
    direccion VARCHAR(200),
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE instituciones (
    id_institucion INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- o SERIAL
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT
);

CREATE TABLE lista_precios (
    id_precio INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- o SERIAL
    id_institucion INT,
    tipo_prenda VARCHAR(100),
    talla VARCHAR(20),
    precio NUMERIC(10,2),
    anio_vigencia INT,
    FOREIGN KEY (id_institucion) REFERENCES instituciones(id_institucion)
);

CREATE TABLE pedidos (
    id_pedido INT GENERATED ALWAYS AS IDENTITY,
    id_cliente INT,
    id_usuario INT,
    fecha_pedido TIMESTAMP NOT NULL,
    total_pagar NUMERIC(10,2) NOT NULL,
    abono NUMERIC(10,2) DEFAULT 0,
    estado VARCHAR(50) NOT NULL,
    estado_pago VARCHAR(50),
    PRIMARY KEY (id_pedido, fecha_pedido, estado),
    FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente),
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
) PARTITION BY LIST (estado);

CREATE TABLE pedidos_activos PARTITION OF pedidos FOR VALUES IN ('En Corte', 'En Costura', 'Terminado') PARTITION BY RANGE (fecha_pedido);
CREATE TABLE pedidos_finalizados PARTITION OF pedidos FOR VALUES IN ('Entregado', 'Cancelado') PARTITION BY RANGE (fecha_pedido);

CREATE TABLE pedidos_activos_2025 PARTITION OF pedidos_activos FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');
CREATE TABLE pedidos_activos_2026 PARTITION OF pedidos_activos FOR VALUES FROM ('2026-01-01') TO ('2027-01-01');

CREATE TABLE pedidos_finalizados_2025 PARTITION OF pedidos_finalizados FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');
CREATE TABLE pedidos_finalizados_2026 PARTITION OF pedidos_finalizados FOR VALUES FROM ('2026-01-01') TO ('2027-01-01');

CREATE TABLE detalle_pedido (
    id_detalle INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_pedido INT NOT NULL,
    fecha_pedido TIMESTAMP NOT NULL,
    estado_pedido VARCHAR(50) NOT NULL,
    id_institucion INT,
    tipo_prenda VARCHAR(100),
    tipo_tela VARCHAR(100),
    talla_general VARCHAR(20),
    medidas_especificas JSONB, 
    nombre_beneficiario VARCHAR(150),
    piezas_incluidas JSONB,    
    talla_cobro VARCHAR(20),
    precio_congelado NUMERIC(10,2),
    FOREIGN KEY (id_institucion) REFERENCES instituciones(id_institucion),
    FOREIGN KEY (id_pedido, fecha_pedido, estado_pedido) REFERENCES pedidos(id_pedido, fecha_pedido, estado)
);

CREATE TABLE auditoria_eliminados (
    id_auditoria INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre_tabla VARCHAR(50) NOT NULL,
    usuario_db VARCHAR(50) NOT NULL,
    fecha_eliminacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    datos_eliminados JSONB NOT NULL
);

CREATE OR REPLACE FUNCTION log_eliminaciones()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO auditoria_eliminados (nombre_tabla, usuario_db, datos_eliminados)
    VALUES (TG_TABLE_NAME, current_user, row_to_json(OLD)::jsonb);
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_auditoria_clientes
BEFORE DELETE ON clientes
FOR EACH ROW EXECUTE FUNCTION log_eliminaciones();

CREATE TRIGGER trg_auditoria_instituciones
BEFORE DELETE ON instituciones
FOR EACH ROW EXECUTE FUNCTION log_eliminaciones();

CREATE OR REPLACE PROCEDURE limpiar_auditoria_antigua(meses INT)
LANGUAGE plpgsql AS $$
BEGIN
    DELETE FROM auditoria_eliminados 
    WHERE fecha_eliminacion < NOW() - (meses || ' months')::interval;
END;
$$;