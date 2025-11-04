import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProcesoDto, ProcesoDetalleDto } from '../models/proceso.model';
import { EstadoProceso } from '../models/enums';

@Injectable({
  providedIn: 'root'
})
export class ProcesoService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/empresas';

  listar(empresaId: number): Observable<ProcesoDto[]> {
    return this.http.get<ProcesoDto[]>(`${this.apiUrl}/${empresaId}/procesos`);
  }

  obtenerPorId(empresaId: number, procesoId: number): Observable<ProcesoDto> {
    return this.http.get<ProcesoDto>(`${this.apiUrl}/${empresaId}/procesos/${procesoId}`);
  }

  obtenerDetalle(empresaId: number, procesoId: number): Observable<ProcesoDetalleDto> {
    return this.http.get<ProcesoDetalleDto>(`${this.apiUrl}/${empresaId}/procesos/${procesoId}/detalle`);
  }

  filtrarPorEstado(empresaId: number, estado: EstadoProceso): Observable<ProcesoDto[]> {
    return this.http.get<ProcesoDto[]>(`${this.apiUrl}/${empresaId}/procesos/estado/${estado}`);
  }

  filtrarPorCategoria(empresaId: number, categoria: string): Observable<ProcesoDto[]> {
    return this.http.get<ProcesoDto[]>(`${this.apiUrl}/${empresaId}/procesos/categoria/${categoria}`);
  }

  crear(empresaId: number, proceso: ProcesoDto): Observable<ProcesoDto> {
    return this.http.post<ProcesoDto>(`${this.apiUrl}/${empresaId}/procesos`, proceso);
  }

  actualizar(empresaId: number, procesoId: number, proceso: ProcesoDto): Observable<ProcesoDto> {
    return this.http.put<ProcesoDto>(`${this.apiUrl}/${empresaId}/procesos/${procesoId}`, proceso);
  }

  cambiarEstado(empresaId: number, procesoId: number, estado: EstadoProceso): Observable<ProcesoDto> {
    const params = new HttpParams().set('estado', estado);
    return this.http.patch<ProcesoDto>(
      `${this.apiUrl}/${empresaId}/procesos/${procesoId}/estado`,
      null,
      { params }
    );
  }

  eliminar(empresaId: number, procesoId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${empresaId}/procesos/${procesoId}`);
  }

  reactivar(empresaId: number, procesoId: number): Observable<ProcesoDto> {
    return this.http.patch<ProcesoDto>(
      `${this.apiUrl}/${empresaId}/procesos/${procesoId}/reactivar`,
      null
    );
  }

  eliminarPermanente(empresaId: number, procesoId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${empresaId}/procesos/${procesoId}/permanente`);
  }
}
