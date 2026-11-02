import { Request } from '../domain/model/request.entity';
/** Una solicitud tal como llega de la API (igual que la entidad). */
export type RequestResource = Request;
/** Respuesta de listado de solicitudes: un arreglo sin envoltorio. */
export type RequestsResponse = Request[];
