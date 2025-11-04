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
  {
    path: 'empresas',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/empresas/empresa-list/empresa-list.component').then(m => m.EmpresaListComponent)
      },
      {
        path: 'nuevo',
        loadComponent: () => import('./pages/empresas/empresa-form/empresa-form.component').then(m => m.EmpresaFormComponent)
      },
      {
        path: ':id/editar',
        loadComponent: () => import('./pages/empresas/empresa-form/empresa-form.component').then(m => m.EmpresaFormComponent)
      }
    ]
  },
  {
    path: 'usuarios',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/usuarios/usuario-list/usuario-list.component').then(m => m.UsuarioListComponent)
      },
      {
        path: 'nuevo',
        loadComponent: () => import('./pages/usuarios/usuario-form/usuario-form.component').then(m => m.UsuarioFormComponent)
      },
      {
        path: ':id/editar',
        loadComponent: () => import('./pages/usuarios/usuario-form/usuario-form.component').then(m => m.UsuarioFormComponent)
      }
    ]
  },
  {
    path: 'procesos',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/procesos/proceso-list/proceso-list.component').then(m => m.ProcesoListComponent)
      },
      {
        path: 'nuevo',
        loadComponent: () => import('./pages/procesos/proceso-form/proceso-form.component').then(m => m.ProcesoFormComponent)
      },
      {
        path: ':id',
        loadComponent: () => import('./pages/procesos/proceso-detalle/proceso-detalle.component').then(m => m.ProcesoDetalleComponent)
      },
      {
        path: ':id/editar',
        loadComponent: () => import('./pages/procesos/proceso-form/proceso-form.component').then(m => m.ProcesoFormComponent)
      },
      {
        path: ':id/diagrama',
        loadComponent: () => import('./pages/procesos/proceso-diagrama/proceso-diagrama.component').then(m => m.ProcesoDiagramaComponent)
      }
    ]
  },
  {
    path: 'roles-proceso',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/roles-proceso/rol-proceso-list/rol-proceso-list.component').then(m => m.RolProcesoListComponent)
      },
      {
        path: 'nuevo',
        loadComponent: () => import('./pages/roles-proceso/rol-proceso-form/rol-proceso-form.component').then(m => m.RolProcesoFormComponent)
      },
      {
        path: ':id/editar',
        loadComponent: () => import('./pages/roles-proceso/rol-proceso-form/rol-proceso-form.component').then(m => m.RolProcesoFormComponent)
      }
    ]
  },
  {
    path: 'perfil',
    loadComponent: () => import('./pages/perfil/perfil.component').then(m => m.PerfilComponent),
    canActivate: [authGuard]
  },
  {
    path: '**',
    redirectTo: '/login'
  }
];
