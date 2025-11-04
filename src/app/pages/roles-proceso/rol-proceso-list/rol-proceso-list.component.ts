import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { RolProcesoService } from '../../../services/rol-proceso.service';
import { AuthService } from '../../../services/auth.service';
import { RolProcesoDto } from '../../../models/rol-proceso.model';
import { RolUsuario } from '../../../models/enums';

@Component({
  selector: 'app-rol-proceso-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './rol-proceso-list.component.html',
  styleUrl: './rol-proceso-list.component.css'
})
export class RolProcesoListComponent implements OnInit {
  private rolProcesoService = inject(RolProcesoService);
  private authService = inject(AuthService);

  roles = signal<RolProcesoDto[]>([]);
  loading = signal<boolean>(true);
  error = signal<string>('');

  // Permisos
  canEdit = signal<boolean>(false);

  ngOnInit(): void {
    this.verificarPermisos();
    this.cargarRoles();
  }

  verificarPermisos(): void {
    const user = this.authService.getCurrentUser();
    this.canEdit.set(
      user?.rol === RolUsuario.ADMIN || user?.rol === RolUsuario.EDITOR
    );
  }

  cargarRoles(): void {
    const session = this.authService.getCurrentUser();
    if (!session) {
      this.error.set('No se encontró sesión activa');
      this.loading.set(false);
      return;
    }

    this.loading.set(true);
    this.rolProcesoService.listar(session.empresaId).subscribe({
      next: (roles: RolProcesoDto[]) => {
        this.roles.set(roles);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Error al cargar los roles de proceso');
        this.loading.set(false);
        console.error('Error:', err);
      }
    });
  }

  eliminarRol(rol: RolProcesoDto): void {
    if (!rol.id) return;

    const mensaje = rol.cantidadActividadesAsignadas && rol.cantidadActividadesAsignadas > 0
      ? `El rol "${rol.nombre}" está asignado a ${rol.cantidadActividadesAsignadas} actividad(es). ¿Estás seguro de eliminarlo? Esto lo marcará como inactivo.`
      : `¿Estás seguro de eliminar el rol "${rol.nombre}"?`;

    if (!confirm(mensaje)) return;

    const session = this.authService.getCurrentUser();
    if (!session) return;

    this.rolProcesoService.eliminar(session.empresaId, rol.id).subscribe({
      next: () => {
        alert('Rol eliminado exitosamente');
        this.cargarRoles();
      },
      error: (err) => {
        const errorMsg = err.error?.mensaje || err.error || 'Error al eliminar el rol';
        if (errorMsg.includes('asignado a actividades activas')) {
          alert('No se puede eliminar el rol porque está asignado a actividades activas');
        } else {
          alert(errorMsg);
        }
        console.error('Error:', err);
      }
    });
  }

  eliminarPermanente(rol: RolProcesoDto): void {
    if (!rol.id) return;

    if (!confirm(`⚠️ ATENCIÓN: Esto eliminará PERMANENTEMENTE el rol "${rol.nombre}". Esta acción NO se puede deshacer. ¿Continuar?`)) {
      return;
    }

    const session = this.authService.getCurrentUser();
    if (!session) return;

    this.rolProcesoService.eliminarPermanente(session.empresaId, rol.id).subscribe({
      next: () => {
        alert('Rol eliminado permanentemente');
        this.cargarRoles();
      },
      error: (err) => {
        const errorMsg = err.error?.mensaje || err.error || 'Error al eliminar el rol';
        alert(errorMsg);
        console.error('Error:', err);
      }
    });
  }
}
