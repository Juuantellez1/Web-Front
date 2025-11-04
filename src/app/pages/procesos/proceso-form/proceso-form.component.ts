import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { ProcesoService } from '../../../services/proceso.service';
import { AuthService } from '../../../services/auth.service';
import { ProcesoDto } from '../../../models/proceso.model';
import { EstadoProceso } from '../../../models/enums';

@Component({
  selector: 'app-proceso-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './proceso-form.component.html',
  styleUrl: './proceso-form.component.css'
})
export class ProcesoFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private procesoService = inject(ProcesoService);
  private authService = inject(AuthService);

  procesoForm!: FormGroup;
  loading = signal<boolean>(false);
  error = signal<string>('');
  isEditMode = signal<boolean>(false);
  procesoId: number | null = null;

  // Exponer enum al template
  EstadoProceso = EstadoProceso;

  ngOnInit(): void {
    this.inicializarFormulario();
    this.verificarModoEdicion();
  }

  inicializarFormulario(): void {
    this.procesoForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(200)]],
      descripcion: ['', [Validators.maxLength(1000)]],
      categoria: ['', [Validators.maxLength(100)]],
      estado: [EstadoProceso.BORRADOR, [Validators.required]]
    });
  }

  verificarModoEdicion(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.procesoId = parseInt(id, 10);
      this.isEditMode.set(true);
      this.cargarProceso();
    }
  }

  cargarProceso(): void {
    if (!this.procesoId) return;

    const session = this.authService.getCurrentUser();
    if (!session) {
      this.error.set('No se encontró sesión activa');
      return;
    }

    this.loading.set(true);
    this.procesoService.obtenerPorId(session.empresaId, this.procesoId).subscribe({
      next: (proceso: ProcesoDto) => {
        this.procesoForm.patchValue({
          nombre: proceso.nombre,
          descripcion: proceso.descripcion,
          categoria: proceso.categoria,
          estado: proceso.estado
        });
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Error al cargar el proceso');
        this.loading.set(false);
        console.error('Error:', err);
      }
    });
  }

  onSubmit(): void {
    if (this.procesoForm.invalid) {
      this.procesoForm.markAllAsTouched();
      return;
    }

    const session = this.authService.getCurrentUser();
    if (!session) {
      this.error.set('No se encontró sesión activa');
      return;
    }

    this.loading.set(true);
    this.error.set('');

    const procesoData: ProcesoDto = {
      ...this.procesoForm.value,
      empresaId: session.empresaId,
      activo: true
    };

    const request = this.isEditMode() && this.procesoId
      ? this.procesoService.actualizar(session.empresaId, this.procesoId, procesoData)
      : this.procesoService.crear(session.empresaId, procesoData);

    request.subscribe({
      next: (proceso) => {
        const mensaje = this.isEditMode()
          ? 'Proceso actualizado exitosamente'
          : 'Proceso creado exitosamente. Ahora puedes agregar actividades y gateways.';

        alert(mensaje);

        // Si es creación, redirigir al detalle para que pueda agregar elementos
        if (!this.isEditMode() && proceso.id) {
          this.router.navigate(['/procesos', proceso.id]);
        } else {
          this.router.navigate(['/procesos']);
        }
      },
      error: (err) => {
        this.error.set(err.error?.mensaje || 'Error al guardar el proceso');
        this.loading.set(false);
        console.error('Error:', err);
      }
    });
  }

  hasError(field: string): boolean {
    const control = this.procesoForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  getErrorMessage(field: string): string {
    const control = this.procesoForm.get(field);
    if (!control || !control.errors) return '';

    if (control.errors['required']) return 'Este campo es requerido';
    if (control.errors['maxlength']) {
      return `Máximo ${control.errors['maxlength'].requiredLength} caracteres`;
    }
    return 'Campo inválido';
  }
}
