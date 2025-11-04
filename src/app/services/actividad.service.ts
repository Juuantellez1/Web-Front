import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ActividadDto } from '../models/actividad.model';

@Injectable({
  providedIn: 'root'
})
export class ActividadService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/procesos';

  listar(procesoId: number): Observable<ActividadDto[]> {
    return this.http.get<ActividadDto[]>(`${this.apiUrl}/${procesoId}/actividades`);
  }

  listarActivas(procesoId: number): Observable<ActividadDto[]> {
    return this.http.get<ActividadDto[]>(`${this.apiUrl}/${procesoId}/actividades/activas`);
  }

  obtenerPorId(procesoId: number, actividadId: number): Observable<ActividadDto> {
    return this.http.get<ActividadDto>(`${this.apiUrl}/${procesoId}/actividades/${actividadId}`);
  }

  crear(procesoId: number, actividad: ActividadDto): Observable<ActividadDto> {
    return this.http.post<ActividadDto>(`${this.apiUrl}/${procesoId}/actividades`, actividad);
  }

  actualizar(procesoId: number, actividadId: number, actividad: ActividadDto): Observable<ActividadDto> {
    return this.http.put<ActividadDto>(`${this.apiUrl}/${procesoId}/actividades/${actividadId}`, actividad);
  }

  eliminar(procesoId: number, actividadId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${procesoId}/actividades/${actividadId}`);
  }

  reactivar(procesoId: number, actividadId: number): Observable<ActividadDto> {
    return this.http.patch<ActividadDto>(
      `${this.apiUrl}/${procesoId}/actividades/${actividadId}/reactivar`,
      null
    );
  }

  eliminarPermanente(procesoId: number, actividadId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${procesoId}/actividades/${actividadId}/permanente`);
  }
}
