import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DragDropModule, CdkDragEnd, CdkDragMove } from '@angular/cdk/drag-drop';

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

// Interfaces extendidas para el manejo visual sin afectar el modelo base
interface ActividadVisual extends ActividadDto {
  initialPoint: { x: number, y: number };
}

interface GatewayVisual extends GatewayDto {
  initialPoint: { x: number, y: number };
}

@Component({
  selector: 'app-proceso-diagrama',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, DragDropModule],
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

  proceso = signal<ProcesoDto | null>(null);
  procesoId: number | null = null;

  actividades = signal<ActividadVisual[]>([]);
  gateways = signal<GatewayVisual[]>([]);
  arcos = signal<ArcoDto[]>([]);
  rolesDisponibles = signal<RolProcesoDto[]>([]);

  loading = signal<boolean>(true);
  error = signal<string>('');
  modoEdicion = signal<'actividad' | 'gateway' | 'arco' | null>(null);
  elementoEditando = signal<any>(null);

  actividadForm!: FormGroup;
  gatewayForm!: FormGroup;
  arcoForm!: FormGroup;

  dibujandoArco = signal<boolean>(false);
  nodoOrigen: any = null;
  punteroActual = { x: 0, y: 0 };

  TipoActividad = TipoActividad;
  TipoGateway = TipoGateway;
  TipoNodo = TipoNodo;

  ngOnInit(): void {
    this.inicializarFormularios();
    this.verificarProcesoId();
  }

  inicializarFormularios(): void {
    this.actividadForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(200)]],
      descripcion: ['', [Validators.maxLength(500)]],
      tipo: [TipoActividad.MANUAL, [Validators.required]],
      rolResponsableId: [null]
    });

    this.gatewayForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(200)]],
      descripcion: ['', [Validators.maxLength(500)]],
      tipo: [TipoGateway.EXCLUSIVO, [Validators.required]]
    });

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
    this.procesoService.obtenerPorId(session.empresaId, this.procesoId).subscribe({
      next: (proceso) => {
        this.proceso.set(proceso);
        this.cargarElementos();
        this.cargarRoles();
      },
      error: () => {
        this.error.set('Error al cargar el proceso');
        this.loading.set(false);
      }
    });
  }

  cargarElementos(): void {
    if (!this.procesoId) return;

    this.actividadService.listar(this.procesoId).subscribe({
      next: (actividades) => {
        const visuales = actividades.map(a => ({
          ...a,
          initialPoint: { x: a.x || 50, y: a.y || 50 }
        }));
        this.actividades.set(visuales);
      },
      error: (err) => console.error('Error al cargar actividades:', err)
    });

    this.gatewayService.listar(this.procesoId).subscribe({
      next: (gateways) => {
        const visuales = gateways.map(g => ({
          ...g,
          initialPoint: { x: g.x || 50, y: g.y || 50 }
        }));
        this.gateways.set(visuales);
      },
      error: (err) => console.error('Error al cargar gateways:', err)
    });

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

  // --- Lógica Drag & Drop Corregida ---

  onDragMoved(event: CdkDragMove, item: any) {
    // Solo actualizamos x/y para que las líneas se muevan visualmente
    // NO tocamos 'initialPoint' aquí para evitar el feedback loop
    const pos = event.source.getFreeDragPosition();
    item.x = pos.x;
    item.y = pos.y;
    this.arcos.set([...this.arcos()]); // Forzar repintado de líneas
  }

  onDragEnded(event: CdkDragEnd, item: any, tipo: 'ACTIVIDAD' | 'GATEWAY') {
    const pos = event.source.getFreeDragPosition();

    // Actualizamos la posición final y el punto inicial para el futuro
    item.x = pos.x;
    item.y = pos.y;
    item.initialPoint = { x: pos.x, y: pos.y };

    if (tipo === 'ACTIVIDAD') {
      this.actividadService.actualizar(this.procesoId!, item.id, item).subscribe();
    } else {
      this.gatewayService.actualizar(this.procesoId!, item.id, item).subscribe();
    }
  }

  // --- Lógica de Arcos ---

  iniciarArco(evento: MouseEvent, nodo: any, tipo: TipoNodo) {
    evento.stopPropagation();
    evento.preventDefault();
    this.nodoOrigen = { ...nodo, tipoNodo: tipo };
    this.dibujandoArco.set(true);
    this.actualizarPuntero(evento);
  }

  moverArcoTemporal(evento: MouseEvent) {
    if (this.dibujandoArco()) {
      this.actualizarPuntero(evento);
    }
  }

  finalizarArco(nodoDestino: any, tipoDestino: TipoNodo) {
    if (!this.dibujandoArco() || !this.nodoOrigen) return;

    if (this.nodoOrigen.id === nodoDestino.id && this.nodoOrigen.tipoNodo === tipoDestino) {
      this.cancelarArco();
      return;
    }

    const nuevoArco: ArcoDto = {
      procesoId: this.procesoId!,
      tipoOrigen: this.nodoOrigen.tipoNodo,
      origenId: this.nodoOrigen.id,
      tipoDestino: tipoDestino,
      destinoId: nodoDestino.id,
      condicion: '',
      activo: true
    };

    this.arcoService.crear(this.procesoId!, nuevoArco).subscribe({
      next: (arco) => {
        this.arcos.update(lista => [...lista, arco]);
        this.cancelarArco();
      },
      error: () => {
        alert('Error al crear la conexión');
        this.cancelarArco();
      }
    });
  }

  cancelarArco() {
    this.dibujandoArco.set(false);
    this.nodoOrigen = null;
  }

  obtenerRutaArco(arco: ArcoDto): string {
    const origen = this.encontrarNodo(arco.tipoOrigen, arco.origenId);
    const destino = this.encontrarNodo(arco.tipoDestino, arco.destinoId);

    if (!origen || !destino) return '';

    const offX1 = arco.tipoOrigen === TipoNodo.ACTIVIDAD ? 60 : 30;
    const offY1 = arco.tipoOrigen === TipoNodo.ACTIVIDAD ? 40 : 30;
    const offX2 = arco.tipoDestino === TipoNodo.ACTIVIDAD ? 60 : 30;
    const offY2 = arco.tipoDestino === TipoNodo.ACTIVIDAD ? 40 : 30;

    const x1 = (origen.x || 0) + offX1;
    const y1 = (origen.y || 0) + offY1;
    const x2 = (destino.x || 0) + offX2;
    const y2 = (destino.y || 0) + offY2;

    return `M ${x1} ${y1} L ${x2} ${y2}`;
  }

  private encontrarNodo(tipo: string, id: number): any {
    if (tipo === TipoNodo.ACTIVIDAD) return this.actividades().find(a => a.id === id);
    if (tipo === TipoNodo.GATEWAY) return this.gateways().find(g => g.id === id);
    return null;
  }

  private actualizarPuntero(evento: MouseEvent) {
    const canvas = document.querySelector('.canvas-container');
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      this.punteroActual = {
        x: evento.clientX - rect.left,
        y: evento.clientY - rect.top
      };
    }
  }

  // --- CRUD ---

  nuevaActividad(): void {
    this.modoEdicion.set('actividad');
    this.elementoEditando.set(null);
    this.actividadForm.reset({ tipo: TipoActividad.MANUAL });
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

    // Lógica aleatoria para evitar superposición en nuevos elementos
    const randomX = Math.floor(Math.random() * 200) + 50;
    const randomY = Math.floor(Math.random() * 200) + 50;

    const actividadData: ActividadDto = {
      ...this.actividadForm.value,
      procesoId: this.procesoId,
      activo: true,
      x: this.elementoEditando()?.x || randomX,
      y: this.elementoEditando()?.y || randomY
    };

    const request = this.elementoEditando()
      ? this.actividadService.actualizar(this.procesoId, this.elementoEditando().id, actividadData)
      : this.actividadService.crear(this.procesoId, actividadData);

    request.subscribe({
      next: () => {
        this.cancelarEdicion();
        this.cargarElementos();
      },
      error: () => alert('Error al guardar la actividad')
    });
  }

  eliminarActividad(actividad: ActividadDto): void {
    if (!actividad.id || !this.procesoId) return;
    if (!confirm(`¿Eliminar la actividad "${actividad.nombre}"?`)) return;

    this.actividadService.eliminar(this.procesoId, actividad.id).subscribe({
      next: () => this.cargarElementos(),
      error: () => alert('Error al eliminar la actividad')
    });
  }

  nuevoGateway(): void {
    this.modoEdicion.set('gateway');
    this.elementoEditando.set(null);
    this.gatewayForm.reset({ tipo: TipoGateway.EXCLUSIVO });
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

    const randomX = Math.floor(Math.random() * 200) + 50;
    const randomY = Math.floor(Math.random() * 200) + 50;

    const gatewayData: GatewayDto = {
      ...this.gatewayForm.value,
      procesoId: this.procesoId,
      activo: true,
      x: this.elementoEditando()?.x || randomX,
      y: this.elementoEditando()?.y || randomY
    };

    const request = this.elementoEditando()
      ? this.gatewayService.actualizar(this.procesoId, this.elementoEditando().id, gatewayData)
      : this.gatewayService.crear(this.procesoId, gatewayData);

    request.subscribe({
      next: () => {
        this.cancelarEdicion();
        this.cargarElementos();
      },
      error: () => alert('Error al guardar el gateway')
    });
  }

  eliminarGateway(gateway: GatewayDto): void {
    if (!gateway.id || !this.procesoId) return;
    if (!confirm(`¿Eliminar el gateway "${gateway.nombre}"?`)) return;

    this.gatewayService.eliminar(this.procesoId, gateway.id).subscribe({
      next: () => this.cargarElementos(),
      error: () => alert('Error al eliminar el gateway')
    });
  }

  editarArco(arco: ArcoDto): void {
    if (confirm('¿Eliminar esta conexión?')) {
      this.eliminarArco(arco);
    }
  }

  eliminarArco(arco: ArcoDto): void {
    if (!arco.id || !this.procesoId) return;
    this.arcoService.eliminar(this.procesoId, arco.id).subscribe({
      next: () => this.cargarElementos(),
      error: () => alert('Error al eliminar el arco')
    });
  }

  cancelarEdicion(): void {
    this.modoEdicion.set(null);
    this.elementoEditando.set(null);
    this.actividadForm.reset({ tipo: TipoActividad.MANUAL });
    this.gatewayForm.reset({ tipo: TipoGateway.EXCLUSIVO });
  }
}
