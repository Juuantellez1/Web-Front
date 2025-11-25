
import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { LoginRequest } from '../models/login.model';
import { LoginResponse } from '../models/login-response.model';
import { RolUsuario } from '../models/enums';

interface UserSession {
  userId: number;
  empresaId: number;
  nombreEmpresa: string;
  nombreCompleto: string;
  correo: string;
  rol: RolUsuario;
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = 'http://localhost:8080/api/auth';

  private readonly STORAGE_KEY = 'user_session';

  isAuthenticated = signal<boolean>(false);
  currentUser = signal<UserSession | null>(null);

  constructor() {
    this.checkAuthStatus();
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap(response => {
          if (response.exitoso) {
            const session: UserSession = {
              userId: response.id,
              empresaId: response.empresaId,
              nombreEmpresa: response.nombreEmpresa,
              nombreCompleto: `${response.nombre} ${response.apellido}`,
              correo: response.correo,
              rol: response.rolUsuario,
              token: response.token
            };

            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(session));
            this.isAuthenticated.set(true);
            this.currentUser.set(session);
          }
        })
      );
  }

  logout(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    this.isAuthenticated.set(false);
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  getCurrentUser(): UserSession | null {
    const sessionData = localStorage.getItem(this.STORAGE_KEY);
    if (sessionData) {
      return JSON.parse(sessionData);
    }
    return null;
  }

  getCurrentUserFullName(): string {
    const user = this.getCurrentUser();
    return user?.nombreCompleto || 'Usuario';
  }

  getToken(): string | null {
    const session = this.getCurrentUser();
    return session ? session.token : null;
  }

  checkAuthStatus(): void {
    const session = this.getCurrentUser();
    if (session) {
      this.isAuthenticated.set(true);
      this.currentUser.set(session);
    }
  }

  hasRole(role: RolUsuario): boolean {
    const user = this.getCurrentUser();
    return user?.rol === role;
  }

  isAdmin(): boolean {
    return this.hasRole(RolUsuario.ADMIN);
  }

  isEditor(): boolean {
    return this.hasRole(RolUsuario.EDITOR);
  }

  canEdit(): boolean {
    const user = this.getCurrentUser();
    return user?.rol === RolUsuario.ADMIN || user?.rol === RolUsuario.EDITOR;
  }
}
