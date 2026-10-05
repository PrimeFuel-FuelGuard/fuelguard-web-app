# FuelGuard Web Application (`fuelguard-web-app`)

[![Angular Version](https://img.shields.io/badge/Angular-21-dd0031.svg?style=flat&logo=angular)](https://angular.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Spring Boot Backend](https://img.shields.io/badge/Spring_Boot-3.x-brightgreen.svg?style=flat&logo=spring)](https://spring.io/projects/spring-boot)
[![Architecture](https://img.shields.io/badge/Architecture-DDD_/_Hexagonal-orange.svg?style=flat)](#bounded-contexts)

## Descripción General

**FuelGuard** es una plataforma corporativa B2B de gestión y abastecimiento inteligente de hidrocarburos. La aplicación web frontend (`fuelguard-web-app`) implementa una arquitectura guiada por el dominio (**Domain-Driven Design - DDD**) basada en **Angular 21** con componentes autónomos (*Standalone Components*), reactividad mediante *Signals*, soporte multiidioma con `@ngx-translate/core`, y consumo directo de 85 endpoints REST expuestos por el backend Spring Boot.

La plataforma resuelve el problema crítico de la falta de visibilidad en inventarios de combustible y la ineficiencia logística:
1. **Telemetría IoT en Fosa:** Monitoreo continuo de tanques con sensores ultrasónicos, eliminando el varillaje manual.
2. **Generación Automatizada con Control:** Disparo de pre-órdenes ante niveles bajos con flujo *Human-in-the-Loop* para evitar compras duplicadas.
3. **Despacho Inteligente de Flota:** Algoritmo que recomienda la menor cisterna con cubicaje suficiente y un conductor habilitado en una sola operación.
4. **Trazabilidad & Descarga Segura:** Geocercas satelitales en destino y registro de apertura de válvulas autorizadas.

---

## Tecnologías Principales

- **Frontend Core:** Angular 21 (Standalone Components, Signals, Router, Control Flow nativo `@if` / `@for`).
- **Diseño & UI:** Angular Material 21, CSS Moderno con variables de diseño personalizadas (`--fg-primary`, `--fg-shadow-lg`, etc.).
- **Internacionalización (i18n):** `@ngx-translate/core` con traducción completa en Español (`es`) e Inglés (`en`).
- **Visualización de Datos:** Chart.js + `ng2-charts` para tendencias de consumo y ventas por sector.
- **Backend Conectado:** Spring Boot (Java 21) bajo arquitectura hexagonal y base de datos relacional MySQL.

---

## Estructura del Proyecto (Bounded Contexts)

El código fuente en `src/app/` está estrictamente modularizado por contextos acotados, manteniendo aisladas las capas de **Dominio**, **Aplicación**, **Infraestructura** y **Presentación**:

```text
src/app/
├── iam/                        # Contexto de Identidad y Acceso (IAM)
│   ├── application/            # IamStore, gestión reactiva de sesión y organizaciones
│   ├── domain/model/           # Session, UserProfile, Organization, Invitation
│   ├── infrastructure/         # IamApi (login, sign-up, RUC lookup, invitations)
│   └── presentation/           # Vistas de Login, Registro Comprador/Distribuidor, Perfil
│
├── equipment/                  # Contexto de Equipos y Telemetría IoT
│   ├── domain/model/           # Tank, Site, TankReading, RefillPolicy, RefillEpisode
│   ├── infrastructure/         # EquipmentApi, ProviderEquipmentApi
│   └── presentation/           # Lista de tanques, detalle con semáforo 3-niveles, lecturas IoT
│
├── ordering/                   # Contexto de Solicitudes y Órdenes
│   ├── domain/model/           # FuelRequest, FuelOrder, Pricing
│   ├── infrastructure/         # OrderingApi (85 endpoints REST integrados)
│   └── presentation/           # Bandejas de solicitudes, detalle de pedidos, estados comerciales
│
├── fulfillment/                # Contexto de Logística y Despacho
│   ├── domain/model/           # Delivery, Tanker, Driver, Geofence, TrackingSample
│   ├── infrastructure/         # DeliveryApi, TankerApi, DriverApi, RecommendationEngine
│   └── presentation/           # Tablero de despacho, asignación de flota, tracking satelital
│
├── inventory/                  # Contexto de Catálogo de Combustibles
│   ├── domain/model/           # Product, FuelType (Diésel B5, Gasolina 90/95/97, GLP, GNV)
│   ├── infrastructure/         # ProductApi (precios unitarios, stock disponible)
│   └── presentation/           # Catálogo público y formulario de productos
│
├── dashboard/                  # Contexto de Analítica y Reportes
│   ├── infrastructure/         # AnalyticsApi
│   └── presentation/           # Dashboard ejecutivo con KPIs y gráficos históricos
│
├── notifications/              # Contexto de Notificaciones
│   ├── infrastructure/         # NotificationApi
│   └── presentation/           # Centro de notificaciones operativas
│
├── admin/                      # Contexto de Administración de Plataforma
│   ├── infrastructure/         # AdminApi (métricas REST, evidencias de transporte, promoción de usuarios)
│   └── presentation/           # Panel administrativo
│
└── shared/                     # Componentes y utilidades compartidas
    ├── infrastructure/         # BaseApiEndpoint, BaseAssembler, BaseResource, ErrorHandling
    └── presentation/           # Toolbar, Layout principal, Language Switcher, Home corporativo
```

---

## Bounded Contexts y Flujos Operativos

### 1. Autenticación y Multi-Organización (IAM)
- Registro diferenciado para **Compradores** (`/register/buyer`) y **Distribuidores** (`/register/distributor`).
- Validación estricta de RUC peruano (11 dígitos numéricos sin letras ni guiones).
- Sesión con token JWT persistida de forma segura (`fuelguard.session`).
- Soporte para invitaciones entre miembros de una organización.

### 2. Equipos y Telemetría IoT
- Registro de plantas y sitios de entrega.
- Asociación de tanques con dispositivos de telemetría IoT.
- Semáforo de nivel en tres estados:
  - **Normal:** Nivel sobre el umbral de seguridad.
  - **Advertencia:** Nivel cercano al umbral de reposición ($Nivel \le Umbral + 15\%$).
  - **Crítico:** Nivel por debajo del umbral mínimo de operación.
- Monitoreo de lecturas de las últimas 48 horas con verificación de antigüedad y calidad de señal.

### 3. Solicitudes y Órdenes
- Solicitudes manuales o generadas automáticamente ante eventos de bajo nivel.
- Aprobación o rechazo con motivo documentado.
- Conversión de solicitudes aprobadas en órdenes con cálculo de montos totales.

### 4. Fulfillment y Despacho
- Registro y control de flota de camiones cisterna (`Tanker`) con cubicaje en litros o galones.
- Padrón de conductores certificados (`Driver`) con control de elegibilidad horaria.
- Motor de recomendación de recursos: asigna automáticamente la menor cisterna con capacidad suficiente y chofer disponible.
- Máquina de estados física: `ASSIGNED` $\rightarrow$ `STARTED` $\rightarrow$ `ARRIVED` $\rightarrow$ `DELIVERING` $\rightarrow$ `COMPLETED`.
- Definición de geocercas satelitales en el punto de descarga y auditoría de apertura de válvulas.

---

## Ejecución del Proyecto

### Requisitos Previos
- **Node.js:** Versión 20.x o superior.
- **npm:** Versión 10.x o superior.
- **Backend FuelGuard:** Spring Boot ejecutándose en `http://localhost:8080`.

### 1. Instalar Dependencias
```bash
npm install
```

### 2. Iniciar el Servidor de Desarrollo
```bash
npm start
```
La aplicación estará disponible en `http://localhost:4200/` con recarga en caliente (*Hot Module Replacement*).

### 3. Compilar para Producción
```bash
npm run build
```
Genera los artefactos optimizados en el directorio `dist/fuelguard-web-app/`.

### 4. Pruebas Unitarias
```bash
npm test
```

---

## Variables de Entorno

- **Desarrollo (`src/environments/environment.development.ts`):**
  - `serverBasePath: 'http://localhost:8080/api'`
- **Producción (`src/environments/environment.ts`):**
  - `serverBasePath: 'https://fuelguard-backend.onrender.com/api'`

---

## Integración de APIs (Cero Fake APIs)

El frontend consume directamente **85 endpoints REST** del backend Spring Boot. No se utilizan mocks ni datos simulados en memoria:
- Todas las peticiones HTTP fluyen a través de `HttpClient` con el interceptor [auth.interceptor.ts](file:///c:/Users/alanj/Downloads/Fun%20de%20Arquitectura%20Software/frontend-main/frontend-main/src/app/iam/infrastructure/auth.interceptor.ts) que adjunta el Bearer Token JWT y gestiona errores unificados.
- El backend expone la especificación OpenAPI en `http://localhost:8080/api-docs`.

---

## Licencia y Derechos

© 2026 FuelGuard Platform. Todos los derechos reservados. Proyecto desarrollado bajo estándares de Ingeniería de Software, Arquitectura Limpia y Seguridad Industrial.
