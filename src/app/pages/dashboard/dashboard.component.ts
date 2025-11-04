
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProcesoService } from '../../services/proceso.service';
import { UsuarioService } from '../../services/usuario.service';
import { AuthService } from '../../services/auth.service';
import { ProcesoDto } from '../../models/proceso.model';
import { Usuario } from '../../models/usuario.model';
import { RolUsuario } from '../../models/enums';

interface DashboardStats {
  totalProcesos: number;
  procesosBorrador: number;
  procesosPublicados: number;
  totalUsuarios: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  private procesoService = inject(ProcesoService);
  private usuarioService = inject(UsuarioService);
  private authService = inject(AuthService);

  stats = signal<DashboardStats>({
    totalProcesos: 0,
    procesosBorrador: 0,
    procesosPublicados: 0,
    totalUsuarios: 0
  });

  empresaNombre = signal<string>('');
  usuarioNombre = signal<string>('');
  rolUsuario = signal<RolUsuario | null>(null);
  loading = signal<boolean>(true);
  error = signal<string>('');

  // Exponer enum al template
  RolUsuario = RolUsuario;

  ngOnInit(): void {
    this.cargarDatosUsuario();
    this.cargarEstadisticas();
  }

  cargarDatosUsuario(): void {
    const session = this.authService.getCurrentUser();
    if (session) {
      this.empresaNombre.set(session.nombreEmpresa || 'Mi Empresa');
      this.usuarioNombre.set(session.nombreCompleto);
      this.rolUsuario.set(session.rol);
    }
  }

  cargarEstadisticas(): void {
    const session = this.authService.getCurrentUser();
    if (!session) {
      this.error.set('No se encontró sesión activa');
      this.loading.set(false);
      return;
    }

    this.loading.set(true);

    // Cargar procesos
    this.procesoService.listar(session.empresaId).subscribe({
      next: (procesos: ProcesoDto[]) => {
        const borradores = procesos.filter(p => p.estado === 'BORRADOR').length;
        const publicados = procesos.filter(p => p.estado === 'PUBLICADO').length;

        this.stats.update(s => ({
          ...s,
          totalProcesos: procesos.length,
          procesosBorrador: borradores,
          procesosPublicados: publicados
        }));
      },
      error: (err) => {
        console.error('Error al cargar procesos:', err);
      }
    });

    // Cargar usuarios (solo si es admin)
    if (session.rol === RolUsuario.ADMIN) {
      this.usuarioService.listarPorEmpresa(session.empresaId).subscribe({
        next: (usuarios: Usuario[]) => {
          this.stats.update(s => ({
            ...s,
            totalUsuarios: usuarios.length
          }));
          this.loading.set(false);
        },
        error: (err) => {
          console.error('Error al cargar usuarios:', err);
          this.loading.set(false);
        }
      });
    } else {
      this.loading.set(false);
    }
  }
}
