import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LoginRequest } from '../../models/login.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  loginForm!: FormGroup;
  loading = signal(false);
  error = signal<string | null>(null);
  showPassword = signal(false);
  returnUrl: string = '/dashboard';

  ngOnInit(): void {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
    this.inicializarFormulario();
  }

  inicializarFormulario(): void {
    this.loginForm = this.fb.group({
      correo: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const credentials: LoginRequest = this.loginForm.value;

    console.log('Intentando login con:', credentials);

    this.authService.login(credentials).subscribe({
      next: (response) => {
        console.log('Respuesta del servidor:', response);
        if (response.exitoso) {
          this.loading.set(false);
          setTimeout(() => {
            this.router.navigate([this.returnUrl]);
          }, 0);
        } else {
          this.error.set(response.mensaje || 'Error al iniciar sesión');
          this.loading.set(false);
        }
      },
      error: (err) => {
        console.error('Error completo en login:', err);
        console.error('Status:', err.status);
        console.error('Error object:', err.error);

        let errorMessage = 'Error al iniciar sesión. Por favor verifica tus credenciales.';

        if (err.status === 0) {
          errorMessage = 'No se puede conectar con el servidor. Verifica que el backend esté ejecutándose en http://localhost:8080';
        } else if (err.status === 401) {
          errorMessage = err.error?.mensaje || 'Credenciales incorrectas. Por favor verifica tu correo y contraseña.';
        } else if (err.error?.mensaje) {
          errorMessage = err.error.mensaje;
        } else if (err.error?.message) {
          errorMessage = err.error.message;
        } else if (err.message) {
          errorMessage = err.message;
        }

        this.error.set(errorMessage);
        this.loading.set(false);
      }
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword.set(!this.showPassword());
  }

  getErrorMessage(fieldName: string): string {
    const control = this.loginForm.get(fieldName);

    if (control?.hasError('required')) {
      return `${fieldName === 'correo' ? 'El correo' : 'La contraseña'} es obligatoria`;
    }

    if (control?.hasError('email')) {
      return 'El correo debe tener un formato válido';
    }

    if (control?.hasError('minlength')) {
      return 'La contraseña debe tener al menos 6 caracteres';
    }

    return '';
  }

  hasError(fieldName: string): boolean {
    const control = this.loginForm.get(fieldName);
    return !!(control?.invalid && (control?.dirty || control?.touched));
  }
}
