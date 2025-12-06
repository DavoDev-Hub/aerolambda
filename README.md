# ✈️ Aerolambda

Aerolambda es una plataforma web para la **búsqueda, reserva y administración de vuelos**, desarrollada como proyecto académico utilizando una base de datos **NoSQL (MongoDB)** y una arquitectura cliente–servidor moderna.

El objetivo principal es ofrecer una experiencia de compra **simple y minimalista**, evitando pantallas saturadas y flujos confusos que suelen aparecer en algunos portales tradicionales de aerolíneas.

---

## 🌟 Características principales

### Para clientes

- Registro e inicio de sesión con correo y contraseña.
- Búsqueda de vuelos por:
  - Origen
  - Destino
  - Fecha
  - Número de pasajeros
- Visualización de resultados con:
  - Horario
  - Precio
  - Duración
  - Disponibilidad
- Selección de vuelo y **mapa visual de asientos** (Disponible / Bloqueado / Ocupado).
- Registro de datos del pasajero.
- **Simulación de pago** (sin cobro real).
- Generación de:
  - Código de reserva único
  - Comprobante de compra
- Historial de reservas del cliente y detalle de cada una.
- Cancelación de reservas (según reglas de negocio).

### Para administradores

- **Login con rol admin** y acceso a un panel administrativo.
- Gestión de vuelos:
  - Crear
  - Consultar
  - Editar
  - Cancelar
- Gestión de asientos por vuelo.
- Consulta y gestión de reservas:
  - Pendientes
  - Confirmadas
  - Canceladas
- Dashboard con métricas básicas:
  - Reservas por vuelo
  - Ocupación de asientos
  - Ingresos simulados
- Módulo de reportes y análisis (con generación de reporte en PDF).

---

## 🛠️ Tecnologías utilizadas

### Frontend

- [React](https://react.dev/) + [Vite](https://vitejs.dev/)
- TypeScript
- HTML5, CSS3
- Componentes reutilizables (Cards, Buttons, Inputs, Tabs, etc.)

### Backend

- Node.js
- Express
- TypeScript
- JWT para autenticación
- Middlewares para validación y autorización

### Base de datos

- MongoDB (NoSQL, orientada a documentos)

### Infraestructura / Otros

- Docker y Docker Compose
- Git y GitHub para control de versiones

---

## 🧱 Arquitectura general

El sistema sigue una arquitectura **cliente–servidor** con separación por capas:

- **Capa de presentación:** frontend en React (Vite).
- **Capa de lógica de negocio:** backend en Node.js + Express.
- **Capa de datos:** MongoDB como base de datos NoSQL.

La comunicación entre frontend y backend se realiza mediante **API REST** usando JSON.  
La autenticación se maneja con **tokens JWT**, e incluye **autorización por roles** (cliente / admin).

---

## 🚀 Instalación y ejecución

### 1. Clonar el repositorio

```bash
git clone https://github.com/DavoDev-Hub/aerolambda.git
cd aerolambda
