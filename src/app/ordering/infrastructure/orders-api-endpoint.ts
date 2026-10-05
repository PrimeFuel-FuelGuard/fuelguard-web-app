import { BaseApiEndpoint } from '../../shared/infrastructure/base-api-endpoint';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { OrderResource, OrdersResponse } from './orders-response';
import { OrderAssembler } from './order-assembler';
import { Order } from '../domain/model/order.entity';

export class OrdersApiEndpoint extends BaseApiEndpoint<Order, OrderResource, OrdersResponse, OrderAssembler> {

  constructor(http: HttpClient) {
    super(http, environment.serverBasePath + environment.orderingOrdersEndpointPath, new OrderAssembler());
  }
}
