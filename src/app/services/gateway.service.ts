
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GatewayDto } from '../models/gateway.model';

@Injectable({
  providedIn: 'root'
})
export class GatewayService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/procesos';

  listar(procesoId: number): Observable<GatewayDto[]> {
    return this.http.get<GatewayDto[]>(`${this.apiUrl}/${procesoId}/gateways`);
  }

  listarActivos(procesoId: number): Observable<GatewayDto[]> {
    return this.http.get<GatewayDto[]>(`${this.apiUrl}/${procesoId}/gateways/activos`);
  }

  obtenerPorId(procesoId: number, gatewayId: number): Observable<GatewayDto> {
    return this.http.get<GatewayDto>(`${this.apiUrl}/${procesoId}/gateways/${gatewayId}`);
  }

  crear(procesoId: number, gateway: GatewayDto): Observable<GatewayDto> {
    return this.http.post<GatewayDto>(`${this.apiUrl}/${procesoId}/gateways`, gateway);
  }

  actualizar(procesoId: number, gatewayId: number, gateway: GatewayDto): Observable<GatewayDto> {
    return this.http.put<GatewayDto>(`${this.apiUrl}/${procesoId}/gateways/${gatewayId}`, gateway);
  }

  eliminar(procesoId: number, gatewayId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${procesoId}/gateways/${gatewayId}`);
  }

  reactivar(procesoId: number, gatewayId: number): Observable<GatewayDto> {
    return this.http.patch<GatewayDto>(
      `${this.apiUrl}/${procesoId}/gateways/${gatewayId}/reactivar`,
      null
    );
  }

  eliminarPermanente(procesoId: number, gatewayId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${procesoId}/gateways/${gatewayId}/permanente`);
  }
}
