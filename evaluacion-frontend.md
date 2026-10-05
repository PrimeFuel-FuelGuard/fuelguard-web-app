# AUDITORÍA TÉCNICA Y FUNCIONAL DEL FRONTEND — FUELGUARD
**Evaluación Exhaustiva de Arquitectura, UX/UI, Integración con Backend, User Stories y Calidad de Software**
*Proyecto: FuelGuard (Sistema B2B de Monitoreo IoT y Abastecimiento de Combustible)*  
*Entregable: Informe de Auditoría y Evaluación Técnica*  
*Fecha de Auditoría: 05 de Octubre de 2026*  
*Auditor: Senior Frontend Engineer, Software Architect, UX/UI Designer & Lead Software Auditor*  
*Documentos de Referencia: TB2_1ASI0657_202610_9206_GRUPO_1_completo.md & Trabajo_Final_1ASI0657_202620.md*

---

## 1. RESUMEN EJECUTIVO

Se ha ejecutado una auditoría técnica, funcional, visual y arquitectónica completa sobre el código fuente del frontend desarrollado en **Angular 21 (v21.2.9)** para la plataforma **FuelGuard** (inicialmente referenciada como FullTank), contrastándolo línea por línea contra la documentación oficial del Trabajo Final (TB2) y la API real provista por el backend Spring Boot.

### Veredicto Global
El frontend exhibe una **base arquitectónica sobresaliente y altamente moderna**, adoptando las últimas capacidades de Angular 21 (zoneless/signals, nuevo control flow `@if`/`@for`, diseño reactivo con `signal` y `computed`, componentes Standalone y encapsulación Bounded Context DDD). 

A diferencia de proyectos académicos habituales que recurren a arrays estáticos, **el 100% de las vistas operativas de negocio (Dashboard, Tanques, Pedidos, Asignación de Despacho, Entregas, Flota y Pagos) consume endpoints reales del backend mediante HttpClient**, implementando manejo granular de estados HTTP, control de idempotencia mediante UUIDs, interceptores JWT y normalización volumétrica matemática.

Sin embargo, la auditoría identifica **inconsistencias documentales críticas (P0/P1)** que deben ser atendidas antes de la sustentación final ante el jurado de la UPC:
1. **Divergencia de Marca (Branding):** Persistencia ubicua del nombre anterior `FullTank` en títulos de pestañas, cabeceras, package.json y constantes de código, frente al nombre oficial aprobado `FuelGuard`.
2. **Desacoplamiento de la Landing Page:** La landing pública dentro del repositorio del frontend es un cascarón mínimo (no cuenta con el formulario de contacto, secciones de planes, testimonios ni beneficios exigidos en EP01, aunque existe un repositorio paralelo dedicado para la landing).
3. **Brechas en el Módulo de Analítica y Reportes:** Ausencia del generador descargable en PDF (US-35 / US-14) y del gráfico de distribución por sector (US-48).
4. **Discrepancia en la Máquina de Estados de Entrega:** El frontend y backend implementan con precisión la máquina física extendida (`ASSIGNED`, `STARTED`, `ARRIVED`, `DELIVERING`, `COMPLETED`), pero el informe textual del TB2 describe una secuencia simplificada de 6 estados.

---

## 2. ARQUITECTURA ENCONTRADA

### 2.1 Estructura de Directorios y Separación Bounded Context
El proyecto aplica rigurosamente el patrón **Screaming Architecture / Domain-Driven Design (DDD)**, aislando cada contexto delimitado dentro de `src/app/`:

```
src/app/
├── admin/                 # Bounded Context: Administración de Usuarios y Métricas
├── analytics/             # Bounded Context: Analítica Operativa y Tendencias
├── dashboard/             # Bounded Context: Tablero Principal de Control
├── equipment/             # Bounded Context: Monitoreo IoT, Tanques, Clientes y Políticas
├── fulfillment/           # Bounded Context: Logística, Flota (Conductores/Cisternas) y Entregas
├── iam/                   # Bounded Context: Identity & Access Management (RBAC)
├── inventory/             # Bounded Context: Catálogo de Combustibles y Precios
├── notification/          # Bounded Context: Notificaciones del Sistema y Eventos
├── ordering/              # Bounded Context: Solicitudes de Abastecimiento, Órdenes y Pagos
└── shared/                # Kernel Compartido: Layout, Toolbar, Base API, Utilidades
```

Cada bounded context sigue internamente una separación en capas:
- `domain/model/`: Entidades tipadas con TypeScript estricto, interfaces de eventos y value objects.
- `application/`: Stores reactivos basados en Signals de Angular (`@Injectable({ providedIn: 'root' })`).
- `infrastructure/`: Clientes de API REST (`HttpClient`), interceptores, guardas de ruta y mapeadores.
- `presentation/`: Vistas (`views/`) y componentes visuales reutilizables (`component/`).

### 2.2 Patrones de Diseño Detectados
- **Angular Signals:** Eliminación de Zone.js en favor de reactividad fina (`signal`, `computed`, `effect`, `toSignal`).
- **Store Pattern Reactivo:** Centralización del estado de sesión en [iam.store.ts](file:///c:/Users/alanj/Downloads/Fun%20de%20Arquitectura%20Software/frontend-main/frontend-main/src/app/iam/application/iam.store.ts), de pedidos en `ordering.store.ts` y de flota en `fulfillment.store.ts`.
- **Command Idempotency:** Generación de `crypto.randomUUID()` en el cliente para el envío seguro de asignaciones de despacho, previniendo duplicidad ante cortes de red.
- **Micro-Frontends & Lazy Loading:** Todas las rutas secundarias se cargan asíncronamente mediante `loadChildren` o `loadComponent`.

---

## 3. PANTALLAS AUDITADAS

| Pantalla | Ruta | Objetivo | User Story | API Relacionada | Estado |
|---|---|---|---|---|---|
| **Home (Landing)** | `/home` | Presentación del producto al visitante | US-01, US-03 | Ninguna (Estática) | **PARCIAL** (Muy básica, carece de cómo funciona, precios, testimonios) |
| **About Us** | `/about` | Información institucional de FuelGuard | US-02 | Ninguna (Estática) | **INCONSISTENTE** (Solo 6 líneas de texto genérico sin perfiles del equipo) |
| **Login** | `/login` | Autenticación con email/contraseña | US-15 | `POST /api/authentication/sign-in` | **CUMPLE** |
| **Registro Comprador** | `/register/buyer` | Alta de empresa compradora (grifo/planta) | US-40 | `POST /api/authentication/sign-up` | **CUMPLE** |
| **Registro Proveedor** | `/register/distributor` | Alta de empresa distribuidora de combustible | US-41 | `POST /api/authentication/sign-up` | **CUMPLE** |
| **Recuperar Contraseña** | `/forgot-password` | Solicitud de restablecimiento vía email | US-16 | `POST /api/authentication/password-reset/request` | **CUMPLE** |
| **Confirmar Contraseña** | `/reset-password` | Ingreso de nueva clave con token | US-16 | `POST /api/authentication/password-reset/confirm` | **CUMPLE** |
| **Perfil de Usuario** | `/profile` | Ver y editar datos de empresa y cuenta | US-23, US-24 | `GET/PUT /api/buyer-companies/:id`, `GET/PUT /api/provider-companies/:id` | **CUMPLE** |
| **Dashboard Operativo** | `/dashboard` | Resumen de KPIs, alertas críticas y órdenes | US-18, US-47 | `GET /api/analytics/...`, `GET /api/provider/tanks`, `GET /api/deliveries` | **CUMPLE** |
| **Listado de Clientes** | `/clients` | Gestión de compradores B2B y sus tanques | US-31, US-32 | `GET /api/provider/buyer-companies` | **CUMPLE** |
| **Alta Comprador** | `/clients/new` | Búsqueda por RUC y vinculación | US-31 | `GET /api/provider/buyer-companies/lookup`, `POST /.../buyer-companies` | **CUMPLE** |
| **Detalle de Cliente** | `/clients/:buyerId` | Vista 360° del comprador y sus tanques | US-32 | `GET /api/provider/buyer-companies/:id`, `GET /api/provider/tanks` | **CUMPLE** |
| **Detalle Tanque (Dist.)**| `/clients/tank/:id` | Telemetría IoT 48h, nivel, umbral, episodios | US-51, US-52 | `GET /api/provider/tanks/:id`, `GET /.../readings`, `GET /.../episodes` | **CUMPLE** |
| **Editar Tanque** | `/clients/:bId/tanks/:tId/edit` | Configurar umbral crítico y dispositivo IoT | US-50, US-51 | `PUT /api/provider/tanks/:id` | **CUMPLE** |
| **Mis Tanques (Comprador)**| `/tanks` | Monitoreo de tanques propios de la estación | US-51 | `GET /api/tanks` | **CUMPLE** |
| **Detalle Tanque (Comp.)** | `/tanks/:id` | Ajuste de política de reposición automática | US-50 | `GET/PUT /api/tanks/:id/refill-policy` | **CUMPLE** |
| **Catálogo Productos** | `/fuel-products` | Catálogo de combustibles y precios | US-46 | `GET /api/fuel-products` | **CUMPLE** |
| **Formulario Producto** | `/fuel-products/product-form` | Crear/editar precio y tipo de combustible | US-46 | `POST/PUT /api/fuel-products` | **CUMPLE** |
| **Solicitudes Abastecimiento**| `/ordering/request-list` | Bandeja de solicitudes IoT y manuales | US-10 | `GET /api/replenishment-requests` | **CUMPLE** |
| **Detalle Solicitud** | `/ordering/request-detail/:id` | Aceptar o rechazar con motivo obligatorio | US-11, US-42 | `POST /api/replenishment-requests/:id/accept`, `/reject` | **CUMPLE** |
| **Crear Solicitud Manual**| `/ordering/request-form` | Pedido de contingencia cuando falla el IoT | US-05 | `POST /api/replenishment-requests` | **CUMPLE** |
| **Órdenes de Combustible**| `/ordering/order-list` | Listado y seguimiento de órdenes confirmadas | US-06, US-09 | `GET /api/fuel-orders/company/:id` o `/provider/:id` | **CUMPLE** |
| **Detalle de Orden** | `/ordering/order-detail/:id` | Asignación de recursos (IA/Manual) y Pago | US-49, US-08 | `POST /api/deliveries`, `GET /api/deliveries/recommendation` | **CUMPLE** |
| **Historial Pagos (Comp.)**| `/ordering/payment-history` | Depósitos y pagos de la estación | US-08 | `GET /api/payments/company/:id` | **CUMPLE** |
| **Gestión Pagos (Dist.)** | `/payments` | Conciliación y reembolso de transferencias | US-11, TS-20 | `GET /api/payments/provider/:id`, `POST /payments/:id/refund` | **CUMPLE** |
| **Lista de Cisternas** | `/fulfillment/tanker-list` | Gestión de camiones cisterna y capacidad | US-44 | `GET /api/tankers`, `/api/tankers/:id/eligibility` | **CUMPLE** |
| **Formulario Cisterna** | `/fulfillment/tanker-form` | Registro y edición de unidades cisterna | US-44 | `POST/PUT /api/tankers` | **CUMPLE** |
| **Lista de Conductores** | `/fulfillment/driver-list` | Control de choferes, licencias y estado | US-45 | `GET /api/drivers`, `/api/drivers/:id/eligibility` | **CUMPLE** |
| **Formulario Conductor** | `/fulfillment/driver-form` | Registro y edición de licencias y contacto | US-45 | `POST/PUT /api/drivers` | **CUMPLE** |
| **Lista de Entregas** | `/fulfillment/delivery-list` | Monitoreo del despacho diario y filtros | US-12, US-52 | `GET /api/deliveries?date=YYYY-MM-DD` | **CUMPLE** |
| **Detalle de Entrega** | `/fulfillment/delivery-detail/:id`| Trazabilidad física: Geocerca, Válvula, GPS | US-52, US-53, US-55 | `GET /api/deliveries/:id/tracking`, `/valve-observations`, `/timeline` | **CUMPLE** |
| **Centro Notificaciones** | `/notification` | Bandeja de avisos operativos y de eventos | US-29, US-30, US-54 | `GET /api/me/notifications` | **CUMPLE** |
| **Analytics / Reportes** | `/analytics` | Reporte financiero mensual y de plataforma | US-33, US-34 | `GET /api/analytics/buyer/:id`, `/provider/:id` | **PARCIAL** (Falta PDF y distribución por sector) |
| **Panel Administrador** | `/admin` | Métricas de sistema y gestión de cuentas | TS-07, TS-27 | `GET /api/admin/users`, `/api/admin/metrics` | **CUMPLE** |

---

## 4. AUDITORÍA DEL DASHBOARD

El componente [Dashboard](file:///c:/Users/alanj/Downloads/Fun%20de%20Arquitectura%20Software/frontend-main/frontend-main/src/app/dashboard/presentation/views/dashboard/dashboard.ts) es la pieza neurálgica de la experiencia operativa.

### 4.1 Verificación de Integridad de Datos (Mocks vs APIs Reales)
- **Cero Datos Hardcodeados:** Se constató rigurosamente que el Dashboard **NO utiliza arrays de demostración fijos ni mocks estáticos**.
- **Consumo Real de Endpoints:**
  1. Indicadores Financieros y Volumétricos: Proviene de `AnalyticsApi.getProviderAnalytics(providerId, monthStart, today)` o `getBuyerAnalytics(companyId)`.
  2. Tendencia de Ventas (Chart.js): Gráfico de barras alimentado en tiempo real desde `provider.salesTrend` con selector de granularidad dinámica (día, semana, mes) mediante `groupSalesTrend()`.
  3. Solicitudes Pendientes (Inbox): Consumido desde `GET /api/replenishment-requests/inbox` filtrando `status === 'PENDING'`.
  4. Tanques Críticos: Consumido desde `ProviderEquipmentApi.tanks()` filtrando tanques donde `t.critical === true`, ordenados ascendentemente por `levelPercent` (máximo 5).
  5. Entregas del Día: Consumido desde `FulfillmentApi.deliveries(todayLima())`.
  6. Conteo de Órdenes por Estado: Agregación en tiempo real computada sobre `OrderingApi.orders()`.

### 4.2 Evaluación de Resiliencia y UX
- **Aislamiento de Fallos en Tarjetas:** El dashboard implementa la interfaz genérica `Card<T> { loading: boolean; error: boolean; data: T }`. Si la API de telemetría de tanques falla, la tarjeta de tanques críticos muestra un estado de error local con botón de reintento (`analytics.card-retry`), sin tumbar ni ocultar las métricas de ventas ni la lista de entregas.
- **Zona Horaria Estricta:** Implementación de `todayLima()` en `America/Lima` (en-CA: YYYY-MM-DD), evitando desfases de fecha ocasionados por conversiones a UTC en horarios nocturnos.

---

## 5. FLUJO DEL CICLO DE PEDIDO

Se auditó la continuidad operativa del ciclo completo de abastecimiento:

```
[Sensor IoT ESP32]
       ↓ (Nivel ≤ Umbral Crítico)
[Backend Evaluator / Pre-order Generator]
       ↓ (Crea Solicitud AUTOMATIC)
[Frontend: Bandeja de Solicitudes / Dashboard Inbox]
       ↓ (Distribuidor revisa volumen, producto y cliente)
[Acción: Aceptar / Rechazar] ─── (Rechazo con motivo obligatorio)
       ↓ (Aceptación exitosa crea FuelOrder vinculada)
[Frontend: Detalle de Orden (/ordering/order-detail/:id)]
       ↓ (Validación de pago bancario por Comprador / Validación de Cisterna)
[Asignación de Recursos: Recomendación IA o Selección Manual]
       ↓ (Cisterna con capacidad suficiente + Conductor disponible + Ventana horaria)
[Despacho Creado -> Delivery físico (/fulfillment/delivery-detail/:id)]
       ↓ (Geocerca configurada + Telemetría GPS + Monitoreo de Válvula)
[Transiciones Físicas: ASSIGNED → STARTED → ARRIVED → DELIVERING → COMPLETED]
       ↓
[Confirmación de Entrega y Expediente / Cierre]
```

### Hallazgos Específicos del Flujo:
1. **Human-in-the-Loop Respetado:** Las solicitudes IoT automáticas llegan con `source: 'AUTOMATIC'` y estado `PENDING`. No se genera orden en firme ni movimiento de inventario hasta que el usuario distribuidor presiona explícitamente "Aceptar" con confirmación modal.
2. **Rechazo Obligatorio con Motivo:** El diálogo modal [request-detail.html](file:///c:/Users/alanj/Downloads/Fun%20de%20Arquitectura%20Software/frontend-main/frontend-main/src/app/ordering/presentation/views/request-detail/request-detail.html#L45-L52) deshabilita el botón de confirmación si el campo `rejectionReason` está en blanco.
3. **Idempotencia en Asignación de Despacho:** Al presionar "Revisar asignación", el sistema genera un UUID único (`crypto.randomUUID()`). Si la conexión experimenta timeout o error de red, el reintento reutiliza el mismo `commandId`, impidiendo que el backend reserve dos cisternas para la misma orden.
4. **Validación Automática de Capacidad de Cisterna:** El frontend no permite seleccionar una cisterna cuya capacidad en litros sea inferior al volumen solicitado en la orden:
   ```typescript
   // order-detail.ts
   tankerBlockReason(t: Tanker): string | null {
     if (!this.eligibleTankerIds.has(t.id)) return 'fulfillment.assignment.ineligible';
     const capacity = this.toLitres(t.capacity, t.unit);
     if (capacity === null || this.requiredLitres() === null) return 'fulfillment.assignment.unknown-capacity';
     return capacity < this.requiredLitres()! ? 'fulfillment.assignment.insufficient-capacity' : null;
   }
   ```
   Las cisternas insuficientes aparecen inhabilitadas en la interfaz indicando el motivo exacto.

---

## 6. MONITOREO DE TANQUES E IOT

### 6.1 Implementación en Vistas
- **Vista Comprador (`/tanks`):** Permite listar tanques asociados a los sitios de la empresa, visualizar porcentaje con barra de progreso y configurar la política de reposición en `/tanks/:id`:
  - `lowLevelPercent`: Umbral crítico que detona el pedido.
  - `hysteresisPercent`: Margen de histéresis.
  - `targetLevelPercent`: Nivel objetivo de llenado.
  - `providerId` y `fuelProductId`: Distribuidor y producto preferido.
  - `autoGenerateEnabled`: Switch para activación de generación autónoma.
- **Vista Proveedor (`/clients/tank/:id`):** 
  - Gráfico interactivo Chart.js con el historial de lecturas de las últimas 48 horas.
  - Detección reactiva de telemetría obsoleta (`stale`): si la última lectura tiene más de 60 minutos de antigüedad, la interfaz muestra una advertencia visual amarilla/naranja destacada.
  - Registro de dispositivos vinculados (`deviceId`, canal de comunicación, fecha de activación).
  - Listado de episodios de reposición asociados con enlace directo a la solicitud generada (`#requestId`).

### 6.2 Inconsistencia Detectada en Estados (Normal / Advertencia / Crítico)
- **Problema:** La documentación funcional exige la diferenciación clara de 3 estados: **Normal**, **Advertencia** y **Crítico**.
- **Evidencia en Código:** El backend y el frontend manejan un flag booleano binario: `t.critical` (True / False). En `provider-tank-detail.html`:
  ```html
  <div class="ptd-vbar" [class.critical]="t.critical">
    <div class="fill" [style.height.%]="t.levelPercent"></div>
    <div class="threshold" [style.bottom.%]="t.lowLevelPercent"></div>
  </div>
  ```
  No existe una categoría visual intermedia para **Advertencia** (por ejemplo, entre el umbral crítico + 10% de histéresis). El tanque pasa súbitamente de estado normal a crítico.

---

## 7. CONDUCTORES

- **Listado y Filtros:** En `/fulfillment/driver-list`, se presentan los conductores con columnas de Nombre, Licencia, Teléfono, Correo y Estado. Cuenta con filtros para alternar entre "Todos" y "Disponibles".
- **Habilitación Operativa:** Cada conductor posee un botón para consultar su elegibilidad (`checkDriverEligibility()`), consultando el servicio de validación que verifica licencias vigentes y que no tenga asignaciones simultáneas (`ELIGIBLE`, `BUSY`, `INELIGIBLE`).
- **Activación / Desactivación:** Permite alternar entre `AVAILABLE` e `INACTIVE` mediante un modal de confirmación (`confirmDialog`), evitando deshabilitaciones accidentales de personal operativo.

---

## 8. CISTERNAS (TANKERS)

- **Gestión de Flota:** En `/fulfillment/tanker-list`, se registran y auditan las unidades cisterna con placa, marca, modelo, capacidad nominal y unidad de medida (Galones / Litros).
- **Control de Disponibilidad:** Al igual que los conductores, cuenta con verificación de elegibilidad técnica (`checkTankerEligibility()`) para comprobar que el camión no se encuentre en ruta activa ni en mantenimiento.
- **Validación de Asignación:** La cisterna se bloquea en la UI si su estado es `INACTIVE`, si está ocupada (`BUSY`) o si su volumen útil no cubre la demanda del pedido.

---

## 9. ENTREGAS Y SEGUIMIENTO FÍSICO

- **Máquina de Estados Física:** El detalle de entrega (`/fulfillment/delivery-detail/:id`) implementa los comandos de transición acordes con las capacidades de la cisterna:
  - `start`: De `ASSIGNED` a `STARTED` (Camión sale de planta).
  - `arrive`: De `STARTED` a `ARRIVED` (Llegada a la estación del cliente).
  - `complete`: De `ARRIVED` o `DELIVERING` a `COMPLETED`, solicitando obligatoriamente el volumen efectivamente descargado (`deliveredVolume`).
  - `fail` / `cancel`: Transición a fallido o cancelado, exigiendo el registro de una justificación textual (`reason`).
- **Seguridad Operativa y Geocercas (US-53):** 
  - La interfaz permite configurar la geocerca de descarga (`centerLatitude`, `centerLongitude`, `radiusMeters`) con validación de rangos numéricos terrestres (Lat [-90, 90], Lon [-180, 180], Radio > 0).
  - Visualización de eventos de apertura/cierre de válvulas (`valveObservations`) vinculados a la geocerca.
- **Telemetría GPS en Ruta:** Proporciona botón con enlace dinámico a Google Maps basado en las coordenadas reportadas por el GPS vehicular y muestra la tabla cronológica de muestras de telemetría (`trackingSamples`).
- **Impresión de Expediente:** Dispone de botón para emitir el comprobante físico de liquidación mediante `window.print()`.

---

## 10. MATRIZ DE USER STORIES (TRAZABILIDAD FUNCIONAL)

| User Story | Pantalla | Acción del Usuario | Endpoint / API | Estado |
|---|---|---|---|---|
| **US-01: Ver Home** | `/home` | Visualiza presentación de valor | Estática | **PARCIAL** |
| **US-02: About Us** | `/about` | Lee misión y antecedentes | Estática | **INCONSISTENTE** |
| **US-03: How it Works** | `/home` | Revisa flujo explicativo paso a paso | Estática | **FALTANTE** |
| **US-04: Contact Us** | N/A | Envía formulario de contacto | N/A | **FALTANTE** |
| **US-05: Pedido Contingencia** | `/ordering/request-form` | Registra solicitud manual | `POST /api/replenishment-requests` | **CUMPLE** |
| **US-06: Estado de Pedido** | `/ordering/order-list` | Consulta órdenes y estados | `GET /api/fuel-orders/...` | **CUMPLE** |
| **US-07: Confirmar Recepción** | `/fulfillment/delivery-detail` | Completa descarga y volumen | `POST /api/deliveries/:id/complete` | **PARCIAL** (Falta firma/evidencia del comprador) |
| **US-08: Registrar Pago** | `/ordering/order-detail` | Registra método y voucher bancario | `POST /api/payments`, `/complete` | **CUMPLE** |
| **US-09: Historial Pedidos** | `/ordering/order-list` | Filtra y revisa órdenes previas | `GET /api/fuel-orders/...` | **CUMPLE** |
| **US-10: Solicitudes Pendientes**| `/ordering/request-list` | Revisa bandeja de entrada de pedidos | `GET /api/replenishment-requests` | **CUMPLE** |
| **US-11: Aceptar Solicitud** | `/ordering/request-detail` | Aprueba solicitud y crea orden | `POST /.../replenishment-requests/:id/accept` | **CUMPLE** |
| **US-12: Marcar Despachado** | `/fulfillment/delivery-detail` | Cambia estado a STARTED | `POST /api/deliveries/:id/start` | **CUMPLE** |
| **US-13: Cerrar Pedido** | `/ordering/order-detail` | Confirmación final de la orden | `POST /api/fuel-orders/:id/confirm` | **CUMPLE** |
| **US-14: Reporte de Ventas** | `/analytics` | Consulta ventas por rango | `GET /api/analytics/provider/:id` | **PARCIAL** (Sin descarga archivo) |
| **US-15: Iniciar Sesión** | `/login` | Ingresa credenciales y obtiene JWT | `POST /api/authentication/sign-in` | **CUMPLE** |
| **US-16: Recuperar Password** | `/forgot-password` | Solicita y confirma reseteo | `POST /api/authentication/password-reset/...` | **CUMPLE** |
| **US-17: Cerrar Sesión** | Barra superior / Menú | Limpia token y contexto | `IamStore.logout()` | **CUMPLE** |
| **US-18: Resumen Solicitante**| `/dashboard` | Visualiza KPIs de compra | `GET /api/analytics/buyer/:id` | **CUMPLE** |
| **US-22: Validar Transporte** | `/ordering/order-detail` | Consulta cisternas/conductores hábiles | `GET /api/drivers?eligible=true`, `/tankers` | **CUMPLE** |
| **US-23: Ver Perfil** | `/profile` | Consulta perfil de usuario/empresa | `GET /api/users/:id`, `/buyer-companies/:id` | **CUMPLE** |
| **US-24: Editar Perfil** | `/profile` | Actualiza teléfonos y dirección | `PUT /api/buyer-companies/:id`, `provider-...` | **CUMPLE** |
| **US-25: FAQs** | N/A | Preguntas frecuentes | N/A | **FALTANTE** |
| **US-26: Contacto Rápido** | N/A | Teléfonos de emergencia | N/A | **FALTANTE** |
| **US-27: Buscar Pedido** | `/ordering/order-list` | Filtro reactivo por código de orden | Filtro en memoria sobre array ordenado | **CUMPLE** |
| **US-28: Filtrar por Estado** | `/ordering/order-list` | Chips de estado: PENDING, PAID, etc. | Filtro reactivo (`computed`) | **CUMPLE** |
| **US-29: Notificación Aprobación**| `/notification` | Recibe push/alerta de orden aceptada| `GET /api/me/notifications` | **CUMPLE** |
| **US-30: Notificación Despacho**| `/notification` | Alerta de camión en camino | `GET /api/me/notifications` | **CUMPLE** |
| **US-31: Listar Empresas** | `/clients` | Lista compradores y sus tanques | `GET /api/provider/buyer-companies` | **CUMPLE** |
| **US-32: Detalle Empresa** | `/clients/:buyerId` | Revisa consumos y tanques de cliente | `GET /api/provider/buyer-companies/:id` | **CUMPLE** |
| **US-33: Gráfico Consumo** | `/analytics` | Gráfico de galones/gasto mensual | `GET /api/analytics/buyer/:id` | **CUMPLE** |
| **US-34: Gráfico Ventas** | `/dashboard`, `/analytics` | Tendencia de litros vendidos y soles | `GET /api/analytics/provider/:id` | **CUMPLE** |
| **US-35: Descargar Reporte PDF**| `/analytics` | Botón exportar PDF consolidado | N/A | **FALTANTE** |
| **US-36: Ver Beneficios** | `/home` | Sección "Por qué elegir FuelGuard" | N/A | **FALTANTE** |
| **US-37: Testimonios** | `/home` | Sección de casos de éxito | N/A | **FALTANTE** |
| **US-38: Planes y Precios** | `/home` | Tabla comparativa de planes | N/A | **FALTANTE** |
| **US-39: Cambiar Idioma** | Layout / Navbar | Conmutador Español / Inglés | `TranslateService.use()` (i18n reactivo) | **CUMPLE** |
| **US-40: Registro Solicitante**| `/register/buyer` | Registro empresa compradora con RUC | `POST /api/authentication/sign-up` | **CUMPLE** |
| **US-41: Registro Proveedor** | `/register/distributor`| Registro empresa distribuidora | `POST /api/authentication/sign-up` | **CUMPLE** |
| **US-42: Rechazar Pedido** | `/ordering/request-detail` | Rechazo con motivo obligatorio | `POST /.../replenishment-requests/:id/reject` | **CUMPLE** |
| **US-43: Detalle de Pedido** | `/ordering/order-detail` | Vista completa de orden y productos | `GET /api/fuel-orders/:id` | **CUMPLE** |
| **US-44: Gestionar Vehículos** | `/fulfillment/tanker-list` | CRUD de cisternas y cubicaje | `GET/POST/PUT /api/tankers` | **CUMPLE** |
| **US-45: Gestionar Conductores**| `/fulfillment/driver-list`| CRUD de choferes y licencias | `GET/POST/PUT /api/drivers` | **CUMPLE** |
| **US-46: Catálogo Combustible**| `/fuel-products` | CRUD de combustibles y precios | `GET/POST/PUT /api/fuel-products` | **CUMPLE** |
| **US-47: Dashboard Proveedor** | `/dashboard` | Tablero con KPIs, Inbox y Gráficos | Múltiples APIs consolidadas | **CUMPLE** |
| **US-48: Ventas por Sector** | `/analytics` | Gráfico de distribución industrial | N/A | **FALTANTE** |
| **US-49: Asignar Recursos** | `/ordering/order-detail` | Asigna camión y chofer a despacho | `POST /api/deliveries` | **CUMPLE** |
| **US-50: Configurar Umbral IoT**| `/tanks/:id`, `/clients/...` | Define nivel crítico (ej. ≤20%) | `PUT /api/tanks/:id/refill-policy` | **CUMPLE** |
| **US-51: Asociar Tanque e IoT**| `/clients/:id/tanks/new` | Vincula deviceId, sensor y tanque | `POST /api/provider/tanks` | **CUMPLE** |
| **US-52: Telemetría de Pedido** | `/fulfillment/delivery-detail` | GPS, muestras y lectura de tanque | `GET /api/deliveries/:id/tracking` | **CUMPLE** |
| **US-53: Bloqueo de Válvula** | `/fulfillment/delivery-detail` | Geocerca y observaciones de válvula | `POST /.../geofence-policies`, `/valve-...` | **CUMPLE** |
| **US-54: Alertas de Operación**| `/notification` | Avisos por quiebre o desvío | `GET /api/me/notifications` | **CUMPLE** |
| **US-55: Expediente de Entrega**| `/fulfillment/delivery-detail` | Hoja completa de liquidación imprimible | Vista integral de trazabilidad + `print()` | **CUMPLE** |

---

## 11. INTEGRACIÓN CON EL BACKEND (API & DTOS)

### 11.1 Tabla de Compatibilidad Arquitectónica

| Funcionalidad | Frontend (Angular) | Backend (Spring Boot) | Compatible | Observaciones |
|---|---|---|:---:|---|
| **Autenticación** | `IamApi.signIn()` | `AuthenticationController.signIn()` | **SÍ** | Devuelve JWT Bearer estándar. |
| **Registro Empresa** | `IamApi.signUp()` | `AuthenticationController.signUp()` | **SÍ** | DTO discrimina `BUYER` y `PROVIDER`. |
| **Métricas Tablero** | `AnalyticsApi.get...()` | `AnalyticsController` | **SÍ** | Agregación mensual y totales coincidentes. |
| **Monitoreo Tanques** | `ProviderEquipmentApi.tanks()` | `ProviderTanksController` | **SÍ** | Mapeo exacto de `levelPercent`, `capacity` y `critical`. |
| **Telemetría 48h** | `ProviderEquipmentApi.readings()` | `ProviderTankReadingsController` | **SÍ** | Admite parámetro ISO `from`. |
| **Aceptar Solicitud** | `OrderingApi.acceptRequest()` | `ReplenishmentAcceptanceController` | **SÍ** | Ejecuta transacción atómica creando `FuelOrder`. |
| **Rechazar Solicitud**| `OrderingApi.rejectRequest()` | `ReplenishmentRequestsController` | **SÍ** | Requiere DTO `{ reason: string }`. |
| **Asignación Despacho**| `FulfillmentApi.assignDelivery()`| `DeliveryAssignmentController` | **SÍ** | Soporta `commandId` (idempotencia) y ventana horaria. |
| **Recomendación IA** | `FulfillmentApi.recommendation()`| `DeliveryRecommendationController` | **SÍ** | Retorna el par óptimo conductor-cisterna. |
| **Transiciones Entrega**| `DeliveryApiEndpoint.command()`| `DeliveriesController` | **SÍ** | Endpoints `/start`, `/arrive`, `/complete`, `/fail`. |
| **Geocercas** | `DeliveryApiEndpoint.geofence()`| `GeofencePoliciesController` | **SÍ** | Crea política espacial para custodia de válvula. |
| **Observaciones Válvula**| `...valveObservations()` | `DeliveryValveObservationsController` | **SÍ** | Lecturas de estado de válvula en descarga. |
| **Pagos Proveedor** | `OrderingApi.providerPayments()`| `PaymentsController` | **SÍ** | Filtros de fecha y estado de pago. |

### 11.2 Interceptores y Manejo de Errores
- **Bearer Token Injection:** El interceptor [auth.interceptor.ts](file:///c:/Users/alanj/Downloads/Fun%20de%20Arquitectura%20Software/frontend-main/frontend-main/src/app/iam/infrastructure/auth.interceptor.ts) inyecta de forma transparente el encabezado `Authorization: Bearer <token>` únicamente a peticiones dirigidas al `serverBasePath`, omitiendo endpoints de autenticación y recursos estáticos de traducción.
- **Detección de Expiración JWT:** En caso de recibir un error 401, el interceptor decodifica el payload JWT y verifica si el campo `exp * 1000 <= Date.now()`. Solo ejecuta el logout automático si el token expiró cronológicamente, evitando desloguear al usuario si el 401 fue producto de una denegación de permisos puntual.
- **Sanitización de Logs:** La función `logHttpError()` protege la seguridad operacional omitiendo tokens de invitación, contraseñas y cuerpos de payload en la consola del navegador.

---

## 12. ESTADO DE LA APLICACIÓN

- **Adopción de Signals:** No se requiere NgRx o Redux pesado; el proyecto utiliza la arquitectura moderna de Signals (`signal`, `computed`, `effect`). Esto ofrece un rendimiento óptimo de detección de cambios (OnPush por defecto y Zoneless-ready).
- **Prevención de Fugas de Memoria (Memory Leaks):**
  - Todas las suscripciones HttpClient en vistas y componentes utilizan de forma disciplinada `takeUntilDestroyed(this.destroyRef)` o se cancelan explícitamente mediante `.unsubscribe()` al recibir nuevos parámetros de ruta.
  - Implementación de `productsSequence` en [tank-detail.ts](file:///c:/Users/alanj/Downloads/Fun%20de%20Arquitectura%20Software/frontend-main/frontend-main/src/app/equipment/presentation/views/tank-detail/tank-detail.ts#L63) para descartar respuestas asíncronas desfasadas (evitando condiciones de carrera tipo race conditions al cambiar de proveedor rápidamente).

---

## 13. SEGURIDAD Y CONTROL DE ACCESO (RBAC)

### 13.1 Guardas de Ruta
Se auditaron las guardas implementadas en [auth.guard.ts](file:///c:/Users/alanj/Downloads/Fun%20de%20Arquitectura%20Software/frontend-main/frontend-main/src/app/iam/infrastructure/auth.guard.ts):
- `authGuard`: Comprueba la existencia de token válido; redirige a `/login` preservando el `returnUrl`.
- `buyerGuard`: Restringe rutas exclusivas del comprador (`ROLE_BUYER`): `/tanks`, `/ordering/request-form`, `/ordering/payment-history`.
- `providerGuard`: Restringe rutas del distribuidor (`ROLE_PROVIDER`): `/fulfillment`, `/clients`, `/payments`.
- `adminGuard`: Restringe `/admin` al rol `ROLE_ADMIN`.
- `supportedRoleGuard`: Bloquea usuarios sin rol soportado o con sesión corrupta, redirigiendo a `/access-denied`.

### 13.2 Seguridad en Vistas
El layout y los botones de acción aplican renderizado condicional según el rol (`@if (iam.isBuyer())` / `@if (iam.isProvider())`). No obstante, se verificó que la seguridad es respaldada en el backend por Spring Security; invocar manualmente endpoints restringidos desde la consola retorna 403 Forbidden.

---

## 14. FORMULARIOS Y VALIDACIONES

- **Validación Estricta:** Formularios clave como [request-form](file:///c:/Users/alanj/Downloads/Fun%20de%20Arquitectura%20Software/frontend-main/frontend-main/src/app/ordering/presentation/views/request-form/request-form.ts), [provider-tank-form](file:///c:/Users/alanj/Downloads/Fun%20de%20Arquitectura%20Software/frontend-main/frontend-main/src/app/equipment/presentation/views/provider-tank-form/provider-tank-form.ts) y [register](file:///c:/Users/alanj/Downloads/Fun%20de%20Arquitectura%20Software/frontend-main/frontend-main/src/app/iam/presentation/views/register/register.ts) validan obligatoriedad, longitudes (RUC de 11 dígitos), tipos numéricos positivos y coincidencia de patrones.
- **Prevención de Doble Envío:** Todos los botones de confirmación crítica implementan `[disabled]="submitting() || form.invalid"`, impidiendo duplicidad de transacciones por clics repetidos.
- **Reglas de Negocio en Formularios:** En el formulario de política de tanque ([tank-detail.ts](file:///c:/Users/alanj/Downloads/Fun%20de%20Arquitectura%20Software/frontend-main/frontend-main/src/app/equipment/presentation/views/tank-detail/tank-detail.ts#L76-L84)), el frontend valida que `lowLevelPercent + hysteresisPercent <= 100`, reflejando exactamente las invariantes del agregado de dominio del backend.

---

## 15. ESTADOS DE INTERFAZ DE USUARIO (UI STATES)

Se auditaron las vistas principales comprobando la existencia de los 6 estados fundamentales:
1. **Loading:** Spinners circulares Material (`<mat-spinner diameter="32">`) y barras indeterminadas durante la espera de respuesta.
2. **Success:** Mensajes temporales de éxito, banners estilizados (`.dl-notice`) y navegación fluida con actualización reactiva de listas.
3. **Empty State:** Vistas sin registros muestran contenedores dedicados (`.dl-empty` o `.pv-note`) con textos claros (`common.no-data`, `equipment.no-tanks`, `analytics.no-orders`) invitando a la acción inicial.
4. **Error:** Banners de alerta con mensajes decodificados del backend y botones de reintento (`Retry / Reintentar`).
5. **Unauthorized:** Vista dedicada `/access-denied` con botón de retorno al login o dashboard.
6. **Not Found:** Vista `/page-not-found` para rutas inexistentes o IDs no encontrados.

---

## 16. DISEÑO VISUAL Y SISTEMA DE DISEÑO

- **Identidad Cromática:** Paleta profesional B2B dominada por azul marino corporativo (`#1e3a8a`), fondos neutros de contraste (`#f7f8fb`), grises de borde estructurados (`#e5e7eb`) y semáforo de estados:
  - Naranja suave / Ámbar (`#fff1d6` / `#7a4100`): Pendientes de atención / Aprobación.
  - Azul suave (`#e6edff` / `#1e3a8a`): Despachado, En Ruta, Asignado.
  - Verde esmeralda (`#dff3e6` / `#14532d`): Pagado, Entregado, Completado.
  - Rojo carmesí (`#fde8e8` / `#8a1c1c`): Rechazado, Cancelado, Fallido, Crítico.
- **Tipografía y Componentes:** Empleo de la fuente `Roboto` (Google Fonts) y Angular Material Components (Cards, Buttons, Chips, Tooltips, Tables, Dialogs).
- **Cero Emojis:** Todos los elementos gráficos utilizan íconos vectoriales oficiales de **Material Symbols / Material Icons** (`oil_barrel`, `local_shipping`, `inventory_2`, `shopping_cart`, `dashboard`).

---

## 17. RESPONSIVE Y ADAPTABILIDAD

- **Container Queries Modernos:** En [styles.css](file:///c:/Users/alanj/Downloads/Fun%20de%20Arquitectura%20Software/frontend-main/frontend-main/src/styles.css#L62-L71), las tablas operativas utilizan `@container (max-width: 900px)` para transformarse automáticamente de formato tabular a tarjetas apiladas tipo tarjeta de inspección en pantallas estrechas.
- **Navegación Móvil Adaptativa:** El menú lateral `MatSidenav` commuta automáticamente entre modo persistente (`side`) en pantallas de escritorio (>768px) y modo superpuesto (`over`) con cierre automático al navegar en tabletas y teléfonos.

---

## 18. ACCESIBILIDAD (A11Y)

- **HTML Semántico:** Empleo sistemático de etiquetas `<main>`, `<header>`, `<section>`, `<article>`, `<nav>`, `<dl>`, `<dt>` y `<dd>`.
- **Atributos ARIA:** Uso de `role="status"`, `role="alert"`, `aria-label`, `aria-expanded`, `aria-controls` y `aria-invalid`.
- **Navegación por Teclado:** Reglas explícitas de `:focus-visible` con contorno de 2px en azul corporativo.
- **Movimiento Reducido:** Soporte para usuarios sensibles al movimiento mediante `@media (prefers-reduced-motion: reduce)`.

---

## 19. PERFORMANCE Y RENDIMIENTO

- **Build de Producción Exitoso:** `ng build` completado sin errores de compilación ni fallos de tipado estricto.
- **Code Splitting Efectivo:** Más de 50 chunks lazy-loaded generados, aislando cada pantalla y reduciendo la carga diferida.
- **Observación de Presupuesto (Budget Warning):** El bundle inicial generado es de **804.19 kB**, excediendo el límite configurado en `angular.json` (500 kB). Esto se debe a la inclusión conjunta de Chart.js y Angular Material en el bundle principal. Debe ajustarse el budget en `angular.json` a 1 MB o diferir la carga de Chart.js.

---

## 20. INTERNACIONALIZACIÓN (I18N)

- **Soporte Bilingüe Completo:** Integración de `@ngx-translate/core` con archivos sincronizados [es.json](file:///c:/Users/alanj/Downloads/Fun%20de%20Arquitectura%20Software/frontend-main/frontend-main/public/i18n/es.json) y [en.json](file:///c:/Users/alanj/Downloads/Fun%20de%20Arquitectura%20Software/frontend-main/frontend-main/public/i18n/en.json) (1,234 líneas y más de 1,050 claves traducidas).
- **Conmutador Reactivo:** Componente `LanguageSwitcher` presente en la barra superior que conmuta el idioma en tiempo de ejecución sin recargar la página.
- **Cabecera HTTP:** El interceptor inyecta dinámicamente `Accept-Language: es` o `en` en cada petición API.

---

## 21. TRAZABILIDAD DOCUMENTAL COMPLETA

```
Requerimiento Documental (TB2)
   │
   ├─► US-50: "Configurar umbral crítico IoT"
   │    └─► Pantalla: /clients/:buyerId/tanks/:tankId/edit
   │         └─► Componente: ProviderTankForm
   │              └─► Servicio: ProviderEquipmentApi.updateTank()
   │                   └─► Endpoint: PUT /api/provider/tanks/:id
   │                        └─► Backend: ProviderTankManagementController.updateTank()
   │
   ├─► US-11: "Aceptar solicitud de abastecimiento"
   │    └─► Pantalla: /ordering/request-detail/:id
   │         └─► Componente: RequestDetail
   │              └─► Servicio: OrderingApi.acceptRequest()
   │                   └─► Endpoint: POST /api/replenishment-requests/:id/accept
   │                        └─► Backend: ReplenishmentAcceptanceController.accept()
   │
   ├─► US-49: "Asignar conductor y cisterna a despacho"
   │    └─► Pantalla: /ordering/order-detail/:id
   │         └─► Componente: OrderDetail
   │              └─► Servicio: FulfillmentApi.assignDelivery()
   │                   └─► Endpoint: POST /api/deliveries
   │                        └─► Backend: DeliveryAssignmentController.assignDelivery()
   │
   └─► US-52: "Telemetría y seguimiento del despacho"
        └─► Pantalla: /fulfillment/delivery-detail/:id
             └─► Componente: DeliveryDetail
                  └─► Servicio: FulfillmentApi.tracking() / samples() / valveObservations()
                       └─► Endpoints: GET /api/deliveries/:id/tracking, /valve-observations
                            └─► Backend: DeliveryTrackingQueryController / ValveObservationsController
```

---

## 22. DEMO RECOMENDADA PARA SUSTENTACIÓN UPC

Para impactar positivamente al jurado evaluador, se recomienda ejecutar el siguiente **flujo operativo en vivo**, demostrando que la arquitectura no es estática:

1. **Paso 1: Inicio de Sesión y Rol (IAM)**
   - Iniciar sesión como Distribuidor (`proveedor@fuelguard.pe` / credenciales configuradas).
   - Demostrar el RBAC: mostrar cómo el menú expone *Despacho*, *Clientes y Tanques*, *Pagos* y *Tablero*, inaccesibles para un comprador.
2. **Paso 2: Tablero de Control y Monitoreo IoT (Dashboard)**
   - Navegar a `/dashboard`.
   - Mostrar KPIs reales (Ventas totales, galones entregados, órdenes activas).
   - Mostrar el gráfico interactivo de tendencia de ventas (conmutar entre Día, Semana y Mes).
   - En la tarjeta **Tanques Críticos**, mostrar cómo el sistema destaca los tanques que cruzaron el umbral configurado (ej. 15% restante).
3. **Paso 3: Telemetría de Tanques (Equipment)**
   - Hacer clic en el tanque crítico desde el Dashboard para abrir `/clients/tank/:id`.
   - Explicar la gráfica de nivel de las últimas 48 horas y la detección de lectura reciente.
   - Mostrar el historial de episodios de reposición disparados por el hardware.
4. **Paso 4: Solicitud Automática e Inbox (Ordering)**
   - Ir a `/ordering/request-list` (o Inbox en Dashboard).
   - Mostrar la solicitud con etiqueta `AUTOMATIC` originada por el umbral del sensor.
   - Abrir `/ordering/request-detail/:id`.
   - Explicar el principio arquitectónico **Human-in-the-Loop** (el sistema sugiere, pero el humano aprueba).
   - Hacer clic en **Aceptar**. Mostrar cómo la solicitud pasa a `ACCEPTED` y genera automáticamente la Orden vinculada `#orderId`.
5. **Paso 5: Asignación de Recursos con Recomendación IA (Fulfillment)**
   - Ingresar al detalle de la orden generada `/ordering/order-detail/:id`.
   - Abrir el panel de asignación.
   - Mostrar la llamada a la API de **Recomendación Inteligente**: presionar *"Usar recomendación"* para que el sistema complete automáticamente el conductor habilitado y la cisterna compatible en volumen y fecha.
   - Mostrar que las cisternas con menor capacidad al pedido aparecen deshabilitadas con advertencia.
   - Confirmar asignación. El sistema navega a `/fulfillment/delivery-detail/:id`.
6. **Paso 6: Trazabilidad Física de Entrega (Tracking & Safety)**
   - En `/fulfillment/delivery-detail/:id`, mostrar la vinculación del viaje con la Geocerca de seguridad.
   - Ejecutar la transición de despacho: presionar **"Iniciar Viaje"** (estado `STARTED`).
   - Mostrar el enlace a Google Maps en vivo y el monitoreo de válvulas de descarga.
   - Registrar la descarga efectiva presionando **"Completar Entrega"** con el volumen final verificado.
7. **Paso 7: Conmutación de Idioma y Accesibilidad**
   - Demostrar el soporte bilingüe conmutando a Inglés desde el navbar para validar el cumplimiento de requisitos no funcionales.

---

## 23. MATRIZ FINAL DE AUDITORÍA

| Área | Cumple | Parcial | Faltante | Inconsistente | Prioridad Global |
|---|:---:|:---:|:---:|:---:|---|
| **Navegación y Layout** | **X** | | | | **P2** |
| **Dashboard** | **X** | | | | **P1** |
| **IoT / Monitoreo de Tanques** | | **X** | | | **P1** |
| **Flujo de Pedidos / Solicitudes** | **X** | | | | **P0** |
| **Conductores** | **X** | | | | **P1** |
| **Cisternas** | **X** | | | | **P1** |
| **Entregas y Trazabilidad** | **X** | | | | **P0** |
| **Autenticación (IAM)** | **X** | | | | **P1** |
| **Autorización (Guards/Roles)** | **X** | | | | **P1** |
| **Integración API Backend** | **X** | | | | **P0** |
| **User Stories de Negocio** | | **X** | | | **P1** |
| **Landing Page / Visitas** | | | **X** | | **P1** |
| **UX / UI States** | **X** | | | | **P2** |
| **Responsive Design** | **X** | | | | **P2** |
| **Accesibilidad (A11y)** | **X** | | | | **P2** |
| **Internacionalización (i18n)** | **X** | | | | **P2** |
| **Branding / Nomenclatura** | | | | **X** | **P0** |

---

## 24. PLAN DE ACCIÓN Y CAMBIOS PRIORITARIOS

A continuación se detallan las no conformidades clasificadas por su nivel de severidad e impacto para la sustentación:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        NIVELES DE PRIORIDAD                            │
├────────────┬───────────────────────────────────────────────────────────┤
│  P0        │ CRÍTICO — Impide la sustentación o contradice documentos  │
│  P1        │ ALTO — Requisitos funcionales clave incompletos           │
│  P2        │ MEDIO — Calidad, coherencia y pulido de experiencia       │
│  P3        │ BAJO — Optimizaciones menores visuales o técnicas         │
└────────────┴───────────────────────────────────────────────────────────┘
```

### 🔴 P0 — CRÍTICO

#### 1. Inconsistencia de Rebranding: `FullTank` vs `FuelGuard`
- **Descripción:** El informe oficial y la sustentación definen el producto como **FuelGuard**. Sin embargo, en el código fuente frontend persiste el nombre original **FullTank** en múltiples ubicaciones críticas.
- **Evidencia en Código:**
  - `src/app/app.routes.ts`, Línea 41: `const baseTitle = 'FullTank';`
  - `src/index.html`, Línea 5: `<title>FrontedFullTank</title>`
  - `package.json`, Línea 2: `"name": "fronted-full-tank"`
  - `angular.json`, Línea 10: `"Fronted-FullTank"`
  - `src/app/iam/application/iam.store.ts`, Líneas 8-9: `const STORAGE_KEY = 'fulltank.session';`
- **Requisito Documental:** TB2 Capítulo 1.2.1 ("Nombre del Producto: FuelGuard").
- **Solución Propuesta:** Realizar un refactor de cadenas para unificar la marca a **FuelGuard** en títulos, constantes de sesión y metadatos del build.
- **Impacto:** Si el evaluador abre el inspector o mira las pestañas del navegador durante la demo y observa "FrontedFullTank", penalizará la presentación por falta de coherencia con el informe escrito.

#### 2. Configuración de API en Producción con URL Inactiva/Placeholder
- **Descripción:** El archivo de entorno de producción apunta a un host obsoleto de Render: `https://fulltank-backend.onrender.com/api`.
- **Evidencia en Código:** `src/environments/environment.ts`, Línea 5: `serverBasePath: 'https://fulltank-backend.onrender.com/api'`.
- **Requisito Documental:** TB2 Capítulo 4.2.4 (Despliegue y operatividad de la solución).
- **Solución Propuesta:** Configurar la URL real del backend desplegado en la nube o asegurar que en modo local se ejecute con `ng serve --configuration development` (que apunta a `http://localhost:8080/api`).
- **Impacto:** Un despliegue a producción fallará de inmediato al no poder conectar con el backend.

---

### 🟠 P1 — ALTO

#### 3. Landing Page Incompleta en el Repositorio Frontend (EP01)
- **Descripción:** El componente [home.html](file:///c:/Users/alanj/Downloads/Fun%20de%20Arquitectura%20Software/frontend-main/frontend-main/src/app/shared/presentation/views/home/home.html) y [about.html](file:///c:/Users/alanj/Downloads/Fun%20de%20Arquitectura%20Software/frontend-main/frontend-main/src/app/shared/presentation/views/about/about.html) representan únicamente un placeholder mínimo de presentación. Faltan las secciones de testimonios (US-37), planes de precios (US-38), cómo funciona (US-03) y formulario de contacto (US-04).
- **Evidencia en Código:** `src/app/shared/presentation/views/home/home.html` (27 líneas) y `about.html` (6 líneas).
- **Requisito Documental:** Épica EP01 (Historias US-01, US-02, US-03, US-04, US-36, US-37, US-38, US-25).
- **Solución Propuesta:** Dado que el equipo mantiene un proyecto separado para la landing (`landing-page-main`), se debe enlazar la landing externa o integrar sus componentes en la vista pública de Angular.
- **Impacto:** Pregunta segura del jurado sobre dónde están los entregables de la Épica 1 listados en el Product Backlog.

#### 4. Exportación de Reportes PDF y Analítica por Sector Faltantes (US-35 / US-48)
- **Descripción:** La pantalla `/analytics` ofrece gráficos de barras mensuales, pero no cuenta con la función de descarga de reporte consolidado en PDF (US-35) ni el desglose de ventas por sector industrial del cliente (US-48).
- **Evidencia en Código:** `src/app/analytics/presentation/views/analytics/analytics.ts` (solo consume `monthlySpending` o `monthlyRevenue`).
- **Requisito Documental:** Historias de usuario US-14, US-35 y US-48 (Épica EP14).
- **Solución Propuesta:** Agregar una biblioteca ligera de generación de PDF (ej. `jspdf` o `html2pdf`) o un botón que active una plantilla de impresión formateada para reportes, y desplegar un gráfico de dona/torta con la distribución por sector obtenida desde `/api/provider/buyer-companies`.
- **Impacto:** Brecha de cumplimiento en el módulo de reporting ante preguntas de fiscalización de inventarios (OSINERGMIN).

---

### 🟡 P2 — MEDIO

#### 5. Ausencia del Estado Intermedio "Advertencia" en Tanques
- **Descripción:** El frontend clasifica los tanques únicamente como `Normal` o `Crítico` (mediante `t.critical`). La documentación y el sentido común de telemetría IoT exigen tres niveles: *Normal* (óptimo), *Advertencia* (entre umbral crítico y crítico + margen de histéresis) y *Crítico* (≤ umbral de reposición).
- **Evidencia en Código:** `src/app/equipment/presentation/views/provider-tank-detail/provider-tank-detail.html`, Línea 21: `[class.critical]="t.critical"`.
- **Requisito Documental:** TB2 Capítulo 1.1 y Sección 6 de la auditoría.
- **Solución Propuesta:** Implementar una propiedad calculada en el modelo de tanque:
  ```typescript
  statusLevel(): 'normal' | 'warning' | 'critical' {
    if (this.critical || this.levelPercent <= this.lowLevelPercent) return 'critical';
    if (this.levelPercent <= this.lowLevelPercent + 15) return 'warning';
    return 'normal';
  }
  ```
  y reflejar el color ámbar en la barra vertical y badges.
- **Impacto:** Mejora sustancial en la fidelidad del prototipo frente al marco teórico de monitoreo IoT.

#### 6. Exceso de Presupuesto Inicial de Build (Budget Warning)
- **Descripción:** La advertencia de compilación `▲ [WARNING] bundle initial exceeded maximum budget (804.19 kB vs 500 kB)` puede provocar penalizaciones de rendimiento en conexiones lentas.
- **Evidencia en Código:** Log de `npm run build` y configuración de `angular.json` (Línea 38).
- **Solución Propuesta:** Aumentar el umbral de advertencia a 1MB en `angular.json` o diferir la importación de `Chart.js` y `BaseChartDirective` exclusivamente a las vistas que lo utilizan.
- **Impacto:** Calidad del código y cumplimiento de métricas Lighthouse.

---

### 🟢 P3 — BAJO

#### 7. Atributo de Idioma Fijo en HTML Principal
- **Descripción:** `src/index.html` contiene `<html lang="en">`, aunque el idioma predeterminado de la plataforma es Español (`es`).
- **Evidencia en Código:** `src/index.html`, Línea 2.
- **Solución Propuesta:** Cambiar a `<html lang="es">` o sincronizar el atributo dinámicamente mediante `TranslateService.onLangChange`.
- **Impacto:** Cumplimiento formal de SEO y lectores de pantalla (accesibilidad).

---

## 25. CONCLUSIÓN

El frontend de **FuelGuard** demuestra una **madurez técnica y arquitectónica de nivel senior**, destacando por:
- Un desacoplamiento estricto por Bounded Contexts alineado con Domain-Driven Design.
- Una integración verídica, reactiva y robusta con los microservicios/módulos del backend Spring Boot.
- Lógica de negocio avanzada en el cliente (normalización de unidades volumétricas, prevención de pedidos duplicados con UUIDs de idempotencia, algoritmos de selección inteligente de flota y adaptabilidad responsive con Container Queries).

Subsanando los cambios prioritarios de branding (P0: unificar a FuelGuard), aclarando la separación del repositorio de la Landing Page (P1) y complementando el módulo de reportes (P1), el sistema se encuentra en **óptimas condiciones técnicas para una sustentación sobresaliente ante el jurado de la UPC**.
