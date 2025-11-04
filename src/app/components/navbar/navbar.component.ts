import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar">
      <div class="nav-container">
        <div class="nav-brand">
          <span class="brand-text">Sistema de Procesos</span>
        </div>

        @if (authService.isAuthenticated()) {
          <div class="nav-menu">
            <a routerLink="/dashboard" routerLinkActive="active" class="nav-link">
              Dashboard
            </a>
            <a routerLink="/procesos" routerLinkActive="active" class="nav-link">
              Procesos
            </a>
            <a routerLink="/roles-proceso" routerLinkActive="active" class="nav-link">
              Roles
            </a>
            @if (authService.isAdmin()) {
              <a routerLink="/usuarios" routerLinkActive="active" class="nav-link">
                Usuarios
              </a>
              <a routerLink="/empresas" routerLinkActive="active" class="nav-link">
                Empresas
              </a>
            }
          </div>

          <div class="nav-user">
            <span class="user-name">{{ authService.getCurrentUserFullName() }}</span>
            <button (click)="logout()" class="btn-logout">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              Salir
            </button>
          </div>
        }
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      background: white;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .nav-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 1rem 2rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 2rem;
    }

    .nav-brand {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-weight: 700;
      font-size: 1.25rem;
      color: #111827;
    }

    .brand-text {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .nav-menu {
      display: flex;
      gap: 0.5rem;
      flex: 1;
    }

    .nav-link {
      padding: 0.625rem 1rem;
      border-radius: 0.375rem;
      text-decoration: none;
      color: #6b7280;
      font-weight: 500;
      transition: all 0.2s;
    }

    .nav-link:hover {
      background: #f3f4f6;
      color: #111827;
    }

    .nav-link.active {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .nav-user {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .user-name {
      color: #374151;
      font-weight: 500;
      font-size: 0.875rem;
    }

    .btn-logout {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      background: #ef4444;
      color: white;
      border: none;
      border-radius: 0.375rem;
      cursor: pointer;
      font-weight: 500;
      font-size: 0.875rem;
      transition: all 0.2s;
    }

    .btn-logout:hover {
      background: #dc2626;
      transform: translateY(-1px);
    }

    .btn-logout svg {
      width: 18px;
      height: 18px;
    }

    @media (max-width: 768px) {
      .nav-container {
        flex-wrap: wrap;
        padding: 1rem;
      }

      .nav-menu {
        order: 3;
        width: 100%;
        justify-content: center;
        flex-wrap: wrap;
      }

      .user-name {
        display: none;
      }
    }
  `]
})
export class NavbarComponent {
  authService = inject(AuthService);

  logout(): void {
    if (confirm('¿Estás seguro que deseas cerrar sesión?')) {
      this.authService.logout();
    }
  }
}
