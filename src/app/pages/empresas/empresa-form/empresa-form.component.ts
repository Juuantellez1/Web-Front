import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { EmpresaService } from '../../../services/empresa.service';

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
    this.inicializarFormulario();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.empresaId.set(+id);
      this.cargarEmpresa(+id);
    }
  }

  inicializarFormulario(): void {
    this.empresaForm = this.fb.group({
      nombre: ['', [Validators.required]],
      nit: ['', [Validators.required, Validators.maxLength(30)]],
      correo: ['', [Validators.required, Validators.email]]
    });
  }

  cargarEmpresa(id: number): void {
    this.loading.set(true);
    this.empresaService.obtenerPorId(id).subscribe({
      next: (empresa) => {
        this.empresaForm.patchValue(empresa);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Error al cargar la empresa');
        this.loading.set(false);
        console.error('Error:', err);
      }
    });
  }

  onSubmit(): void {
    if (this.empresaForm.invalid) {
      this.empresaForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const empresa = this.empresaForm.value;

    const operacion = this.isEditMode() && this.empresaId()
      ? this.empresaService.actualizar(this.empresaId()!, empresa)
      : this.empresaService.crear(empresa);

    operacion.subscribe({
      next: () => {
        this.router.navigate(['/empresas']);
      },
      error: (err) => {
        this.error.set('Error al guardar la empresa');
        this.loading.set(false);
        console.error('Error:', err);
      }
    });
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
    return '';
  }

  hasError(fieldName: string): boolean {
    const control = this.empresaForm.get(fieldName);
    return !!(control?.invalid && (control?.dirty || control?.touched));
  }
}
