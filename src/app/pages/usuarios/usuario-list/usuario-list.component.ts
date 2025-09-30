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
        this.usuarios.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Error al cargar los usuarios');
        this.loading.set(false);
        console.error('Error:', err);
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
}
