
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { EmpresaService } from '../../services/empresa.service';
import { CrearEmpresaRequest } from '../../models/registro.model';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.css'
})
export class RegistroComponent implements OnInit {
  private fb = inject(FormBuilder);
  private empresaService = inject(EmpresaService);
  private router = inject(Router);

  registroForm!: FormGroup;
  loading = signal(false);
  error = signal<string | null>(null);
  success = signal(false);
  showPassword = signal(false);
  showConfirmPassword = signal(false);

  ngOnInit(): void {
    this.inicializarFormulario();
  }

  inicializarFormulario(): void {
    this.registroForm = this.fb.group({
      nombreEmpresa: ['', [Validators.required, Validators.minLength(3)]],
      nit: ['', [Validators.required, Validators.maxLength(30)]],
      correoEmpresa: ['', [Validators.required, Validators.email]],

      nombreAdmin: ['', [Validators.required, Validators.minLength(3)]],
      apellidoAdmin: ['', [Validators.required, Validators.minLength(2)]],
      correoAdmin: ['', [Validators.required, Validators.email]],
      passwordAdmin: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(100)]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  passwordMatchValidator(group: FormGroup) {
    const password = group.get('passwordAdmin')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  onSubmit(): void {
    if (this.registroForm.invalid) {
      this.registroForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const request: CrearEmpresaRequest = {
      nombreEmpresa: this.registroForm.value.nombreEmpresa,
      nit: this.registroForm.value.nit,
      correoEmpresa: this.registroForm.value.correoEmpresa,
      nombreAdmin: this.registroForm.value.nombreAdmin,
      apellidoAdmin: this.registroForm.value.apellidoAdmin,
      correoAdmin: this.registroForm.value.correoAdmin,
      passwordAdmin: this.registroForm.value.passwordAdmin
    };

    console.log('Enviando request:', request);

    this.empresaService.crearConAdmin(request).subscribe({
      next: (response) => {
        console.log('Registro exitoso:', response);
        this.success.set(true);
        this.loading.set(false);

        // Redirigir al login después de 2 segundos
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (err) => {
        console.error('Error completo:', err);
        const errorMessage = err.error?.message
          || err.error?.error
          || err.message
          || 'Error al registrar. Por favor, intenta nuevamente.';
        this.error.set(errorMessage);
        this.loading.set(false);
      }
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword.set(!this.showPassword());
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword.set(!this.showConfirmPassword());
  }

  getErrorMessage(fieldName: string): string {
    const control = this.registroForm.get(fieldName);

    if (control?.hasError('required')) {
      const labels: Record<string, string> = {
        nombreEmpresa: 'El nombre de la empresa',
        nit: 'El NIT',
        correoEmpresa: 'El correo de la empresa',
        nombreAdmin: 'Tu nombre',
        apellidoAdmin: 'Tu apellido',
        correoAdmin: 'El correo',
        passwordAdmin: 'La contraseña',
        confirmPassword: 'La confirmación de contraseña'
      };
      return `${labels[fieldName]} es obligatorio`;
    }

    if (control?.hasError('email')) {
      return 'El correo debe tener un formato válido';
    }

    if (control?.hasError('minlength')) {
      const minLength = control.errors?.['minlength'].requiredLength;
      return `Debe tener al menos ${minLength} caracteres`;
    }

    if (control?.hasError('maxlength')) {
      const maxLength = control.errors?.['maxlength'].requiredLength;
      return `No debe superar ${maxLength} caracteres`;
    }

    if (fieldName === 'confirmPassword' && this.registroForm.hasError('passwordMismatch')) {
      return 'Las contraseñas no coinciden';
    }

    return '';
  }

  hasError(fieldName: string): boolean {
    const control = this.registroForm.get(fieldName);
    const formError = fieldName === 'confirmPassword' && this.registroForm.hasError('passwordMismatch');
    return !!(control?.invalid && (control?.dirty || control?.touched)) || formError;
  }
}
