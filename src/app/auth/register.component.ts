import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="auth-container">
      <h2>Registrarse</h2>
      <form (ngSubmit)="submit()">
        <input type="text" [(ngModel)]="nombre" name="nombre" placeholder="Nombre" required />
        <input type="email" [(ngModel)]="correo" name="correo" placeholder="Correo" required />
        <input type="password" [(ngModel)]="password" name="password" placeholder="Contraseña" required />
        <button type="submit" [disabled]="cargando">Registrarse</button>
      </form>
      @if (mensaje) { <p>{{ mensaje }}</p> }
      <a routerLink="/login">¿Ya tienes cuenta? Inicia sesión</a>
    </div>
  `,
})
export class RegisterComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  nombre = '';
  correo = '';
  password = '';
  mensaje = '';
  cargando = false;

  async submit(): Promise<void> {
    this.cargando = true;
    this.mensaje = '';
    this.auth.register({ nombre: this.nombre, correo: this.correo, password: this.password }).subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.mensaje = err.error?.mensaje || 'Error al registrarse';
        this.cargando = false;
      },
    });
  }
}
