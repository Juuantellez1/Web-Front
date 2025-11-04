
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProcesoService } from '../../../services/proceso.service';
import { AuthService } from '../../../services/auth.service';
import { ProcesoDetalleDto } from '../../../models/proceso.model';
import { EstadoProceso, RolUsuario, TipoActividad, TipoGateway } from '../../../models/enums';

@Component({
  selector: 'app-proceso-detalle',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './proceso-detalle.component.html',
  styleUrl: './proceso-detalle.component.css'
})
export class ProcesoDetalleComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private procesoService = inject(ProcesoService);
  private authService = inject(AuthService);

  proceso = signal<ProcesoDetalleDto | null>(null);
  loading = signal<boolean>(true);
  error = signal<string>('');

  // Tabs
  tabActiva = signal<'actividades' | 'gateways' | 'arcos'>('actividades');

  // Permisos
  canEdit = signal<boolean>(false);

  // Exponer enums al template
  EstadoProceso = EstadoProceso;
  TipoActividad = TipoActividad;
  TipoGateway = TipoGateway;

  ngOnInit(): void {
    this.verificarPermisos();
    this.cargarProceso();
  }

  verificarPermisos(): void {
    const user = this.authService.getCurrentUser();
    this.canEdit.set(
      user?.rol === RolUsuario.ADMIN || user?.rol === RolUsuario.EDITOR
    );
  }

  cargarProceso(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error.set('ID de proceso no válido');
      this.loading.set(false);
      return;
    }

    const session = this.authService.getCurrentUser();
    if (!session) {
      this.error.set('No se encontró sesión activa');
      this.loading.set(false);
      return;
    }

    this.loading.set(true);
    this.procesoService.obtenerDetalle(session.empresaId, parseInt(id, 10)).subscribe({
      next: (proceso: ProcesoDetalleDto) => {
        this.proceso.set(proceso);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Error al cargar el proceso');
        this.loading.set(false);
        console.error('Error:', err);
      }
    });
  }

  cambiarTab(tab: 'actividades' | 'gateways' | 'arcos'): void {
    this.tabActiva.set(tab);
  }

  getTipoActividadClass(tipo: TipoActividad): string {
    switch (tipo) {
      case TipoActividad.USUARIO:
        return 'tipo-usuario';
      case TipoActividad.AUTOMATICA:
        return 'tipo-automatica';
      case TipoActividad.MANUAL:
        return 'tipo-manual';
      default:
        return '';
    }
  }

  getTipoGatewayClass(tipo: TipoGateway): string {
    switch (tipo) {
      case TipoGateway.EXCLUSIVO:
        return 'tipo-exclusivo';
      case TipoGateway.INCLUSIVO:
        return 'tipo-inclusivo';
      case TipoGateway.PARALELO:
        return 'tipo-paralelo';
      default:
        return '';
    }
  }
}
