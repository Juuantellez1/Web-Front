import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { EmpresaService } from '../../../services/empresa.service';
import { Empresa } from '../../../models/empresa.model';

@Component({
  selector: 'app-empresa-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './empresa-list.component.html',
  styleUrl: './empresa-list.component.css'
})
export class EmpresaListComponent implements OnInit {
  private empresaService = inject(EmpresaService);

  empresas = signal<Empresa[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.cargarEmpresas();
  }

  cargarEmpresas(): void {
    this.loading.set(true);
    this.error.set(null);

    this.empresaService.listar().subscribe({
      next: (data) => {
        this.empresas.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Error al cargar las empresas');
        this.loading.set(false);
        console.error('Error:', err);
      }
    });
  }

  eliminar(id: number | undefined): void {
    if (!id) return;

    if (confirm('¿Estás seguro de eliminar esta empresa?')) {
      this.empresaService.eliminar(id).subscribe({
        next: () => {
          this.cargarEmpresas();
        },
        error: (err) => {
          alert('Error al eliminar la empresa');
          console.error('Error:', err);
        }
      });
    }
  }
}
