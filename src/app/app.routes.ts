
import { Routes } from '@angular/router';
import { EmpresaListComponent } from './pages/empresas/empresa-list/empresa-list.component';
import { EmpresaFormComponent } from './pages/empresas/empresa-form/empresa-form.component';
import { UsuarioListComponent } from './pages/usuarios/usuario-list/usuario-list.component';
import { UsuarioFormComponent } from './pages/usuarios/usuario-form/usuario-form.component';
import { LoginComponent } from './pages/login/login.component';
import { authGuard, loginGuard } from './guards/auth.guard';
import {RegistroComponent} from './pages/registro/registro.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [loginGuard]
  },
  {
    path: 'registro',
    component: RegistroComponent
  },
  {
    path: 'empresas',
    component: EmpresaListComponent,
    canActivate: [authGuard]
  },
  {
    path: 'empresas/nuevo',
    component: EmpresaFormComponent,
    canActivate: [authGuard]
  },
  {
    path: 'empresas/editar/:id',
    component: EmpresaFormComponent,
    canActivate: [authGuard]
  },
  {
    path: 'usuarios',
    component: UsuarioListComponent,
    canActivate: [authGuard]
  },
  {
    path: 'usuarios/nuevo',
    component: UsuarioFormComponent,
    canActivate: [authGuard]
  },
  {
    path: 'usuarios/editar/:id',
    component: UsuarioFormComponent,
    canActivate: [authGuard]
  },
  {
    path: '**',
    redirectTo: '/login'
  }
];
