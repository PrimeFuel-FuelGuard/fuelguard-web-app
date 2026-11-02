/** Estado de una solicitud de reabastecimiento; solo las `PENDING` admiten aceptar, rechazar o cancelar. */
export type RequestStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED';
/** Origen de la solicitud: creada por el comprador (`MANUAL`) o generada por el sistema (`AUTOMATIC`). */
export type RequestSource = 'MANUAL' | 'AUTOMATIC';

/** Solicitud de reabastecimiento tal como la devuelve la API `/replenishment-requests`. */
export interface Request {
  id: number;
  organizationId: number;
  customerAccountId: number;
  tankId: number | null;
  providerId: number;
  fuelProductId: number;
  quantity: number;
  unit: string;
  unitPrice: number;
  status: RequestStatus;
  source: RequestSource;
  rejectionReason: string | null;
  orderId: number | null;
  deliveryAddress: string;
  deliveryDate: string;
  version: number;
}

/** Campos que el comprador envía al crear una solicitud; el origen (`MANUAL`) lo agrega `OrderingApi`. */
export type CreateRequest = Pick<Request, 'customerAccountId' | 'tankId' | 'providerId' | 'fuelProductId' | 'quantity' | 'unit' | 'deliveryAddress' | 'deliveryDate'>;
