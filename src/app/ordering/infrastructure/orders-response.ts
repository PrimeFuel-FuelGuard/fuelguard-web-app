import { Order } from '../domain/model/order.entity';
/** Una orden tal como llega de la API (igual que la entidad). */
export type OrderResource = Order;
/** Respuesta de listado de órdenes: un arreglo sin envoltorio. */
export type OrdersResponse = Order[];
