-- BASE DE DATOS COMPLETA PARA SISTEMA ARAS
-- Incluye módulos de Escritorio y Web

-- =============================
-- TABLAS DEL SISTEMA DE ESCRITORIO
-- =============================
CREATE DATABASE db_ARAS
use db_ARAS

CREATE TABLE nivel (
    id_nivel INT IDENTITY(1,1) PRIMARY KEY,
    nombre VARCHAR(20) NOT NULL
);

CREATE TABLE grado (
    id_grado INT IDENTITY(1,1) PRIMARY KEY,
    nombre VARCHAR(10) NOT NULL,
    id_nivel INT NOT NULL,
    CONSTRAINT FK_grado_nivel FOREIGN KEY (id_nivel) REFERENCES nivel(id_nivel)
);

CREATE TABLE seccion (
    id_seccion INT IDENTITY(1,1) PRIMARY KEY,
    letra CHAR(1) NOT NULL
);

CREATE TABLE alumno (
    id_alumno INT IDENTITY(1,1) PRIMARY KEY,
    codigo VARCHAR(10) NOT NULL UNIQUE,
    dni VARCHAR(8) NOT NULL UNIQUE,
    nombres VARCHAR(100) NOT NULL,
    apellido_paterno VARCHAR(100) NOT NULL,
    apellido_materno VARCHAR(100) NOT NULL,
    genero VARCHAR(10) NOT NULL,
    fecha_nacimiento DATE NOT NULL,
    direccion VARCHAR(255) NOT NULL,
    telefono VARCHAR(15) NOT NULL,
    estado VARCHAR(10) NOT NULL,
    foto VARCHAR(255) NULL,
    observaciones TEXT NULL
);

CREATE TABLE apoderado (
    id_apoderado INT IDENTITY(1,1) PRIMARY KEY,
    dni VARCHAR(8) NOT NULL UNIQUE,
    nombres VARCHAR(100) NOT NULL,
    apellido_paterno VARCHAR(100) NOT NULL,
    apellido_materno VARCHAR(100) NOT NULL,
    direccion VARCHAR(255) NOT NULL,
    ocupacion VARCHAR(100) NULL,
    telefono VARCHAR(15) NOT NULL,
    correo VARCHAR(100) NULL,
    tipo_parentesco VARCHAR(10) NOT NULL
);

CREATE TABLE alumno_apoderado (
    id_alumno INT NOT NULL,
    id_apoderado INT NOT NULL,
    es_principal BIT NOT NULL DEFAULT 0,
    PRIMARY KEY (id_alumno, id_apoderado),
    CONSTRAINT FK_alumno_apoderado_alumno FOREIGN KEY (id_alumno) REFERENCES alumno(id_alumno),
    CONSTRAINT FK_alumno_apoderado_apoderado FOREIGN KEY (id_apoderado) REFERENCES apoderado(id_apoderado)
);

CREATE TABLE docente (
    id_docente INT IDENTITY(1,1) PRIMARY KEY,
    codigo VARCHAR(10) NOT NULL UNIQUE,
    dni VARCHAR(8) NOT NULL UNIQUE,
    nombres VARCHAR(100) NOT NULL,
    apellido_paterno VARCHAR(100) NOT NULL,
    apellido_materno VARCHAR(100) NOT NULL,
    genero VARCHAR(10) NOT NULL,
    fecha_nacimiento DATE NOT NULL,
    direccion VARCHAR(255) NOT NULL,
    telefono VARCHAR(15) NOT NULL,
    correo VARCHAR(100) NOT NULL,
    estado VARCHAR(10) NOT NULL,
    foto VARCHAR(255) NULL,
    nivel_academico VARCHAR(50) NOT NULL,
    observaciones TEXT NULL,
    id_nivel INT NOT NULL,
    CONSTRAINT FK_docente_nivel FOREIGN KEY (id_nivel) REFERENCES nivel(id_nivel)
);

CREATE TABLE materia (
    id_materia INT IDENTITY(1,1) PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    id_nivel INT NOT NULL,
    CONSTRAINT FK_materia_nivel FOREIGN KEY (id_nivel) REFERENCES nivel(id_nivel)
);

CREATE TABLE docente_materia (
    id_docente INT NOT NULL,
    id_materia INT NOT NULL,
    PRIMARY KEY (id_docente, id_materia),
    CONSTRAINT FK_docente_materia_docente FOREIGN KEY (id_docente) REFERENCES docente(id_docente),
    CONSTRAINT FK_docente_materia_materia FOREIGN KEY (id_materia) REFERENCES materia(id_materia)
);

CREATE TABLE matricula (
    id_matricula INT IDENTITY(1,1) PRIMARY KEY,
    id_alumno INT NOT NULL,
    id_grado INT NOT NULL,
    id_seccion INT NOT NULL,
    anio_academico INT NOT NULL,
    tipo_matricula VARCHAR(20) NOT NULL,
    fecha_matricula DATE NOT NULL,
    CONSTRAINT FK_matricula_alumno FOREIGN KEY (id_alumno) REFERENCES alumno(id_alumno),
    CONSTRAINT FK_matricula_grado FOREIGN KEY (id_grado) REFERENCES grado(id_grado),
    CONSTRAINT FK_matricula_seccion FOREIGN KEY (id_seccion) REFERENCES seccion(id_seccion)
);

CREATE TABLE usuario (
    id_usuario INT IDENTITY(1,1) PRIMARY KEY,
    nombre_usuario VARCHAR(50) NOT NULL UNIQUE,
    contrasena VARCHAR(255) NOT NULL,
    estado BIT NOT NULL DEFAULT 1
);


-- =============================
-- TABLAS DEL SISTEMA WEB
-- =============================

CREATE TABLE usuario_web (
    id_usuario INT IDENTITY(1,1) PRIMARY KEY,
    nombre_usuario VARCHAR(100) NOT NULL UNIQUE,
    contrasena VARCHAR(255) NOT NULL,
    rol VARCHAR(20) NOT NULL, -- 'DIRECTOR', 'DOCENTE', 'APODERADO'
    id_docente INT NULL,
    id_apoderado INT NULL,
    estado BIT NOT NULL DEFAULT 1,
    CONSTRAINT FK_usuario_web_docente FOREIGN KEY (id_docente) REFERENCES docente(id_docente),
    CONSTRAINT FK_usuario_web_apoderado FOREIGN KEY (id_apoderado) REFERENCES apoderado(id_apoderado)
);

CREATE TABLE asistencia_alumno (
    id_asistencia INT IDENTITY(1,1) PRIMARY KEY,
    id_matricula INT NOT NULL,
    fecha DATE NOT NULL,
    estado CHAR(1) NOT NULL, -- 'P'=Presente, 'T'=Tardanza, 'F'=Falta
    CONSTRAINT FK_asistencia_matricula FOREIGN KEY (id_matricula) REFERENCES matricula(id_matricula)
);

CREATE TABLE tarea (
    id_tarea INT IDENTITY(1,1) PRIMARY KEY,
    id_materia INT NOT NULL,
    descripcion VARCHAR(500) NOT NULL,
    fecha_entrega DATE NOT NULL,
    fecha_asignacion DATE NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_tarea_materia FOREIGN KEY (id_materia) REFERENCES materia(id_materia)
);

CREATE TABLE cumplimiento_tarea (
    id_cumplimiento INT IDENTITY(1,1) PRIMARY KEY,
    id_tarea INT NOT NULL,
    id_matricula INT NOT NULL,
    cumplido BIT NOT NULL,
    fecha_cumplimiento DATE NULL,
    justificacion VARCHAR(500) NULL,
    CONSTRAINT FK_cumplimiento_tarea FOREIGN KEY (id_tarea) REFERENCES tarea(id_tarea),
    CONSTRAINT FK_cumplimiento_matricula FOREIGN KEY (id_matricula) REFERENCES matricula(id_matricula)
);

CREATE TABLE nota_alumno (
    id_nota INT IDENTITY(1,1) PRIMARY KEY,
    id_matricula INT NOT NULL,
    id_materia INT NOT NULL,
    bimestre INT NOT NULL,
    nota DECIMAL(5,2) NOT NULL,
    CONSTRAINT FK_nota_matricula FOREIGN KEY (id_matricula) REFERENCES matricula(id_matricula),
    CONSTRAINT FK_nota_materia FOREIGN KEY (id_materia) REFERENCES materia(id_materia)
);

-- 1. NIVELES
INSERT INTO nivel (nombre) VALUES 
('Inicial'), 
('Primaria'), 
('Secundaria');

-- 2. DOCENTES
INSERT INTO docente (
    codigo, dni, nombres, apellido_paterno, apellido_materno,
    genero, fecha_nacimiento, direccion, telefono, correo, estado,
    foto, nivel_academico, observaciones, id_nivel
)
VALUES 
('D001', '12345678', 'Juan', 'Pérez', 'González', 'Masculino', '1980-01-01', 'Av. Siempre Viva 123', '999888777', 'juan@example.com', 'Activo', NULL, 'Licenciado', NULL, 2),
('D002', '87654321', 'Ana', 'Ramírez', 'Lopez', 'Femenino', '1985-03-14', 'Calle Falsa 456', '988888999', 'ana@example.com', 'Activo', NULL, 'Magíster', NULL, 2);

select* from apoderado
-- 3. ALUMNOS
INSERT INTO alumno (
    codigo, dni, nombres, apellido_paterno, apellido_materno,
    genero, fecha_nacimiento, direccion, telefono, estado,
    foto, observaciones
)
VALUES 
('A001', '11112222', 'Carlos', 'Sánchez', 'Torres', 'Masculino', '2010-05-10', 'Calle Lima 101', '987654321', 'Activo', NULL, NULL),
('A002', '33334444', 'Lucía', 'Martínez', 'Rojas', 'Femenino', '2011-07-22', 'Av. Perú 456', '912345678',  'Activo', NULL, NULL);

-- 4. APODERADOS
INSERT INTO apoderado (
    dni, nombres, apellido_paterno, apellido_materno, 
    direccion,ocupacion, telefono, correo, tipo_parentesco 
)
VALUES 
('55556666', 'María', 'Gómez', 'Vega', 'Calle Apolo 321','policia', '999123456', 'maria@example.com', 'padre'),
('77778888', 'Pedro', 'Salas', 'León', 'Jr. Amazonas 432', '998765432','carpintero', 'pedro@example.com', 'padre');
INSERT INTO nivel (nombre)
VALUES ('Primaria');

-- 5. MATRÍCULA
-- Suponiendo: 
-- Carlos (id_alumno=1) y Lucía (id_alumno=2)
-- María (id_apoderado=1), Pedro (id_apoderado=2)
INSERT INTO grado (nombre, id_nivel)
VALUES 
('5to', 1), 
('6to', 1);
-- Crea una sección asociada al grado 1
-- CORRECTO: usa 'letra' en vez de 'nombre'
-- CORRECTO
INSERT INTO seccion (letra)
VALUES ('A');

sp_help seccion;



-- Juan (id_docente=1), Ana (id_docente=2)
INSERT INTO matricula (
    id_alumno, id_grado, id_seccion, anio_academico, tipo_matricula, fecha_matricula
)
VALUES 
(1, 1, 1, 2025, 'Ordinaria', '2025-03-01'),
(2, 1, 1, 2025, 'Ordinaria', '2025-03-01');


select* from seccion



-- 6. MATERIAS
INSERT INTO materia (nombre, id_nivel) VALUES
('Matemática', 1),
('Comunicación', 1);


-- 7. NOTAS
-- Suponiendo id_matricula = 1 (Carlos) y 2 (Lucía)
-- id_materia = 1 (Matemática), 2 (Comunicación)
INSERT INTO nota_alumno (
    id_nota,id_matricula, id_materia, bimestre, nota
)
VALUES
(1, 1, 'I', 15.5),
(1, 2, 'I', 17.2),
(2, 1, 'I', 14.0),
(2, 2, 'I', 13.5);

select* from nota_alumno

-- 8. USUARIOS WEB
INSERT INTO usuario_web (usuario, clave, tipo_usuario, estado, id_docente)
VALUES 
('juan123', 'clave123', 'Docente', 'Activo', 1),
('ana456', 'clave456', 'Docente', 'Activo', 2);
