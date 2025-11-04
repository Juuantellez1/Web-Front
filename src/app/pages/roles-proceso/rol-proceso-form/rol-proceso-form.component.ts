import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { RolProcesoService } from '../../../services/rol-proceso.service';
import { AuthService } from '../../../services/auth.service';
import { RolProcesoDto } from '../../../models/rol-proceso.model';

@Component({
  selector: 'app-rol-proceso-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './rol-proceso-form.component.html',
  styleUrl: './rol-proceso-form.component.css'
})
export class RolProcesoFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private rolProcesoService = inject(RolProcesoService);
  private authService = inject(AuthService);

  rolForm!: FormGroup;
  loading = signal<boolean>(false);
  error = signal<string>('');
  isEditMode = signal<boolean>(false);
  rolId: number | null = null;

  ngOnInit(): void {
    this.inicializarFormulario();
    this.verificarModoEdicion();
  }

  inicializarFormulario(): void {
    this.rolForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(100)]],
      descripcion: ['', [Validators.maxLength(500)]]
    });
  }

  verificarModoEdicion(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.rolId = parseInt(id, 10);
      this.isEditMode.set(true);
      this.cargarRol();
    }
  }

  cargarRol(): void {
    if (!this.rolId) return;

    const session = this.authService.getCurrentUser();
    if (!session) {
      this.error.set('No se encontró sesión activa');
      return;
    }

    this.loading.set(true);
    this.rolProcesoService.obtenerPorId(session.empresaId, this.rolId).subscribe({
      next: (rol: RolProcesoDto) => {
        this.rolForm.patchValue({
          nombre: rol.nombre,
          descripcion: rol.descripcion
        });
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Error al cargar el rol');
        this.loading.set(false);
        console.error('Error:', err);
      }
    });
  }

  onSubmit(): void {
    if (this.rolForm.invalid) {
      this.rolForm.markAllAsTouched();
      return;
    }

    const session = this.authService.getCurrentUser();
    if (!session) {
      this.error.set('No se encontró sesión activa');
      return;
    }

    this.loading.set(true);
    this.error.set('');

    const rolData: RolProcesoDto = {
      ...this.rolForm.value,
      empresaId: session.empresaId,
      activo: true
    };

    const request = this.isEditMode() && this.rolId
      ? this.rolProcesoService.actualizar(session.empresaId, this.rolId, rolData)
      : this.rolProcesoService.crear(session.empresaId, rolData);

    request.subscribe({
      next: () => {
        alert(this.isEditMode() ? 'Rol actualizado exitosamente' : 'Rol creado exitosamente');
        this.router.navigate(['/roles-proceso']);
      },
      error: (err) => {
        this.error.set(err.error?.mensaje || 'Error al guardar el rol');
        this.loading.set(false);
        console.error('Error:', err);
      }
    });
  }

  hasError(field: string): boolean {
    const control = this.rolForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  getErrorMessage(field: string): string {
    const control = this.rolForm.get(field);
    if (!control || !control.errors) return '';

    if (control.errors['required']) return 'Este campo es requerido';
    if (control.errors['maxlength']) {
      return `Máximo ${control.errors['maxlength'].requiredLength} caracteres`;
    }
    return 'Campo inválido';
  }
}
