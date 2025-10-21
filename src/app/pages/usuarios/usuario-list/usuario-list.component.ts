
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { UsuarioService } from '../../../services/usuario.service';
import { Usuario } from '../../../models/usuario.model';

@Component({
  selector: 'app-usuario-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './usuario-list.component.html',
  styleUrl: './usuario-list.component.css'
})
export class UsuarioListComponent implements OnInit {
  private usuarioService = inject(UsuarioService);

  usuarios = signal<Usuario[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios(): void {
    this.loading.set(true);
    this.error.set(null);

    this.usuarioService.listar().subscribe({
      next: (data) => {
        console.log('Usuarios recibidos:', data); // Para debug
        this.usuarios.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error completo:', err);

        if (err.status === 500) {
          this.error.set('Error del servidor al cargar usuarios. Por favor, contacta al administrador.');
        } else if (err.status === 403) {
          this.error.set('No tienes permisos para ver los usuarios.');
        } else if (err.status === 401) {
          this.error.set('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
        } else {
          this.error.set('Error al cargar los usuarios. Por favor, intenta nuevamente.');
        }

        this.loading.set(false);
      }
    });
  }

  eliminar(id: number | undefined): void {
    if (!id) return;

    if (confirm('¿Estás seguro de eliminar este usuario?')) {
      this.usuarioService.eliminar(id).subscribe({
        next: () => {
          this.cargarUsuarios();
        },
        error: (err) => {
          alert('Error al eliminar el usuario');
          console.error('Error:', err);
        }
      });
    }
  }

  toggleActivo(usuario: Usuario): void {
    if (!usuario.id) return;

    const usuarioActualizado = { ...usuario, activo: !usuario.activo };
    this.usuarioService.actualizar(usuario.id, usuarioActualizado).subscribe({
      next: () => {
        this.cargarUsuarios();
      },
      error: (err) => {
        alert('Error al cambiar el estado del usuario');
        console.error('Error:', err);
      }
    });
  }

  getRolLabel(rol: string): string {
    const labels: Record<string, string> = {
      'ADMIN': 'Administrador',
      'EDITOR': 'Editor',
      'LECTOR': 'Lector'
    };
    return labels[rol] || rol;
  }
}
