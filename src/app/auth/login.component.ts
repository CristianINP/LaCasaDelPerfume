import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="auth-container">
      <h2>Iniciar sesión</h2>
      <form (ngSubmit)="submit()">
        <input type="email" [(ngModel)]="correo" name="correo" placeholder="Correo" required />
        <input type="password" [(ngModel)]="password" name="password" placeholder="Contraseña" required />
        <button type="submit" [disabled]="cargando">Entrar</button>
      </form>
      @if (mensaje) { <p>{{ mensaje }}</p> }
      <a routerLink="/registro">¿No tienes cuenta? Regístrate</a>
    </div>
  `,
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  correo = '';
  password = '';
  mensaje = '';
  cargando = false;

  async submit(): Promise<void> {
    this.cargando = true;
    this.mensaje = '';
    this.auth.login({ correo: this.correo, password: this.password }).subscribe({
      next: (res) => {
        this.auth.saveToken(res.token);
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.mensaje = err.error?.mensaje || 'Error al iniciar sesión';
        this.cargando = false;
      },
    });
  }
}
