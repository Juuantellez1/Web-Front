import { Routes } from '@angular/router';
import { EmpresaListComponent } from './pages/empresas/empresa-list/empresa-list.component';
import { EmpresaFormComponent } from './pages/empresas/empresa-form/empresa-form.component';
import { UsuarioListComponent } from './pages/usuarios/usuario-list/usuario-list.component';
import { UsuarioFormComponent } from './pages/usuarios/usuario-form/usuario-form.component';

export const routes: Routes = [
  { path: '', redirectTo: '/empresas', pathMatch: 'full' },
  { path: 'empresas', component: EmpresaListComponent },
  { path: 'empresas/nuevo', component: EmpresaFormComponent },
  { path: 'empresas/editar/:id', component: EmpresaFormComponent },
  { path: 'usuarios', component: UsuarioListComponent },
  { path: 'usuarios/nuevo', component: UsuarioFormComponent },
  { path: 'usuarios/editar/:id', component: UsuarioFormComponent }
];
