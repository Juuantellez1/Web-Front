
import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'registro-empresa',
    loadComponent: () => import('./pages/registro/registro.component').then(m => m.RegistroComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },

  // ========== EMPRESAS ==========
  {
    path: 'empresas',
    loadComponent: () => import('./pages/empresas/empresa-list/empresa-list.component').then(m => m.EmpresaListComponent),
    canActivate: [authGuard]
  },
  {
    path: 'empresas/nuevo',
    loadComponent: () => import('./pages/empresas/empresa-form/empresa-form.component').then(m => m.EmpresaFormComponent),
    canActivate: [authGuard]
  },
  {
    path: 'empresas/:id/editar',
    loadComponent: () => import('./pages/empresas/empresa-form/empresa-form.component').then(m => m.EmpresaFormComponent),
    canActivate: [authGuard]
  },

  // ========== USUARIOS ==========
  {
    path: 'usuarios',
    loadComponent: () => import('./pages/usuarios/usuario-list/usuario-list.component').then(m => m.UsuarioListComponent),
    canActivate: [authGuard]
  },
  {
    path: 'usuarios/nuevo',
    loadComponent: () => import('./pages/usuarios/usuario-form/usuario-form.component').then(m => m.UsuarioFormComponent),
    canActivate: [authGuard]
  },
  {
    path: 'usuarios/:id/editar',
    loadComponent: () => import('./pages/usuarios/usuario-form/usuario-form.component').then(m => m.UsuarioFormComponent),
    canActivate: [authGuard]
  },

  // ========== PROCESOS ==========
  {
    path: 'procesos',
    loadComponent: () => import('./pages/procesos/proceso-list/proceso-list.component').then(m => m.ProcesoListComponent),
    canActivate: [authGuard]
  },
  {
    path: 'procesos/nuevo',
    loadComponent: () => import('./pages/procesos/proceso-form/proceso-form.component').then(m => m.ProcesoFormComponent),
    canActivate: [authGuard]
  },
  {
    path: 'procesos/:id',
    loadComponent: () => import('./pages/procesos/proceso-detalle/proceso-detalle.component').then(m => m.ProcesoDetalleComponent),
    canActivate: [authGuard]
  },
  {
    path: 'procesos/:id/editar',
    loadComponent: () => import('./pages/procesos/proceso-form/proceso-form.component').then(m => m.ProcesoFormComponent),
    canActivate: [authGuard]
  },
  {
    path: 'procesos/:id/diagrama',
    loadComponent: () => import('./pages/procesos/proceso-diagrama/proceso-diagrama.component').then(m => m.ProcesoDiagramaComponent),
    canActivate: [authGuard]
  },

  // ========== ROLES DE PROCESO ==========
  {
    path: 'roles-proceso',
    loadComponent: () => import('./pages/roles-proceso/rol-proceso-list/rol-proceso-list.component').then(m => m.RolProcesoListComponent),
    canActivate: [authGuard]
  },
  {
    path: 'roles-proceso/nuevo',
    loadComponent: () => import('./pages/roles-proceso/rol-proceso-form/rol-proceso-form.component').then(m => m.RolProcesoFormComponent),
    canActivate: [authGuard]
  },
  {
    path: 'roles-proceso/:id/editar',
    loadComponent: () => import('./pages/roles-proceso/rol-proceso-form/rol-proceso-form.component').then(m => m.RolProcesoFormComponent),
    canActivate: [authGuard]
  },

  // ========== PERFIL ==========
  {
    path: 'perfil',
    loadComponent: () => import('./pages/perfil/perfil.component').then(m => m.PerfilComponent),
    canActivate: [authGuard]
  },

  // ========== CATCH ALL ==========
  {
    path: '**',
    redirectTo: '/login'
  }
];
