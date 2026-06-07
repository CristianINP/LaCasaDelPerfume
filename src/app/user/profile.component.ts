import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [],
  template: `
    <div class="profile-container">
      <h2>Mi perfil</h2>
      @if (usuario) {
        <p><strong>Nombre:</strong> {{ usuario.nombre }}</p>
        <p><strong>Correo:</strong> {{ usuario.correo }}</p>
      }
      @if (!usuario && !cargando) {
        <p>No se pudo cargar el perfil.</p>
      }
      <button (click)="cerrarSesion()">Cerrar sesión</button>
    </div>
  `,
})
export class ProfileComponent implements OnInit {
  private auth = inject(AuthService);
  private router = inject(Router);
  private http = inject(HttpClient);

  usuario: { nombre: string; correo: string } | null = null;
  cargando = true;

  ngOnInit(): void {
    this.http.get<{ nombre: string; correo: string }>(`${environment.apiUrl}/user/profile`).subscribe({
      next: (data) => {
        this.usuario = data;
        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
      },
    });
  }

  cerrarSesion(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
