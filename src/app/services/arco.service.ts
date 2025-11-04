import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ArcoDto } from '../models/arco.model';

@Injectable({
  providedIn: 'root'
})
export class ArcoService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/procesos';

  listar(procesoId: number): Observable<ArcoDto[]> {
    return this.http.get<ArcoDto[]>(`${this.apiUrl}/${procesoId}/arcos`);
  }

  listarActivos(procesoId: number): Observable<ArcoDto[]> {
    return this.http.get<ArcoDto[]>(`${this.apiUrl}/${procesoId}/arcos/activos`);
  }

  obtenerPorId(procesoId: number, arcoId: number): Observable<ArcoDto> {
    return this.http.get<ArcoDto>(`${this.apiUrl}/${procesoId}/arcos/${arcoId}`);
  }

  crear(procesoId: number, arco: ArcoDto): Observable<ArcoDto> {
    return this.http.post<ArcoDto>(`${this.apiUrl}/${procesoId}/arcos`, arco);
  }

  actualizar(procesoId: number, arcoId: number, arco: ArcoDto): Observable<ArcoDto> {
    return this.http.put<ArcoDto>(`${this.apiUrl}/${procesoId}/arcos/${arcoId}`, arco);
  }

  eliminar(procesoId: number, arcoId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${procesoId}/arcos/${arcoId}`);
  }

  reactivar(procesoId: number, arcoId: number): Observable<ArcoDto> {
    return this.http.patch<ArcoDto>(
      `${this.apiUrl}/${procesoId}/arcos/${arcoId}/reactivar`,
      null
    );
  }

  eliminarPermanente(procesoId: number, arcoId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${procesoId}/arcos/${arcoId}/permanente`);
  }
}
