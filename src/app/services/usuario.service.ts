
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Usuario } from '../models/usuario.model';
import { RolUsuario } from '../models/enums';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/usuarios';

  // Listar todos los usuarios del sistema
  listar(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.apiUrl);
  }

  // Listar usuarios por empresa (AGREGAR ESTE MÉTODO)
  listarPorEmpresa(empresaId: number): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${this.apiUrl}/empresa/${empresaId}`);
  }

  // Obtener usuario por ID global
  obtenerPorId(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.apiUrl}/${id}`);
  }

  // Obtener usuario específico de una empresa
  obtenerPorEmpresaYId(empresaId: number, usuarioId: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.apiUrl}/empresa/${empresaId}/usuario/${usuarioId}`);
  }

  // Crear nuevo usuario
  crear(usuario: Usuario): Observable<Usuario> {
    return this.http.post<Usuario>(this.apiUrl, usuario);
  }

  // Actualizar usuario
  actualizar(id: number, usuario: Usuario): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.apiUrl}/${id}`, usuario);
  }

  // Actualizar usuario dentro del contexto de empresa
  actualizarPorEmpresa(empresaId: number, usuarioId: number, usuario: Usuario): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.apiUrl}/empresa/${empresaId}/usuario/${usuarioId}`, usuario);
  }

  // Eliminar usuario
  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Eliminar usuario dentro del contexto de empresa
  eliminarPorEmpresa(empresaId: number, usuarioId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/empresa/${empresaId}/usuario/${usuarioId}`);
  }

  // Cambiar rol de usuario
  cambiarRol(empresaId: number, usuarioId: number, nuevoRol: RolUsuario): Observable<Usuario> {
    const params = new HttpParams().set('nuevoRolUsuario', nuevoRol);
    return this.http.patch<Usuario>(
      `${this.apiUrl}/empresa/${empresaId}/usuario/${usuarioId}/rol`,
      null,
      { params }
    );
  }
}
