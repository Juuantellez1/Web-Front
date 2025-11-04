
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProcesoService } from '../../../services/proceso.service';
import { ActividadService } from '../../../services/actividad.service';
import { GatewayService } from '../../../services/gateway.service';
import { ArcoService } from '../../../services/arco.service';
import { RolProcesoService } from '../../../services/rol-proceso.service';
import { AuthService } from '../../../services/auth.service';
import { ProcesoDto } from '../../../models/proceso.model';
import { ActividadDto } from '../../../models/actividad.model';
import { GatewayDto } from '../../../models/gateway.model';
import { ArcoDto } from '../../../models/arco.model';
import { RolProcesoDto } from '../../../models/rol-proceso.model';
import { TipoActividad, TipoGateway, TipoNodo } from '../../../models/enums';

@Component({
  selector: 'app-proceso-diagrama',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './proceso-diagrama.component.html',
  styleUrl: './proceso-diagrama.component.css'
})
export class ProcesoDiagramaComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private procesoService = inject(ProcesoService);
  private actividadService = inject(ActividadService);
  private gatewayService = inject(GatewayService);
  private arcoService = inject(ArcoService);
  private rolProcesoService = inject(RolProcesoService);
  private authService = inject(AuthService);

  // Datos del proceso
  proceso = signal<ProcesoDto | null>(null);
  procesoId: number | null = null;

  // Listas
  actividades = signal<ActividadDto[]>([]);
  gateways = signal<GatewayDto[]>([]);
  arcos = signal<ArcoDto[]>([]);
  rolesDisponibles = signal<RolProcesoDto[]>([]);

  // Estados
  loading = signal<boolean>(true);
  error = signal<string>('');
  modoEdicion = signal<'actividad' | 'gateway' | 'arco' | null>(null);
  elementoEditando = signal<any>(null);

  // Formularios
  actividadForm!: FormGroup;
  gatewayForm!: FormGroup;
  arcoForm!: FormGroup;

  // Vista activa
  vistaActiva = signal<'actividades' | 'gateways' | 'arcos'>('actividades');

  // Enums para el template
  TipoActividad = TipoActividad;
  TipoGateway = TipoGateway;
  TipoNodo = TipoNodo;

  ngOnInit(): void {
    this.inicializarFormularios();
    this.verificarProcesoId();
  }

  inicializarFormularios(): void {
    // Formulario de Actividad
    this.actividadForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(200)]],
      descripcion: ['', [Validators.maxLength(500)]],
      tipo: [TipoActividad.MANUAL, [Validators.required]],
      rolResponsableId: [null]
    });

    // Formulario de Gateway
    this.gatewayForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(200)]],
      descripcion: ['', [Validators.maxLength(500)]],
      tipo: [TipoGateway.EXCLUSIVO, [Validators.required]]
    });

    // Formulario de Arco
    this.arcoForm = this.fb.group({
      tipoOrigen: [TipoNodo.ACTIVIDAD, [Validators.required]],
      origenId: [null, [Validators.required]],
      tipoDestino: [TipoNodo.ACTIVIDAD, [Validators.required]],
      destinoId: [null, [Validators.required]],
      condicion: ['', [Validators.maxLength(500)]]
    });
  }

  verificarProcesoId(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error.set('ID de proceso no válido');
      this.loading.set(false);
      return;
    }

    this.procesoId = parseInt(id, 10);
    this.cargarDatos();
  }

  cargarDatos(): void {
    if (!this.procesoId) return;

    const session = this.authService.getCurrentUser();
    if (!session) {
      this.error.set('No se encontró sesión activa');
      this.loading.set(false);
      return;
    }

    this.loading.set(true);

    // Cargar proceso
    this.procesoService.obtenerPorId(session.empresaId, this.procesoId).subscribe({
      next: (proceso) => {
        this.proceso.set(proceso);
        this.cargarElementos();
        this.cargarRoles();
      },
      error: (err) => {
        this.error.set('Error al cargar el proceso');
        this.loading.set(false);
        console.error('Error:', err);
      }
    });
  }

  cargarElementos(): void {
    if (!this.procesoId) return;

    // Cargar actividades
    this.actividadService.listar(this.procesoId).subscribe({
      next: (actividades) => this.actividades.set(actividades),
      error: (err) => console.error('Error al cargar actividades:', err)
    });

    // Cargar gateways
    this.gatewayService.listar(this.procesoId).subscribe({
      next: (gateways) => this.gateways.set(gateways),
      error: (err) => console.error('Error al cargar gateways:', err)
    });

    // Cargar arcos
    this.arcoService.listar(this.procesoId).subscribe({
      next: (arcos) => {
        this.arcos.set(arcos);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar arcos:', err);
        this.loading.set(false);
      }
    });
  }

  cargarRoles(): void {
    const session = this.authService.getCurrentUser();
    if (!session) return;

    this.rolProcesoService.listar(session.empresaId).subscribe({
      next: (roles) => this.rolesDisponibles.set(roles.filter(r => r.activo)),
      error: (err) => console.error('Error al cargar roles:', err)
    });
  }

  cambiarVista(vista: 'actividades' | 'gateways' | 'arcos'): void {
    this.vistaActiva.set(vista);
    this.cancelarEdicion();
  }

  // ============= ACTIVIDADES =============

  nuevaActividad(): void {
    this.modoEdicion.set('actividad');
    this.elementoEditando.set(null);
    this.actividadForm.reset({
      tipo: TipoActividad.MANUAL
    });
  }

  editarActividad(actividad: ActividadDto): void {
    this.modoEdicion.set('actividad');
    this.elementoEditando.set(actividad);
    this.actividadForm.patchValue({
      nombre: actividad.nombre,
      descripcion: actividad.descripcion,
      tipo: actividad.tipo,
      rolResponsableId: actividad.rolResponsableId
    });
  }

  guardarActividad(): void {
    if (this.actividadForm.invalid || !this.procesoId) {
      this.actividadForm.markAllAsTouched();
      return;
    }

    const actividadData: ActividadDto = {
      ...this.actividadForm.value,
      procesoId: this.procesoId,
      activo: true
    };

    const request = this.elementoEditando()
      ? this.actividadService.actualizar(this.procesoId, this.elementoEditando().id, actividadData)
      : this.actividadService.crear(this.procesoId, actividadData);

    request.subscribe({
      next: () => {
        alert(this.elementoEditando() ? 'Actividad actualizada' : 'Actividad creada');
        this.cancelarEdicion();
        this.cargarElementos();
      },
      error: (err) => {
        alert('Error al guardar la actividad');
        console.error('Error:', err);
      }
    });
  }

  eliminarActividad(actividad: ActividadDto): void {
    if (!actividad.id || !this.procesoId) return;

    if (!confirm(`¿Eliminar la actividad "${actividad.nombre}"?`)) return;

    this.actividadService.eliminar(this.procesoId, actividad.id).subscribe({
      next: () => {
        alert('Actividad eliminada');
        this.cargarElementos();
      },
      error: (err) => {
        alert('Error al eliminar la actividad');
        console.error('Error:', err);
      }
    });
  }

  // ============= GATEWAYS =============

  nuevoGateway(): void {
    this.modoEdicion.set('gateway');
    this.elementoEditando.set(null);
    this.gatewayForm.reset({
      tipo: TipoGateway.EXCLUSIVO
    });
  }

  editarGateway(gateway: GatewayDto): void {
    this.modoEdicion.set('gateway');
    this.elementoEditando.set(gateway);
    this.gatewayForm.patchValue({
      nombre: gateway.nombre,
      descripcion: gateway.descripcion,
      tipo: gateway.tipo
    });
  }

  guardarGateway(): void {
    if (this.gatewayForm.invalid || !this.procesoId) {
      this.gatewayForm.markAllAsTouched();
      return;
    }

    const gatewayData: GatewayDto = {
      ...this.gatewayForm.value,
      procesoId: this.procesoId,
      activo: true
    };

    const request = this.elementoEditando()
      ? this.gatewayService.actualizar(this.procesoId, this.elementoEditando().id, gatewayData)
      : this.gatewayService.crear(this.procesoId, gatewayData);

    request.subscribe({
      next: () => {
        alert(this.elementoEditando() ? 'Gateway actualizado' : 'Gateway creado');
        this.cancelarEdicion();
        this.cargarElementos();
      },
      error: (err) => {
        alert('Error al guardar el gateway');
        console.error('Error:', err);
      }
    });
  }

  eliminarGateway(gateway: GatewayDto): void {
    if (!gateway.id || !this.procesoId) return;

    if (!confirm(`¿Eliminar el gateway "${gateway.nombre}"?`)) return;

    this.gatewayService.eliminar(this.procesoId, gateway.id).subscribe({
      next: () => {
        alert('Gateway eliminado');
        this.cargarElementos();
      },
      error: (err) => {
        const mensaje = err.error?.mensaje || 'Error al eliminar el gateway';
        alert(mensaje);
        console.error('Error:', err);
      }
    });
  }

  // ============= ARCOS =============

  nuevoArco(): void {
    this.modoEdicion.set('arco');
    this.elementoEditando.set(null);
    this.arcoForm.reset({
      tipoOrigen: TipoNodo.ACTIVIDAD,
      tipoDestino: TipoNodo.ACTIVIDAD
    });
  }

  editarArco(arco: ArcoDto): void {
    this.modoEdicion.set('arco');
    this.elementoEditando.set(arco);
    this.arcoForm.patchValue({
      tipoOrigen: arco.tipoOrigen,
      origenId: arco.origenId,
      tipoDestino: arco.tipoDestino,
      destinoId: arco.destinoId,
      condicion: arco.condicion
    });
  }

  guardarArco(): void {
    if (this.arcoForm.invalid || !this.procesoId) {
      this.arcoForm.markAllAsTouched();
      return;
    }

    const arcoData: ArcoDto = {
      ...this.arcoForm.value,
      procesoId: this.procesoId,
      activo: true
    };

    const request = this.elementoEditando()
      ? this.arcoService.actualizar(this.procesoId, this.elementoEditando().id, arcoData)
      : this.arcoService.crear(this.procesoId, arcoData);

    request.subscribe({
      next: () => {
        alert(this.elementoEditando() ? 'Arco actualizado' : 'Arco creado');
        this.cancelarEdicion();
        this.cargarElementos();
      },
      error: (err) => {
        const mensaje = err.error?.mensaje || 'Error al guardar el arco';
        alert(mensaje);
        console.error('Error:', err);
      }
    });
  }

  eliminarArco(arco: ArcoDto): void {
    if (!arco.id || !this.procesoId) return;

    if (!confirm('¿Eliminar este arco?')) return;

    this.arcoService.eliminar(this.procesoId, arco.id).subscribe({
      next: () => {
        alert('Arco eliminado');
        this.cargarElementos();
      },
      error: (err) => {
        alert('Error al eliminar el arco');
        console.error('Error:', err);
      }
    });
  }

  // ============= HELPERS =============

  cancelarEdicion(): void {
    this.modoEdicion.set(null);
    this.elementoEditando.set(null);
    this.actividadForm.reset({ tipo: TipoActividad.MANUAL });
    this.gatewayForm.reset({ tipo: TipoGateway.EXCLUSIVO });
    this.arcoForm.reset({ tipoOrigen: TipoNodo.ACTIVIDAD, tipoDestino: TipoNodo.ACTIVIDAD });
  }

  getNodosOrigen(): any[] {
    const tipo = this.arcoForm.get('tipoOrigen')?.value;

    if (tipo === TipoNodo.ACTIVIDAD) {
      return this.actividades().filter(a => a.activo);
    } else if (tipo === TipoNodo.GATEWAY) {
      return this.gateways().filter(g => g.activo);
    } else if (tipo === TipoNodo.EVENTO_INICIO) {
      return [{ id: 0, nombre: 'Evento Inicio' }];
    }

    return [];
  }

  getNodosDestino(): any[] {
    const tipo = this.arcoForm.get('tipoDestino')?.value;

    if (tipo === TipoNodo.ACTIVIDAD) {
      return this.actividades().filter(a => a.activo);
    } else if (tipo === TipoNodo.GATEWAY) {
      return this.gateways().filter(g => g.activo);
    } else if (tipo === TipoNodo.EVENTO_FIN) {
      return [{ id: 0, nombre: 'Evento Fin' }];
    }

    return [];
  }

  hasError(form: FormGroup, field: string): boolean {
    const control = form.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  getErrorMessage(form: FormGroup, field: string): string {
    const control = form.get(field);
    if (!control || !control.errors) return '';

    if (control.errors['required']) return 'Este campo es requerido';
    if (control.errors['maxlength']) {
      return `Máximo ${control.errors['maxlength'].requiredLength} caracteres`;
    }
    return 'Campo inválido';
  }

  getObjectKeys(obj: any): string[] {
    return Object.keys(obj);
  }
}
