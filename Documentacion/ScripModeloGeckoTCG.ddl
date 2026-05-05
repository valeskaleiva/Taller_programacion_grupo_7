-- Generado por Oracle SQL Developer Data Modeler 23.1.0.087.0806
--   en:        2026-04-11 02:01:33 CLT
--   sitio:      Oracle Database 21c
--   tipo:      Oracle Database 21c



-- predefined type, no DDL - MDSYS.SDO_GEOMETRY

-- predefined type, no DDL - XMLTYPE

CREATE TABLE detalle_venta (
    id_detalle      NUMBER NOT NULL,
    id_venta        NUMBER NOT NULL,
    id_producto     NUMBER NOT NULL,
    cantidad        NUMBER NOT NULL,
    precio_unitario NUMBER NOT NULL
);

ALTER TABLE detalle_venta ADD CONSTRAINT detale_venta_pk PRIMARY KEY ( id_detalle );

CREATE TABLE producto (
    id_producto   NUMBER NOT NULL,
    codigo_barras VARCHAR2(50) NOT NULL,
    nombre        VARCHAR2(200) NOT NULL,
    descripcion   VARCHAR2(500) NOT NULL,
    stock         NUMBER NOT NULL,
    precio_base   NUMBER NOT NULL,
    categoria     VARCHAR2(30) NOT NULL
);

ALTER TABLE producto ADD CONSTRAINT producto_pk PRIMARY KEY ( id_producto );

CREATE TABLE producto_caja (
    id_producto NUMBER NOT NULL,
    cant_sobres NUMBER
);

ALTER TABLE producto_caja ADD CONSTRAINT producto_caja_pk PRIMARY KEY ( id_producto );

CREATE TABLE producto_carta (
    id_producto    NUMBER NOT NULL,
    rareza         VARCHAR2(50) NOT NULL,
    edicion        VARCHAR2(100) NOT NULL,
    estado         VARCHAR2(20) NOT NULL,
    precio_mercado NUMBER NOT NULL
);

ALTER TABLE producto_carta ADD CONSTRAINT producto_carta_pk PRIMARY KEY ( id_producto );

CREATE TABLE producto_sobre (
    id_producto NUMBER NOT NULL,
    cant_cartas NUMBER NOT NULL,
    serie       VARCHAR2(200) NOT NULL
);

ALTER TABLE producto_sobre ADD CONSTRAINT producto_sobre_pk PRIMARY KEY ( id_producto );

CREATE TABLE reporte (
    id_reporte    NUMBER NOT NULL,
    fecha_reporte DATE NOT NULL,
    tipo_reporte  VARCHAR2(50) NOT NULL,
    id_usuario    NUMBER NOT NULL
);

ALTER TABLE reporte ADD CONSTRAINT reporte_pk PRIMARY KEY ( id_reporte );

CREATE TABLE usuario (
    id_usuario NUMBER NOT NULL,
    rut        VARCHAR2(13) NOT NULL,
    p_nombre   VARCHAR2(100) NOT NULL,
    s_nombre   VARCHAR2(100) NOT NULL,
    a_paterno  VARCHAR2(100) NOT NULL,
    a_materno  VARCHAR2(100) NOT NULL,
    correo     VARCHAR2(150) NOT NULL,
    contraseña VARCHAR2(250) NOT NULL
);

ALTER TABLE usuario ADD CONSTRAINT usuario_pk PRIMARY KEY ( id_usuario );

CREATE TABLE venta (
    id_venta     NUMBER NOT NULL,
    fecha_venta  DATE NOT NULL,
    total_pagado NUMBER NOT NULL,
    id_usuario   NUMBER NOT NULL
);

ALTER TABLE venta ADD CONSTRAINT venta_pk PRIMARY KEY ( id_venta );

ALTER TABLE detalle_venta
    ADD CONSTRAINT detalle_venta_producto_fk FOREIGN KEY ( id_producto )
        REFERENCES producto ( id_producto );

ALTER TABLE detalle_venta
    ADD CONSTRAINT detalle_venta_venta_fk FOREIGN KEY ( id_venta )
        REFERENCES venta ( id_venta );

ALTER TABLE producto_caja
    ADD CONSTRAINT producto_caja_producto_fk FOREIGN KEY ( id_producto )
        REFERENCES producto ( id_producto );

ALTER TABLE producto_carta
    ADD CONSTRAINT producto_carta_producto_fk FOREIGN KEY ( id_producto )
        REFERENCES producto ( id_producto );

ALTER TABLE producto_sobre
    ADD CONSTRAINT producto_sobre_producto_fk FOREIGN KEY ( id_producto )
        REFERENCES producto ( id_producto );

ALTER TABLE reporte
    ADD CONSTRAINT reporte_usuario_fk FOREIGN KEY ( id_usuario )
        REFERENCES usuario ( id_usuario );

ALTER TABLE venta
    ADD CONSTRAINT venta_usuario_fk FOREIGN KEY ( id_usuario )
        REFERENCES usuario ( id_usuario );



-- Informe de Resumen de Oracle SQL Developer Data Modeler: 
-- 
-- CREATE TABLE                             8
-- CREATE INDEX                             0
-- ALTER TABLE                             15
-- CREATE VIEW                              0
-- ALTER VIEW                               0
-- CREATE PACKAGE                           0
-- CREATE PACKAGE BODY                      0
-- CREATE PROCEDURE                         0
-- CREATE FUNCTION                          0
-- CREATE TRIGGER                           0
-- ALTER TRIGGER                            0
-- CREATE COLLECTION TYPE                   0
-- CREATE STRUCTURED TYPE                   0
-- CREATE STRUCTURED TYPE BODY              0
-- CREATE CLUSTER                           0
-- CREATE CONTEXT                           0
-- CREATE DATABASE                          0
-- CREATE DIMENSION                         0
-- CREATE DIRECTORY                         0
-- CREATE DISK GROUP                        0
-- CREATE ROLE                              0
-- CREATE ROLLBACK SEGMENT                  0
-- CREATE SEQUENCE                          0
-- CREATE MATERIALIZED VIEW                 0
-- CREATE MATERIALIZED VIEW LOG             0
-- CREATE SYNONYM                           0
-- CREATE TABLESPACE                        0
-- CREATE USER                              0
-- 
-- DROP TABLESPACE                          0
-- DROP DATABASE                            0
-- 
-- REDACTION POLICY                         0
-- 
-- ORDS DROP SCHEMA                         0
-- ORDS ENABLE SCHEMA                       0
-- ORDS ENABLE OBJECT                       0
-- 
-- ERRORS                                   0
-- WARNINGS                                 0
