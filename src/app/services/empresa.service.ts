import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Empresa } from '../models/empresa.model';
import { CrearEmpresaRequest, CrearEmpresaResponse } from '../models/registro.model';

@Injectable({
  providedIn: 'root'
})
export class EmpresaService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/empresas';

  listar(): Observable<Empresa[]> {
    return this.http.get<Empresa[]>(this.apiUrl);
  }

  crearConAdmin(request: CrearEmpresaRequest): Observable<CrearEmpresaResponse> {
    return this.http.post<CrearEmpresaResponse>(this.apiUrl, request);
  }

  obtenerPorId(id: number): Observable<Empresa> {
    return this.http.get<Empresa>(`${this.apiUrl}/${id}`);
  }

  crear(empresa: Empresa): Observable<Empresa> {
    return this.http.post<Empresa>(this.apiUrl, empresa);
  }

  actualizar(id: number, empresa: Empresa): Observable<Empresa> {
    return this.http.put<Empresa>(`${this.apiUrl}/${id}`, empresa);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
