import { Component, inject, signal, OnInit, AfterViewInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.css'
})
export class ResetPasswordComponent implements OnInit, AfterViewInit {
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private authUrl = `${environment.apiUrl}/auth`;

  token = '';
  password = '';
  confirmPassword = '';

  mensaje = signal('');
  esError = signal(false);
  cargando = signal(false);
  exito = signal(false);
  tokenInvalido = signal(false);
  mostrarPassword = signal(false);
  mostrarConfirm = signal(false);

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token') ?? '';
    if (!this.token) {
      this.tokenInvalido.set(true);
      this.mensaje.set('El enlace no es válido. Solicita uno nuevo.');
      this.esError.set(true);
    }
  }

  async restablecer(): Promise<void> {
    this.mensaje.set('');
    this.esError.set(false);

    if (!this.password || !this.confirmPassword) {
      this.mensaje.set('Ambos campos son obligatorios');
      this.esError.set(true);
      return;
    }

    if (this.password.length < 6) {
      this.mensaje.set('La contraseña debe tener al menos 6 caracteres');
      this.esError.set(true);
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.mensaje.set('Las contraseñas no coinciden');
      this.esError.set(true);
      return;
    }

    this.cargando.set(true);

    try {
      await firstValueFrom(
        this.http.post<{ mensaje: string }>(`${this.authUrl}/reset-password`, {
          token: this.token,
          password: this.password
        })
      );
      this.exito.set(true);
      this.mensaje.set('Contraseña restablecida correctamente');
      this.esError.set(false);
    } catch (err: any) {
      const msg = err?.error?.mensaje ?? 'Ocurrió un error. El enlace puede haber expirado.';
      this.mensaje.set(msg);
      this.esError.set(true);
      if (msg.toLowerCase().includes('inválido') || msg.toLowerCase().includes('expirado')) {
        this.tokenInvalido.set(true);
      }
    } finally {
      this.cargando.set(false);
    }
  }

  ngAfterViewInit(): void {
    if (typeof window !== 'undefined') {
      setTimeout(() => this.initStarfield(), 50);
    }
  }

  private initStarfield(): void {
    const sf = document.getElementById('starfield');
    if (!sf || sf.children.length > 0) return;
    const rand = (a: number, b: number) => Math.random() * (b - a) + a;

    for (let i = 0; i < 280; i++) {
      const s = document.createElement('div');
      s.className = 'star';
      const size = rand(0.5, 2.5);
      const baseOp = rand(0.3, 0.9);
      s.style.cssText = `left:${rand(0,100)}%;top:${rand(0,100)}%;width:${size}px;height:${size}px;opacity:${baseOp};--base-op:${baseOp};`;
      if (Math.random() < 0.4) {
        const dur = rand(2, 6);
        s.classList.add(Math.random() < 0.5 ? 'twinkle' : 'twinkle-fast');
        s.style.setProperty('--dur', dur + 's');
        s.style.setProperty('--delay', rand(0, 5) + 's');
      }
      sf.appendChild(s);
    }

    for (let i = 0; i < 18; i++) {
      const s = document.createElement('div');
      s.className = 'star twinkle';
      const size = rand(2, 4);
      const color = Math.random() < 0.5 ? '#b0c8ff' : '#c8e0ff';
      s.style.cssText = `left:${rand(0,100)}%;top:${rand(0,100)}%;width:${size}px;height:${size}px;background:${color};box-shadow:0 0 ${size*3}px ${color};--base-op:0.7;--dur:${rand(3,7)}s;--delay:${rand(0,4)}s;`;
      sf.appendChild(s);
    }

    const launch = () => {
      const ss = document.createElement('div');
      ss.className = 'shooting-star';
      const dur = rand(1.8, 3.2);
      ss.style.cssText = `top:${rand(5,55)}%;left:${rand(-10,60)}%;width:${rand(120,280)}px;transform:rotate(${rand(-20,-5)}deg);--dist:${rand(250,500)}px;--sdur:${dur}s;animation-delay:${rand(0,0.5)}s;`;
      sf.appendChild(ss);
      setTimeout(() => ss.remove(), (dur + 1) * 1000);
    };
    const schedule = () => { launch(); setTimeout(schedule, rand(3500, 9000)); };
    setTimeout(schedule, 1500);
    setTimeout(schedule, 5000);
  }
}
