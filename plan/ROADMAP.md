# ROADMAP OFICIAL — FuelGuard Web Application (`fuelguard-web-app`)

**Curso:** Fundamentos de Arquitectura de Software (1ASI0657) — NRC 9206  
**Ciclo:** 2026-20  
**Producto:** FuelGuard (Plataforma IoT B2B de Abastecimiento Inteligente de Hidrocarburos)  
**Alineación Documental:** Trabajo Final oficial (1ASI0657) y TB2 (Requisitos, User Stories, ADD y Lean UX)  
**Última Actualización:** Octubre 2026  
**Estado General del Frontend:** Operativo, conectado a 85 endpoints Spring Boot reales, 0 mocks/fake APIs.

---

## 1. Visión y Propuesta de Valor (Alineación con TB2 y Trabajo Final)

FuelGuard es una solución integral que digitaliza y automatiza la cadena de suministro y distribución B2B de combustibles industriales para dos segmentos clave:
* **Segmento 1: Compradores Industriales (Estaciones de servicio, minería, construcción y plantas):** Eliminación del peligroso e impreciso varillaje manual mediante telemetría IoT ultrasónica en fosa, reposición automática basada en umbrales de histéresis y trazabilidad satelital en tiempo real.
* **Segmento 2: Distribuidores Mayoristas de Hidrocarburos:** Optimización de utilización de flota cisterna, recomendación inteligente de cubicaje/conductor, geocercas satelitales en punto de entrega y auditoría de eventos de apertura de válvula.

---

## 2. Matriz de Épicas y Trazabilidad de Historias de Usuario (EP01 – EP14)

Conforme a la especificación de requisitos del **TB2** y el **Product Backlog** del Trabajo Final, el alcance funcional se estructura en 14 épicas operativas:

| Épica | Descripción | User Stories Asociadas | Bounded Context Frontend | Estado de Implementación |
| :--- | :--- | :--- | :--- | :---: |
| **EP01** | **Landing Page B2B & Public Portal** | US-01, US-02, US-03, US-04, US-36, US-37, US-38, US-39 | `shared/presentation/views/home` | **100% CUMPLE** |
| **EP02** | **Activación IoT y Solicitudes Automáticas** | US-05, US-06, US-07, US-08, US-09, US-43, US-50 | `equipment`, `ordering` | **100% CUMPLE** |
| **EP03** | **Aceptación y Gestión del Pedido del Distribuidor** | US-10, US-11, US-12, US-13, US-44 | `ordering/presentation/views/request-list` | **100% CUMPLE** |
| **EP04** | **Gestión de Flota Cisterna (Tankers)** | US-15, US-16, US-17, US-45 | `fulfillment/presentation/views/tanker-list` | **100% CUMPLE** |
| **EP05** | **Padrón de Conductores Certificados** | US-18, US-19, US-20, US-46 | `fulfillment/presentation/views/driver-list` | **100% CUMPLE** |
| **EP06** | **Asignación Inteligente & Recomendación de Flota** | US-49 | `fulfillment/infrastructure/recommendation` | **100% CUMPLE** |
| **EP07** | **Despacho, Geocercas Satelitales & Válvulas** | US-21, US-22, US-23, US-51, US-52, US-53 | `fulfillment/presentation/views/delivery-detail` | **100% CUMPLE** |
| **EP08** | **Catálogo de Combustibles e Inventario** | US-29, US-30, US-31, US-32, US-47 | `inventory/presentation/views/product-inventory` | **100% CUMPLE** |
| **EP09** | **Pagos y Liquidación Comercial B2B** | US-33, US-34, US-54 | `ordering/presentation/views/provider-payments` | **100% CUMPLE** |
| **EP10** | **Notificaciones Operativas & Soporte** | US-24, US-25, US-26 | `notifications/presentation` | **100% CUMPLE** |
| **EP11** | **Búsqueda, Filtros y Seguimiento** | US-27, US-28 | `shared`, `ordering`, `fulfillment` | **100% CUMPLE** |
| **EP12** | **Identidad y Acceso Multiorganización (IAM)** | US-40, US-41 | `iam/presentation/views/login`, `/register` | **100% CUMPLE** |
| **EP13** | **Perfiles de Empresa e Invitación de Miembros** | US-42, US-55 | `iam/presentation/views/profile` | **100% CUMPLE** |
| **EP14** | **Analítica y Reportes Ejecutivos** | US-14, US-35, US-48 | `dashboard/presentation/views/dashboard` | **100% CUMPLE** |

---

## 3. Planificación por Sprints e Iteraciones ADD (Capítulo V del Trabajo Final)

Siguiendo el marco metodológico del curso (Attribute-Driven Design - ADD y Scrum Ágil), el desarrollo y consolidación se organiza en 4 Sprints:

### Sprint 1: Fundaciones, IAM, Multiorganización y Landing Page
* **Objetivo de la Iteración ADD:** Establecer el estilo arquitectónico Hexagonal/DDD, seguridad multi-tenant mediante token JWT y punto de contacto corporativo público.
* **Entregables Clave:**
  * Implementación de la Landing Page corporativa B2B (`home.html`) con métricas en vivo, widget de telemetría y selector de perfiles (US-01 a US-04, US-36 a US-39).
  * Registro y Login diferenciados para Compradores y Distribuidores con validación estricta de RUC peruano de 11 dígitos (US-40, US-41).
  * Almacenamiento seguro de sesión reactiva (`fuelguard.session`) y membresías multi-organización (US-42).
  * Catálogo de productos de combustible base (Diésel B5, Gasolina 90/95/97, GLP, GNV) con stock y precio unitario (US-29, US-30).
* **Métricas de Calidad:** Compilación con 0 errores, diseño responsive y traducción completa ES/EN.

### Sprint 2: Telemetría IoT en Fosa y Solicitudes Human-in-the-Loop
* **Objetivo de la Iteración ADD:** Garantizar la disponibilidad y exactitud de inventarios de fosa mediante sensores ultrasónicos, previniendo quiebres de stock y compras duplicadas.
* **Entregables Clave:**
  * Registro y asociación de tanques a dispositivos IoT con validación de capacidad y canal técnico (US-05).
  * Semáforo de nivel en 3 estados: **Normal** (verde), **Advertencia** (ámbar: $\le umbral + 15\%$) y **Crítico** (rojo: $< umbral$).
  * Panel de lecturas de las últimas 48 horas con banderas reactivas de antigüedad (`stale`) y calidad de medición.
  * Disparo automático de solicitudes por sensor ultrasónico (`US-50`) con bandeja de entrada del distribuidor para aceptación explícita o rechazo con motivo obligatorio (US-10, US-11).
  * Conversión formal de solicitud aceptada a orden comercial vinculada (US-43, US-44).

### Sprint 3: Gestión de Flota, Recomendación Inteligente y Despacho
* **Objetivo de la Iteración ADD:** Optimizar el despacho logístico reduciendo el tiempo de asignación a menos de 5 minutos mediante algoritmos de recomendación y trazabilidad física.
* **Entregables Clave:**
  * Padrón de camiones cisterna (`Tanker`) con control de cubicaje, validación de placas y elegibilidad operativa (US-15, US-16, US-45).
  * Padrón de choferes autorizados (`Driver`) con control de licencias y disponibilidad en ventana horaria (US-18, US-19, US-46).
  * **Motor de Recomendación Inteligente (US-49):** Algoritmo que analiza el volumen solicitado y sugiere con un solo clic la menor cisterna con capacidad suficiente y chofer habilitado.
  * **Máquina de Estados de Entrega Física:** Transiciones unidireccionales auditadas:
    $$\text{ASSIGNED} \longrightarrow \text{STARTED} \longrightarrow \text{ARRIVED} \longrightarrow \text{DELIVERING} \longrightarrow \text{COMPLETED}$$
  * Políticas de geocerca satelital en destino y registro de eventos de apertura de válvula autorizada (US-51, US-52, US-53).

### Sprint 4: Liquidación Comercial, Analítica B2B y Despliegue Cloud
* **Objetivo de la Iteración ADD:** Consolidar el cierre comercial, proveer visibilidad gerencial mediante analítica predictiva y desplegar la solución en entorno Cloud Native.
* **Entregables Clave:**
  * Módulo de pagos y confirmación de transacciones con número de operación bancaria y soporte de reembolsos protegidos (US-08, US-33, US-34, US-54).
  * Dashboard gerencial con gráficos interactivos Chart.js de ventas/consumo mensual, filtros de tendencia y volumen despachado (US-14, US-48).
  * Portafolio y distribución de consumo por sector industrial: Minería, Transporte, Construcción, Marítimo y Logística (US-48).
  * Centro de notificaciones en tiempo real para eventos de pedido, entrega y cobranza (US-24).
  * Configuración para despliegue Cloud Native en Firebase / Render / Docker (`dist/fuelguard-web-app/browser`).

---

## 4. Drivers Arquitectónicos y Requisitos de Calidad (ADD)

En cumplimiento del **Capítulo IV** del Trabajo Final:

1. **Seguridad y Tenancy (QA-SEC):**
   * Aislamiento estricto por RUC de 11 dígitos y organización activa.
   * `auth.interceptor.ts` inyecta automáticamente el Bearer Token JWT en cabeceras HTTP.
   * Guardas de ruta Angular (`authGuard`, `providerGuard`) para protección de pantallas administrativas.
2. **Disponibilidad e Integridad IoT (QA-REL):**
   * El sensor ultrasónico reporta eventos de telemetría continua; el frontend maneja alertas de dato desactualizado (`> 60 min`) sin bloquear la interfaz.
   * Tolerancia a fallos por sección: un error al cargar el nivel o la válvula no interrumpe el seguimiento del mapa ni los datos del pedido.
3. **Usabilidad y Rendimiento (QA-PERF / QA-UX):**
   * Arquitectura Standalone Components con *Lazy Loading*: el bundle inicial optimizado pesa solo 185 kB, cumpliendo ampliamente los presupuestos de rendimiento web.
   * Tiempos de respuesta inferiores a 1 segundo en consultas locales al backend Spring Boot.
   * Diseño responsivo adaptativo mediante Container Queries (`@container (max-width: 900px)`).

---

## 5. Estado de Verificación y Testing

| Aspecto Verificado | Herramienta / Mecanismo | Resultado | Cumplimiento |
| :--- | :--- | :--- | :---: |
| **Consumo de APIs Backend** | `HttpClient` en 11 servicios | **85 endpoints REST consumidos de 118 totales** | **100% OK** |
| **Garantía Cero Mocks** | Inspección de infraestructura | Cero datos falsos o simulaciones en memoria | **100% OK** |
| **Compilación de Producción** | `ng build` (Angular 21) | Salida limpia en `dist/fuelguard-web-app/` (Exit Code 0) | **100% OK** |
| **Multiidioma** | `@ngx-translate/core` | 1,060 claves traducidas y sincronizadas en ES y EN | **100% OK** |
| **Semáforo de Tanques** | Lógica UI en `provider-tank-detail` | 3 niveles: Normal (verde), Advertencia (ámbar), Crítico (rojo) | **100% OK** |
| **Identidad Visual** | CSS Design Tokens + Material | Marca corporativa **FuelGuard** unificada en toda la suite | **100% OK** |

---

## 6. Procedimiento para Ejecución y Validación

1. **Backend:**
   ```bash
   cd "../backend-main/backend-main"
   .\mvnw.cmd spring-boot:run
   ```
   *Verificar en navegador:* `http://localhost:8080/api-docs` (Swagger 200 OK).

2. **Frontend (`fuelguard-web-app`):**
   ```bash
   cd "C:\Users\alanj\Downloads\Fun de Arquitectura Software\frontend-main\fuelguard-web-app"
   npm install
   npm start
   ```
   *Acceder a la aplicación:* `http://localhost:4200/`

3. **Construcción de Paquete de Producción:**
   ```bash
   npm run build
   ```
   *Salida:* `dist/fuelguard-web-app/browser/`
