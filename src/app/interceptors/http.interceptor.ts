import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const httpInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error) => {
      // Si es error 401 (no autorizado) o 403 (prohibido)
      if (error.status === 401 || error.status === 403) {
        console.error('Error de autenticación:', error);

        // Limpiar sesión y redirigir al login
        authService.logout();

        // NO redirigir si ya estamos en login o registro
        const currentUrl = window.location.pathname;
        if (!currentUrl.includes('/login') && !currentUrl.includes('/registro')) {
          router.navigate(['/login']);
        }
      }

      return throwError(() => error);
    })
  );
};
