import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { LoginRequest } from '../models/login.model';
import { LoginResponse } from '../models/login-response.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private apiUrl = 'http://localhost:8080/api/auth';
  private readonly STORAGE_KEY = 'currentUser';

  // Estado del usuario actual usando signals
  private currentUserSubject = new BehaviorSubject<LoginResponse | null>(this.getUserFromStorage());
  public currentUser$ = this.currentUserSubject.asObservable();

  // Signal para uso en componentes
  isAuthenticated = signal<boolean>(this.hasValidToken());

  constructor() {
    // Verificar si hay usuario almacenado al iniciar
    const user = this.getUserFromStorage();
    if (user) {
      this.currentUserSubject.next(user);
      this.isAuthenticated.set(true);
    }
  }

  /**
   * Realiza el login del usuario
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        if (response.exitoso) {
          this.saveUserData(response);
          this.currentUserSubject.next(response);
          this.isAuthenticated.set(true);
        }
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Cierra la sesión del usuario
   */
  logout(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    this.currentUserSubject.next(null);
    this.isAuthenticated.set(false);
    this.router.navigate(['/login']);
  }

  /**
   * Guarda los datos del usuario en localStorage
   */
  private saveUserData(user: LoginResponse): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
  }

  /**
   * Obtiene los datos del usuario desde localStorage
   */
  private getUserFromStorage(): LoginResponse | null {
    const userJson = localStorage.getItem(this.STORAGE_KEY);
    return userJson ? JSON.parse(userJson) : null;
  }

  /**
   * Verifica si existe un token válido
   */
  private hasValidToken(): boolean {
    return this.getUserFromStorage() !== null;
  }

  /**
   * Obtiene el usuario actual
   */
  getCurrentUser(): LoginResponse | null {
    return this.currentUserSubject.value;
  }

  /**
   * Obtiene el ID del usuario actual
   */
  getCurrentUserId(): number | null {
    return this.currentUserSubject.value?.id ?? null;
  }

  /**
   * Obtiene el nombre completo del usuario
   */
  getCurrentUserFullName(): string {
    const user = this.currentUserSubject.value;
    return user ? `${user.nombre} ${user.apellido}` : '';
  }

  /**
   * Verifica si el usuario está autenticado
   */
  isLoggedIn(): boolean {
    return this.hasValidToken();
  }

  /**
   * Maneja los errores de HTTP
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Ocurrió un error desconocido';

    if (error.error instanceof ErrorEvent) {
      // Error del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del servidor
      switch (error.status) {
        case 400:
          errorMessage = 'Datos inválidos. Por favor verifica los campos.';
          break;
        case 401:
          errorMessage = 'Credenciales inválidas. Verifica tu correo y contraseña.';
          break;
        case 403:
          errorMessage = 'Usuario inactivo. Contacta al administrador.';
          break;
        case 404:
          errorMessage = 'Servicio no disponible.';
          break;
        case 500:
          errorMessage = 'Error en el servidor. Intenta más tarde.';
          break;
        default:
          errorMessage = error.error?.message || 'Error al iniciar sesión';
      }
    }

    return throwError(() => new Error(errorMessage));
  }
}
