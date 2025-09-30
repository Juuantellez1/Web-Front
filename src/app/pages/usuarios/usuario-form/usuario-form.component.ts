import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { UsuarioService } from '../../../services/usuario.service';

@Component({
  selector: 'app-usuario-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './usuario-form.component.html',
  styleUrl: './usuario-form.component.css'
})
export class UsuarioFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private usuarioService = inject(UsuarioService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  usuarioForm!: FormGroup;
  isEditMode = signal(false);
  usuarioId = signal<number | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);
  showPassword = signal(false);

  ngOnInit(): void {
    this.inicializarFormulario();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.usuarioId.set(+id);
      this.cargarUsuario(+id);
    }
  }

  inicializarFormulario(): void {
    this.usuarioForm = this.fb.group({
      nombre: ['', [Validators.required]],
      apellido: ['', [Validators.required]],
      correo: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(100)]],
      activo: [true]
    });
  }

  cargarUsuario(id: number): void {
    this.loading.set(true);
    this.usuarioService.obtenerPorId(id).subscribe({
      next: (usuario) => {
        this.usuarioForm.patchValue({
          nombre: usuario.nombre,
          apellido: usuario.apellido,
          correo: usuario.correo,
          activo: usuario.activo
        });
        // En modo edición, el password no es obligatorio
        this.usuarioForm.get('password')?.clearValidators();
        this.usuarioForm.get('password')?.setValidators([Validators.minLength(6), Validators.maxLength(100)]);
        this.usuarioForm.get('password')?.updateValueAndValidity();
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Error al cargar el usuario');
        this.loading.set(false);
        console.error('Error:', err);
      }
    });
  }

  onSubmit(): void {
    if (this.usuarioForm.invalid) {
      this.usuarioForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const usuario = this.usuarioForm.value;

    // Si es modo edición y no se ingresó password, lo eliminamos del objeto
    if (this.isEditMode() && !usuario.password) {
      delete usuario.password;
    }

    const operacion = this.isEditMode() && this.usuarioId()
      ? this.usuarioService.actualizar(this.usuarioId()!, usuario)
      : this.usuarioService.crear(usuario);

    operacion.subscribe({
      next: () => {
        this.router.navigate(['/usuarios']);
      },
      error: (err) => {
        this.error.set('Error al guardar el usuario');
        this.loading.set(false);
        console.error('Error:', err);
      }
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword.set(!this.showPassword());
  }

  getErrorMessage(fieldName: string): string {
    const control = this.usuarioForm.get(fieldName);
    if (control?.hasError('required')) {
      return 'Este campo es obligatorio';
    }
    if (control?.hasError('email')) {
      return 'El correo debe tener un formato válido';
    }
    if (control?.hasError('minlength')) {
      const minLength = control.getError('minlength').requiredLength;
      return `Debe tener al menos ${minLength} caracteres`;
    }
    if (control?.hasError('maxlength')) {
      const maxLength = control.getError('maxlength').requiredLength;
      return `No debe superar ${maxLength} caracteres`;
    }
    return '';
  }

  hasError(fieldName: string): boolean {
    const control = this.usuarioForm.get(fieldName);
    return !!(control?.invalid && (control?.dirty || control?.touched));
  }
}
