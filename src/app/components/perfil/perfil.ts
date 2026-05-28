import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { UserService } from '../../services/user/user';
import { Navbar } from '../navbar/navbar';
import { environment } from '../../../environments/environment';
import { firstValueFrom } from 'rxjs';

interface PerfilData {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
}

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [FormsModule, RouterLink, Navbar],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css',
})
export class PerfilComponent implements OnInit {
  private http = inject(HttpClient);
  userService = inject(UserService);

  perfil = signal<PerfilData | null>(null);
  loading = signal(true);
  guardando = signal(false);
  error = signal('');
  exito = signal('');

  mostrarCambioPassword = false;
  mostrarPasswordActual = false;
  mostrarPasswordNueva = false;

  form = { nombre: '', apellido: '', telefono: '' };
  passwordForm = { nueva: '', confirmar: '' };

  async ngOnInit() {
    try {
      const data = await firstValueFrom(
        this.http.get<PerfilData>(`${environment.apiUrl}/user/profile`)
      );
      this.perfil.set(data);
      this.form = { nombre: data.nombre, apellido: data.apellido ?? '', telefono: data.telefono ?? '' };
    } catch {
      this.error.set('Error al cargar el perfil');
    } finally {
      this.loading.set(false);
    }
  }

  async guardarPerfil() {
    if (!this.form.nombre.trim()) {
      this.error.set('El nombre es obligatorio');
      return;
    }

    if (this.mostrarCambioPassword) {
      if (!this.passwordForm.nueva) {
        this.error.set('Ingresa la nueva contraseña');
        return;
      }
      if (this.passwordForm.nueva !== this.passwordForm.confirmar) {
        this.error.set('Las contraseñas no coinciden');
        return;
      }
      if (this.passwordForm.nueva.length < 6) {
        this.error.set('La contraseña debe tener al menos 6 caracteres');
        return;
      }
    }

    this.guardando.set(true);
    this.error.set('');
    this.exito.set('');

    try {
      const body: any = { ...this.form };
      if (this.mostrarCambioPassword && this.passwordForm.nueva) {
        body.password = this.passwordForm.nueva;
      }

      await firstValueFrom(
        this.http.put<{ success: boolean; mensaje: string }>(`${environment.apiUrl}/user/profile`, body)
      );

      // Actualizar nombre en el signal del servicio
      const usuario = this.userService.getUsuarioActual();
      if (usuario) {
        this.userService.setUsuario({ ...usuario, nombre: this.form.nombre }, this.userService.getToken()!);
      }

      this.perfil.update(p => p ? { ...p, nombre: this.form.nombre, apellido: this.form.apellido, telefono: this.form.telefono } : p);
      this.exito.set('Perfil actualizado correctamente');
      this.mostrarCambioPassword = false;
      this.passwordForm = { nueva: '', confirmar: '' };
    } catch {
      this.error.set('Error al guardar los cambios');
    } finally {
      this.guardando.set(false);
    }
  }
}
