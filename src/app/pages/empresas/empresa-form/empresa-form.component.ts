
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { EmpresaService } from '../../../services/empresa.service';
import { CrearEmpresaRequest } from '../../../models/registro.model';
import { Empresa } from '../../../models/empresa.model';

@Component({
  selector: 'app-empresa-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './empresa-form.component.html',
  styleUrl: './empresa-form.component.css'
})
export class EmpresaFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private empresaService = inject(EmpresaService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  empresaForm!: FormGroup;
  isEditMode = signal(false);
  empresaId = signal<number | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    // Determinar modo ANTES de inicializar formulario
    if (id) {
      this.isEditMode.set(true);
      this.empresaId.set(+id);
    }

    this.inicializarFormulario();

    // Cargar datos si es edición
    if (this.isEditMode() && this.empresaId()) {
      this.cargarEmpresa(this.empresaId()!);
    }
  }

  inicializarFormulario(): void {
    // Campos base siempre presentes
    const baseFields = {
      nombre: ['', [Validators.required]],
      nit: ['', [Validators.required, Validators.maxLength(30)]],
      correo: ['', [Validators.required, Validators.email]]
    };

    // Si es CREACIÓN, agregar campos del administrador
    if (!this.isEditMode()) {
      this.empresaForm = this.fb.group({
        ...baseFields,
        nombreAdmin: ['', [Validators.required]],
        apellidoAdmin: ['', [Validators.required]],
        correoAdmin: ['', [Validators.required, Validators.email]],
        passwordAdmin: ['', [Validators.required, Validators.minLength(6)]]
      });
    } else {
      // Si es EDICIÓN, solo campos de empresa
      this.empresaForm = this.fb.group(baseFields);
    }
  }

  cargarEmpresa(id: number): void {
    this.loading.set(true);
    this.empresaService.obtenerPorId(id).subscribe({
      next: (empresa) => {
        this.empresaForm.patchValue({
          nombre: empresa.nombre,
          nit: empresa.nit,
          correo: empresa.correo
        });
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Error al cargar la empresa');
        this.loading.set(false);
        console.error('Error al cargar empresa:', err);
      }
    });
  }

  onSubmit(): void {
    console.log('=== INICIO onSubmit ===');
    console.log('Modo edición:', this.isEditMode());
    console.log('Formulario válido:', this.empresaForm.valid);
    console.log('Valores:', this.empresaForm.value);

    if (this.empresaForm.invalid) {
      this.empresaForm.markAllAsTouched();
      console.log('Formulario inválido, abortando');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    if (this.isEditMode() && this.empresaId()) {
      // Solo enviar datos de la empresa
      const empresaData: Empresa = {
        nombre: this.empresaForm.value.nombre,
        nit: this.empresaForm.value.nit,
        correo: this.empresaForm.value.correo,
        activo: true // Por defecto al actualizar
      };

      console.log('Actualizando empresa ID:', this.empresaId());
      console.log('Datos a enviar:', empresaData);

      this.empresaService.actualizar(this.empresaId()!, empresaData).subscribe({
        next: (response) => {
          console.log('Empresa actualizada exitosamente:', response);
          alert('Empresa actualizada exitosamente');
          this.router.navigate(['/empresas']);
        },
        error: (err) => {
          console.error('Error al actualizar empresa:', err);
          const errorMsg = err.error?.mensaje || err.error || 'Error al actualizar la empresa';
          this.error.set(errorMsg);
          this.loading.set(false);
        }
      });
    } else {
      // Enviar empresa + datos del administrador
      const request: CrearEmpresaRequest = {
        nombreEmpresa: this.empresaForm.value.nombre,
        nit: this.empresaForm.value.nit,
        correoEmpresa: this.empresaForm.value.correo,
        nombreAdmin: this.empresaForm.value.nombreAdmin,
        apellidoAdmin: this.empresaForm.value.apellidoAdmin,
        correoAdmin: this.empresaForm.value.correoAdmin,
        passwordAdmin: this.empresaForm.value.passwordAdmin
      };

      console.log('Creando empresa con admin:', request);

      this.empresaService.crearConAdmin(request).subscribe({
        next: (response) => {
          console.log('Empresa creada exitosamente:', response);
          alert(`Empresa "${response.empresa.nombre}" creada exitosamente con usuario administrador`);
          this.router.navigate(['/empresas']);
        },
        error: (err) => {
          console.error('Error al crear empresa:', err);
          const errorMsg = err.error?.mensaje || err.error || 'Error al crear la empresa';
          this.error.set(errorMsg);
          this.loading.set(false);
        }
      });
    }
  }

  getErrorMessage(fieldName: string): string {
    const control = this.empresaForm.get(fieldName);
    if (control?.hasError('required')) {
      return 'Este campo es obligatorio';
    }
    if (control?.hasError('email')) {
      return 'El correo debe tener un formato válido';
    }
    if (control?.hasError('maxlength')) {
      return 'El NIT no debe superar 30 caracteres';
    }
    if (control?.hasError('minlength')) {
      return 'La contraseña debe tener al menos 6 caracteres';
    }
    return '';
  }

  hasError(fieldName: string): boolean {
    const control = this.empresaForm.get(fieldName);
    return !!(control?.invalid && (control?.dirty || control?.touched));
  }
}
