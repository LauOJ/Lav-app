# LAV-APP

Aplicación web colaborativa para localizar y valorar aseos urbanos con enfoque inclusivo y social.

Proyecto final del Ciclo Formativo de Desarrollo de Aplicaciones Web (DAW) – Curso 2025/2026.

---

## 🧠 Descripción

LAV-APP nace como una respuesta a una necesidad cotidiana: encontrar baños accesibles, limpios y adecuados en entornos urbanos.

A diferencia de otras aplicaciones de localización, LAV-APP incorpora filtros específicos como:

- Accesible (movilidad reducida)
- Baño neutro
- Cambiador
- Solo para clientes
- Productos de higiene íntima

Además, permite que las personas usuarias valoren su experiencia mediante puntuaciones y comentarios.

El proyecto está diseñado bajo principios de tecnología ética, accesible y open source.

---

## 🏗 Arquitectura del proyecto

El proyecto está desarrollado con una arquitectura full stack separada en frontend y backend:


### 🔹 Frontend
- Angular 21
- Standalone components
- Signals y computed
- Leaflet + OpenStreetMap
- Diseño mobile-first

### 🔹 Backend
- FastAPI
- Pydantic (validaciones)
- SQLAlchemy (ORM)
- Autenticación JWT

### 🔹 Base de datos
- PostgreSQL
- Restricciones de integridad
- Claves foráneas
- Unicidad de reviews por usuario y WC

---

## 🔐 Autenticación

La aplicación utiliza autenticación basada en JWT:

1. La persona usuaria se registra o inicia sesión.
2. El servidor valida las credenciales.
3. Se genera un token JWT.
4. El token se envía en cada petición protegida.

---

## 🗺 Funcionalidades principales

- Mapa interactivo con geolocalización
- Filtros dinámicos
- Bottom sheet con información del WC
- Sistema de reviews
- Sistema de favoritos
- CRUD de WCs
- Validaciones en formularios
- Control de errores de API

