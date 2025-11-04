import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProcesoService } from '../../../services/proceso.service';
import { AuthService } from '../../../services/auth.service';
import { ProcesoDto } from '../../../models/proceso.model';
import { EstadoProceso, RolUsuario } from '../../../models/enums';

@Component({
  selector: 'app-proceso-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './proceso-list.component.html',
  styleUrl: './proceso-list.component.css'
})
export class ProcesoListComponent implements OnInit {
  private procesoService = inject(ProcesoService);
  private authService = inject(AuthService);

  procesos = signal<ProcesoDto[]>([]);
  procesosFiltrados = signal<ProcesoDto[]>([]);
  loading = signal<boolean>(true);
  error = signal<string>('');

  // Filtros
  busqueda = signal<string>('');
  estadoFiltro = signal<string>('TODOS');
  categoriaFiltro = signal<string>('TODAS');
  categorias = signal<string[]>([]);

  // Permisos
  canEdit = signal<boolean>(false);
  canCreate = signal<boolean>(false);
  canDelete = signal<boolean>(false);
  canChangeState = signal<boolean>(false);

  // Exponer enums al template
  EstadoProceso = EstadoProceso;

  ngOnInit(): void {
    this.verificarPermisos();
    this.cargarProcesos();
  }

  verificarPermisos(): void {
    const user = this.authService.getCurrentUser();
    const isAdmin = user?.rol === RolUsuario.ADMIN;
    const isEditor = user?.rol === RolUsuario.EDITOR;

    this.canCreate.set(isAdmin || isEditor);
    this.canEdit.set(isAdmin || isEditor);
    this.canDelete.set(isAdmin);
    this.canChangeState.set(isAdmin);
  }

  cargarProcesos(): void {
    const session = this.authService.getCurrentUser();
    if (!session) {
      this.error.set('No se encontró sesión activa');
      this.loading.set(false);
      return;
    }

    this.loading.set(true);
    this.procesoService.listar(session.empresaId).subscribe({
      next: (procesos: ProcesoDto[]) => {
        this.procesos.set(procesos);
        this.extraerCategorias(procesos);
        this.aplicarFiltros();
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Error al cargar los procesos');
        this.loading.set(false);
        console.error('Error:', err);
      }
    });
  }

  extraerCategorias(procesos: ProcesoDto[]): void {
    const categoriasUnicas = new Set<string>();
    procesos.forEach(p => {
      if (p.categoria) {
        categoriasUnicas.add(p.categoria);
      }
    });
    this.categorias.set(Array.from(categoriasUnicas).sort());
  }

  aplicarFiltros(): void {
    let resultado = [...this.procesos()];

    // Filtro por búsqueda
    const busquedaLower = this.busqueda().toLowerCase();
    if (busquedaLower) {
      resultado = resultado.filter(p =>
        p.nombre.toLowerCase().includes(busquedaLower) ||
        (p.descripcion && p.descripcion.toLowerCase().includes(busquedaLower))
      );
    }

    // Filtro por estado
    if (this.estadoFiltro() !== 'TODOS') {
      resultado = resultado.filter(p => p.estado === this.estadoFiltro());
    }

    // Filtro por categoría
    if (this.categoriaFiltro() !== 'TODAS') {
      resultado = resultado.filter(p => p.categoria === this.categoriaFiltro());
    }

    this.procesosFiltrados.set(resultado);
  }

  onBusquedaChange(value: string): void {
    this.busqueda.set(value);
    this.aplicarFiltros();
  }

  onEstadoChange(value: string): void {
    this.estadoFiltro.set(value);
    this.aplicarFiltros();
  }

  onCategoriaChange(value: string): void {
    this.categoriaFiltro.set(value);
    this.aplicarFiltros();
  }

  cambiarEstado(proceso: ProcesoDto): void {
    if (!proceso.id) return;

    const nuevoEstado = proceso.estado === EstadoProceso.BORRADOR
      ? EstadoProceso.PUBLICADO
      : EstadoProceso.BORRADOR;

    const mensaje = nuevoEstado === EstadoProceso.PUBLICADO
      ? `¿Deseas publicar el proceso "${proceso.nombre}"?`
      : `¿Deseas despublicar el proceso "${proceso.nombre}"?`;

    if (!confirm(mensaje)) return;

    const session = this.authService.getCurrentUser();
    if (!session) return;

    this.procesoService.cambiarEstado(session.empresaId, proceso.id, nuevoEstado).subscribe({
      next: () => {
        alert(`Proceso ${nuevoEstado === EstadoProceso.PUBLICADO ? 'publicado' : 'despublicado'} exitosamente`);
        this.cargarProcesos();
      },
      error: (err) => {
        alert('Error al cambiar el estado del proceso');
        console.error('Error:', err);
      }
    });
  }

  eliminarProceso(proceso: ProcesoDto): void {
    if (!proceso.id) return;

    if (!confirm(`¿Estás seguro de eliminar el proceso "${proceso.nombre}"? Se marcará como inactivo.`)) {
      return;
    }

    const session = this.authService.getCurrentUser();
    if (!session) return;

    this.procesoService.eliminar(session.empresaId, proceso.id).subscribe({
      next: () => {
        alert('Proceso eliminado exitosamente');
        this.cargarProcesos();
      },
      error: (err) => {
        alert('Error al eliminar el proceso');
        console.error('Error:', err);
      }
    });
  }

  reactivarProceso(proceso: ProcesoDto): void {
    if (!proceso.id) return;

    if (!confirm(`¿Deseas reactivar el proceso "${proceso.nombre}"?`)) {
      return;
    }

    const session = this.authService.getCurrentUser();
    if (!session) return;

    this.procesoService.reactivar(session.empresaId, proceso.id).subscribe({
      next: () => {
        alert('Proceso reactivado exitosamente');
        this.cargarProcesos();
      },
      error: (err) => {
        alert('Error al reactivar el proceso');
        console.error('Error:', err);
      }
    });
  }

  eliminarPermanente(proceso: ProcesoDto): void {
    if (!proceso.id) return;

    if (!confirm(`⚠️ ATENCIÓN: Esto eliminará PERMANENTEMENTE el proceso "${proceso.nombre}" y todos sus elementos (actividades, arcos, gateways). Esta acción NO se puede deshacer. ¿Continuar?`)) {
      return;
    }

    const session = this.authService.getCurrentUser();
    if (!session) return;

    this.procesoService.eliminarPermanente(session.empresaId, proceso.id).subscribe({
      next: () => {
        alert('Proceso eliminado permanentemente');
        this.cargarProcesos();
      },
      error: (err) => {
        alert('Error al eliminar el proceso permanentemente');
        console.error('Error:', err);
      }
    });
  }
}
