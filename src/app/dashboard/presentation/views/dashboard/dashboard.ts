import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { ChartData, ChartOptions } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { TranslatePipe } from '@ngx-translate/core';
import { IamStore } from '../../../../iam/application/iam.store';
import { Order, OrderStatus } from '../../../../ordering/domain/model/order.entity';
import { Request } from '../../../../ordering/domain/model/request.entity';
import { OrderingApi } from '../../../../ordering/infrastructure/ordering-api';
import { BuyerAnalytics, ProviderAnalytics } from '../../../../analytics/domain/model/analytics.entity';
import { AnalyticsApi } from '../../../../analytics/infrastructure/analytics-api';
import { ProviderEquipmentApi } from '../../../../equipment/infrastructure/provider-equipment.api';
import { ProviderTank } from '../../../../equipment/domain/model/provider-equipment.entity';
import { FulfillmentApi } from '../../../../fulfillment/infrastructure/fulfillment-api';
import { ProviderDelivery } from '../../../../fulfillment/domain/model/provider-delivery.entity';
import { TrendGranularity, groupSalesTrend } from '../../../../analytics/domain/sales-trend';

/** Hoy (yyyy-MM-dd) en America/Lima, no en UTC. */
// El locale 'en-CA' se usa porque formatea la fecha como yyyy-MM-dd, el formato que espera el backend
const todayLima = () => new Date().toLocaleDateString('en-CA', { timeZone: 'America/Lima' });

/** Estado independiente por tarjeta: una falla no oculta el resto del panel. */
interface Card<T> { loading: boolean; error: boolean; data: T }

// Máximo de tanques críticos que se muestran en el panel
const CRITICAL_LIMIT = 5;

// Indicador (KPI) mostrado en las tarjetas superiores del dashboard
// - label: clave de traducción del título
// - value: valor numérico a mostrar
// - money: si es true, se formatea como moneda
// - hint: clave de traducción de un texto de ayuda opcional
interface Kpi { label: string; value: number; money?: boolean; hint?: string }

/** Resumen operativo de comprador y proveedor. El análisis mensual vive en /analytics. */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  // Directivas, pipes y utilidades que usa la plantilla
  imports: [BaseChartDirective, CurrencyPipe, DatePipe, DecimalPipe, RouterLink, TranslatePipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  // --- Dependencias inyectadas ---
  private readonly iam = inject(IamStore);                     // Sesión y rol del usuario (comprador o proveedor)
  private readonly analyticsApi = inject(AnalyticsApi);        // Métricas de comprador y proveedor
  private readonly ordering = inject(OrderingApi);             // Pedidos y bandeja de solicitudes
  private readonly equipment = inject(ProviderEquipmentApi);   // Tanques del proveedor
  private readonly fulfillment = inject(FulfillmentApi);       // Entregas del proveedor
  private readonly destroyRef = inject(DestroyRef);            // Permite cancelar suscripciones al destruir el componente

  // Suscripciones guardadas para poder cancelar la petición anterior antes de lanzar otra (evita respuestas obsoletas)
  private analyticsRequest?: Subscription;
  private ordersRequest?: Subscription;
  private inboxRequest?: Subscription;

  // Rol del usuario; se evalúa una sola vez al crear el componente
  readonly isBuyer = this.iam.isBuyer();

  // --- Estado de las métricas principales ---
  readonly loading = signal(true);
  readonly error = signal(false);
  readonly analytics = signal<BuyerAnalytics | ProviderAnalytics | null>(null);

  // --- Estado de pedidos ---
  readonly orders = signal<Order[]>([]);

  // --- Estado de la bandeja de solicitudes pendientes (solo proveedor) ---
  readonly pendingRequests = signal<Request[]>([]);
  readonly inboxLoading = signal(false);
  readonly inboxError = signal(false);

  // Estado de carga/error de la lista de pedidos
  readonly ordersLoading = signal(false);
  readonly ordersError = signal(false);

  // Tarjetas independientes del proveedor: cada una maneja su propio loading/error
  readonly criticalTanks = signal<Card<ProviderTank[]>>({ loading: true, error: false, data: [] });
  readonly todayDeliveries = signal<Card<ProviderDelivery[]>>({ loading: true, error: false, data: [] });

  // Granularidad seleccionada para el gráfico de ventas (día, semana o mes)
  readonly granularity = signal<TrendGranularity>('day');
  readonly granularities: TrendGranularity[] = ['day', 'week', 'month'];

  // Fecha de hoy y primer día del mes actual (ej. "2026-11-01"), usados como rango de consulta
  private readonly today = todayLima();
  private readonly monthStart = `${this.today.slice(0, 8)}01`;

  // Todos los estados posibles de un pedido, en el orden en que se muestran
  readonly statuses: OrderStatus[] = ['PENDING', 'CONFIRMED', 'DISPATCHED', 'PENDING_PAYMENT', 'PAID', 'IN_PROGRESS', 'DELIVERED', 'CANCELLED'];

  // Cantidad de pedidos por estado; se recalcula automáticamente cuando cambia `orders`
  readonly statusCounts = computed(() => this.statuses.map(status => ({ status, count: this.orders().filter(order => order.status === status).length })));

  // ponytail: el pedido no trae fecha de creación; el id (autoincremental) ordena de más reciente a más antiguo.
  // Se copia el arreglo antes de ordenar para no mutar el signal original; se toman los 5 más recientes
  readonly recent = computed(() => [...this.orders()].sort((a, b) => b.id - a.id).slice(0, 5));

  // KPIs a mostrar según el rol del usuario
  readonly kpis = computed<Kpi[]>(() => {
    const data = this.analytics();
    // Mientras no lleguen los datos, no hay indicadores
    if (!data) return [];

    // Indicadores del comprador
    if (this.isBuyer) {
      const buyer = data as BuyerAnalytics;
      return [
        { label: 'analytics.total-spent', value: buyer.totalSpent, money: true, hint: 'analytics.hint-completed-payments' },
        { label: 'analytics.pending-payments', value: buyer.pendingPayments },
        { label: 'analytics.total-orders', value: buyer.totalOrders },
        { label: 'analytics.completed-payments', value: buyer.completedPayments },
      ];
    }

    // Indicadores del proveedor
    const provider = data as ProviderAnalytics;
    return [
      { label: 'analytics.total-revenue', value: provider.totalRevenue, money: true, hint: 'analytics.hint-completed-payments' },
      { label: 'analytics.fuel-sold', value: provider.totalFuelSoldLitres, hint: 'analytics.litres-hint' },
      { label: 'analytics.pending-orders', value: provider.pendingOrders },
      { label: 'analytics.total-orders', value: provider.totalOrders },
      { label: 'analytics.confirmed-orders', value: provider.confirmedOrders, hint: 'analytics.hint-confirmed' },
      { label: 'analytics.cancelled-orders', value: provider.cancelledOrders },
    ];
  });

  // Tendencia de ventas agrupada según la granularidad elegida; solo aplica al proveedor
  readonly trend = computed(() => {
    const data = this.analytics() as ProviderAnalytics | null;
    return data && !this.isBuyer ? groupSalesTrend(data.salesTrend ?? [], this.granularity(), this.monthStart, this.today) : [];
  });

  // Indica si hay al menos un punto con ventas, para decidir si mostrar el gráfico o un mensaje vacío
  readonly hasSales = computed(() => this.trend().some(point => point.litres > 0));

  // Datos del gráfico de barras: fechas en el eje X y litros vendidos en el eje Y
  readonly chartData = computed<ChartData<'bar', number[], string>>(() => ({
    labels: this.trend().map(point => point.date),
    datasets: [{ data: this.trend().map(point => point.litres), backgroundColor: '#3972c6', borderRadius: 4 }],
  }));

  // Opciones del gráfico: se adapta al contenedor, sin leyenda y con el eje Y comenzando en cero
  readonly chartOptions: ChartOptions<'bar'> = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } };

  // Al crear el componente se cargan los datos; las tarjetas de tanques y entregas son solo del proveedor
  constructor() { this.load(); if (!this.isBuyer) { this.loadCriticalTanks(); this.loadTodayDeliveries(); } }

  // Carga los tanques en estado crítico (solo proveedor)
  loadCriticalTanks(): void {
    // Reinicia la tarjeta a estado de carga
    this.criticalTanks.set({ loading: true, error: false, data: [] });
    this.equipment.tanks().subscribe({
      // Filtra los críticos, ordena del nivel más bajo al más alto y limita la cantidad mostrada
      next: rows => this.criticalTanks.set({ loading: false, error: false, data: rows.filter(t => t.critical).sort((a, b) => a.levelPercent - b.levelPercent).slice(0, CRITICAL_LIMIT) }),
      error: () => this.criticalTanks.set({ loading: false, error: true, data: [] }),
    });
  }

  // Carga las entregas programadas para hoy (solo proveedor)
  loadTodayDeliveries(): void {
    this.todayDeliveries.set({ loading: true, error: false, data: [] });
    this.fulfillment.deliveries(this.today).subscribe({
      next: data => this.todayDeliveries.set({ loading: false, error: false, data }),
      error: () => this.todayDeliveries.set({ loading: false, error: true, data: [] }),
    });
  }

  // Carga las métricas principales y dispara la carga de pedidos (y de la bandeja si es proveedor)
  load(): void {
    // El id depende del rol: empresa para el comprador, proveedor para el proveedor
    const id = this.isBuyer ? this.iam.companyId() : this.iam.providerId();
    this.error.set(false);
    // Sin id no se puede consultar: se marca error y se corta
    if (id === null) { this.loading.set(false); this.error.set(true); return; }
    this.loading.set(true);
    // Cancela la petición previa (si existe) y limpia los datos anteriores
    this.analyticsRequest?.unsubscribe();
    this.analytics.set(null);
    // Elige la consulta según el rol; el proveedor además recibe el rango del mes actual
    const analytics: Observable<BuyerAnalytics | ProviderAnalytics> = this.isBuyer ? this.analyticsApi.getBuyerAnalytics(id) : this.analyticsApi.getProviderAnalytics(id, this.monthStart, this.today);
    // takeUntilDestroyed cancela la suscripción automáticamente al destruir el componente
    this.analyticsRequest = analytics.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: data => { this.analytics.set(data); this.loading.set(false); },
      error: () => { this.error.set(true); this.loading.set(false); },
    });
    this.loadOrders();
    if (!this.isBuyer) this.loadInbox();
  }

  // Carga los pedidos del comprador (por empresa) o del proveedor (por proveedor)
  loadOrders(): void {
    // Cancela la petición anterior para evitar condiciones de carrera
    this.ordersRequest?.unsubscribe();
    const id = this.isBuyer ? this.iam.companyId() : this.iam.providerId();
    // Reinicia el estado antes de pedir los datos
    this.ordersLoading.set(true);
    this.ordersError.set(false);
    this.orders.set([]);
    // Sin id válido se marca error sin llamar al backend
    if (!id) { this.ordersLoading.set(false); this.ordersError.set(true); return; }
    this.ordersRequest = this.ordering.orders(this.isBuyer ? 'company' : 'provider', id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: rows => { this.orders.set(rows); this.ordersLoading.set(false); },
      error: () => { this.ordersError.set(true); this.ordersLoading.set(false); },
    });
  }

  // Carga la bandeja de solicitudes entrantes; el comprador no la tiene
  loadInbox(): void {
    if (this.isBuyer) return;
    // Cancela la petición previa y reinicia el estado
    this.inboxRequest?.unsubscribe();
    this.pendingRequests.set([]);
    this.inboxLoading.set(true);
    this.inboxError.set(false);
    this.inboxRequest = this.ordering.requestInbox().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      // Solo se conservan las solicitudes con estado PENDING
      next: rows => { this.pendingRequests.set(rows.filter(r => r.status === 'PENDING')); this.inboxLoading.set(false); },
      error: () => { this.inboxError.set(true); this.inboxLoading.set(false); },
    });
  }
}
