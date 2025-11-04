
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { UsuarioService } from '../../../services/usuario.service';
import { AuthService } from '../../../services/auth.service';
import { Usuario } from '../../../models/usuario.model';
import { RolUsuario } from '../../../models/enums';

@Component({
  selector: 'app-usuario-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './usuario-form.component.html',
  styleUrl: './usuario-form.component.css'
})
export class UsuarioFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private usuarioService = inject(UsuarioService);
  private authService = inject(AuthService);

  usuarioForm!: FormGroup;
  loading = signal<boolean>(false);
  error = signal<string>('');
  isEditMode = signal<boolean>(false);
  usuarioId: number | null = null;

  // Exponer enum al template
  RolUsuario = RolUsuario;
  roles = Object.values(RolUsuario);

  ngOnInit(): void {
    this.inicializarFormulario();
    this.verificarModoEdicion();
  }

  inicializarFormulario(): void {
    this.usuarioForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(100)]],
      apellido: ['', [Validators.required, Validators.maxLength(100)]],
      correo: ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
      password: [''], // Sin validación requerida para edición
      rolUsuario: [RolUsuario.LECTOR, [Validators.required]],
      activo: [true]
    });
  }

  verificarModoEdicion(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.usuarioId = parseInt(id, 10);
      this.isEditMode.set(true);
      this.cargarUsuario();
    } else {
      // En modo creación, password es obligatorio
      this.usuarioForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
      this.usuarioForm.get('password')?.updateValueAndValidity();
    }
  }

  cargarUsuario(): void {
    if (!this.usuarioId) return;

    const session = this.authService.getCurrentUser();
    if (!session) {
      this.error.set('No se encontró sesión activa');
      return;
    }

    this.loading.set(true);
    this.usuarioService.obtenerPorId(this.usuarioId).subscribe({
      next: (usuario: Usuario) => {
        this.usuarioForm.patchValue({
          nombre: usuario.nombre,
          apellido: usuario.apellido,
          correo: usuario.correo,
          rolUsuario: usuario.rolUsuario,
          activo: usuario.activo
        });
        // No establecemos el password
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

    const session = this.authService.getCurrentUser();
    if (!session) {
      this.error.set('No se encontró sesión activa');
      return;
    }

    this.loading.set(true);
    this.error.set('');

    // Construir el objeto usuario
    const usuarioData: Usuario = {
      empresaId: session.empresaId,
      nombre: this.usuarioForm.value.nombre,
      apellido: this.usuarioForm.value.apellido,
      correo: this.usuarioForm.value.correo,
      rolUsuario: this.usuarioForm.value.rolUsuario,
      activo: this.usuarioForm.value.activo
    };

    // Solo incluir password si fue ingresado
    const passwordValue = this.usuarioForm.value.password;
    if (passwordValue && passwordValue.trim() !== '') {
      usuarioData.password = passwordValue;
    }

    const request = this.isEditMode() && this.usuarioId
      ? this.usuarioService.actualizar(this.usuarioId, usuarioData)
      : this.usuarioService.crear(usuarioData);

    request.subscribe({
      next: () => {
        alert(this.isEditMode() ? 'Usuario actualizado exitosamente' : 'Usuario creado exitosamente');
        this.router.navigate(['/usuarios']);
      },
      error: (err) => {
        const errorMsg = err.error?.mensaje || err.error?.error || 'Error al guardar el usuario';
        this.error.set(errorMsg);
        this.loading.set(false);
        console.error('Error completo:', err);

        // Mostrar detalles del error en consola para debugging
        if (err.error) {
          console.error('Detalles del error:', JSON.stringify(err.error, null, 2));
        }
      }
    });
  }

  hasError(field: string): boolean {
    const control = this.usuarioForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  getErrorMessage(field: string): string {
    const control = this.usuarioForm.get(field);
    if (!control || !control.errors) return '';

    if (control.errors['required']) return 'Este campo es requerido';
    if (control.errors['email']) return 'Correo electrónico inválido';
    if (control.errors['minlength']) {
      return `Mínimo ${control.errors['minlength'].requiredLength} caracteres`;
    }
    if (control.errors['maxlength']) {
      return `Máximo ${control.errors['maxlength'].requiredLength} caracteres`;
    }
    return 'Campo inválido';
  }
}
