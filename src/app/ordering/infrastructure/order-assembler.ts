import { BaseAssembler } from '../../shared/infrastructure/base-assembler';
import { Order } from '../domain/model/order.entity';
import { OrderResource, OrdersResponse } from './orders-response';
/** Ensamblador identidad: el recurso de la API ya tiene la forma de la entidad `Order`, así que no transforma nada. */
export class OrderAssembler implements BaseAssembler<Order, OrderResource, OrdersResponse> {
  toEntityFromResource(resource: OrderResource): Order { return resource; }
  toResourceFromEntity(entity: Order): OrderResource { return entity; }
  toEntitiesFromResponse(response: OrdersResponse): Order[] { return response; }
}
