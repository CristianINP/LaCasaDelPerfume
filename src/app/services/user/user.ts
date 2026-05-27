import { Injectable, inject, signal, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface User {
  id_usuario: number;
  email: string;
  nombre: string;
  apellido?: string;
  telefono?: string;
}

export interface UserRegistrationData {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  telefono?: string;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);
  private authUrl = `${environment.apiUrl}/auth`;

  usuario = signal<User | null>(null);

  constructor() {
    this.checkExistingSession();
  }

  private checkExistingSession(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const savedUser = localStorage.getItem('usuario_lcperfume');
    const savedToken = localStorage.getItem('token_lcperfume');
    if (savedUser && savedToken) {
      try {
        this.usuario.set(JSON.parse(savedUser));
      } catch {
        this.clearUsuario();
      }
    }
  }

  registrarUsuario(data: UserRegistrationData) {
    return this.http.post<{ mensaje: string }>(`${this.authUrl}/register`, data);
  }

  loginUsuario(data: { email: string; password: string }) {
    return this.http.post<{ mensaje: string; token: string; usuario: { id: number; nombre: string; email: string } }>(
      `${this.authUrl}/login`, data
    );
  }

  setUsuario(usuario: User, token: string): void {
    this.usuario.set(usuario);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('usuario_lcperfume', JSON.stringify(usuario));
      localStorage.setItem('token_lcperfume', token);
    }
  }

  getToken(): string | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    return localStorage.getItem('token_lcperfume');
  }

  clearUsuario(): void {
    this.usuario.set(null);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('usuario_lcperfume');
      localStorage.removeItem('token_lcperfume');
    }
  }

  getUsuarioActual(): User | null {
    return this.usuario();
  }
}
