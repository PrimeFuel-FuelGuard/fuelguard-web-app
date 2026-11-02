/** Estados posibles de una orden de combustible, desde su creación hasta la entrega o cancelación. */
export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'DISPATCHED' | 'PENDING_PAYMENT' | 'PAID' | 'IN_PROGRESS' | 'DELIVERED' | 'CANCELLED';

/** Orden de combustible de la API `/fuel-orders`; `requestId` es la solicitud de origen, si la hay. */
export interface Order {
  id: number;
  requestId: number | null;
  companyId: number;
  providerId: number;
  fuelProductId: number;
  equipmentId: number | null;
  requestedQuantity: number;
  totalPrice: number;
  status: OrderStatus;
  deliveryAddress: string;
  scheduledDate: string | null;
}
