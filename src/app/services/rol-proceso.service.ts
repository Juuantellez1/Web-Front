import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RolProcesoDto } from '../models/rol-proceso.model';

@Injectable({
  providedIn: 'root'
})
export class RolProcesoService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/empresas';

  listar(empresaId: number): Observable<RolProcesoDto[]> {
    return this.http.get<RolProcesoDto[]>(`${this.apiUrl}/${empresaId}/roles-proceso`);
  }

  obtenerPorId(empresaId: number, rolId: number): Observable<RolProcesoDto> {
    return this.http.get<RolProcesoDto>(`${this.apiUrl}/${empresaId}/roles-proceso/${rolId}`);
  }

  crear(empresaId: number, rol: RolProcesoDto): Observable<RolProcesoDto> {
    return this.http.post<RolProcesoDto>(`${this.apiUrl}/${empresaId}/roles-proceso`, rol);
  }

  actualizar(empresaId: number, rolId: number, rol: RolProcesoDto): Observable<RolProcesoDto> {
    return this.http.put<RolProcesoDto>(`${this.apiUrl}/${empresaId}/roles-proceso/${rolId}`, rol);
  }

  eliminar(empresaId: number, rolId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${empresaId}/roles-proceso/${rolId}`);
  }

  eliminarPermanente(empresaId: number, rolId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${empresaId}/roles-proceso/${rolId}/permanente`);
  }
}
