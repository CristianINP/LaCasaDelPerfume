import { Component, inject, signal, AfterViewInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css'
})
export class ForgotPasswordComponent implements AfterViewInit {
  private http = inject(HttpClient);
  private authUrl = `${environment.apiUrl}/auth`;

  email = '';
  mensaje = signal('');
  esError = signal(false);
  cargando = signal(false);
  enviado = signal(false);

  async enviar(): Promise<void> {
    if (!this.email) {
      this.mensaje.set('El correo electrónico es obligatorio');
      this.esError.set(true);
      return;
    }

    this.cargando.set(true);
    this.mensaje.set('');
    this.esError.set(false);

    try {
      await firstValueFrom(
        this.http.post<{ mensaje: string }>(`${this.authUrl}/forgot-password`, { email: this.email })
      );
      this.enviado.set(true);
      this.mensaje.set('Si tu correo está registrado, recibirás un enlace en breve. Si no ves el correo, revisa tu carpeta de spam o correos no deseados.');
      this.esError.set(false);
    } catch {
      this.mensaje.set('Ocurrió un error al procesar la solicitud. Inténtalo de nuevo más tarde.');
      this.esError.set(true);
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
