import { Component, inject, AfterViewInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { UserService } from '../../services/user/user';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent implements AfterViewInit {
  private userService = inject(UserService);
  private router = inject(Router);

  email = '';
  password = '';
  nombre = '';
  apellido = '';
  telefono = '';
  rfc = '';
  regimenFiscal = '';
  regimenFiscalOtro = false;
  regimenFiscalCustom = '';
  usoCfdi = '';
  usoCfdiOtro = false;
  usoCfdiCustom = '';

  modoRegistro = false;
  mensaje = signal('');
  cargando = signal(false);
  mostrarPassword = signal(false);

  alternarModo(): void {
    this.modoRegistro = !this.modoRegistro;
    this.limpiar();
  }

  onRegimenFiscalChange(): void {
    this.regimenFiscalOtro = this.regimenFiscal === 'otro';
    if (!this.regimenFiscalOtro) this.regimenFiscalCustom = '';
  }

  onUsoCfdiChange(): void {
    this.usoCfdiOtro = this.usoCfdi === 'otro';
    if (!this.usoCfdiOtro) this.usoCfdiCustom = '';
  }

  async submit(): Promise<void> {
    if (!this.email || !this.password) {
      this.mensaje.set('Email y contraseña son obligatorios');
      return;
    }

    this.cargando.set(true);
    this.mensaje.set('');

    try {
      if (this.modoRegistro) {
        if (!this.nombre || !this.apellido) {
          this.mensaje.set('Nombre y apellido son obligatorios');
          this.cargando.set(false);
          return;
        }
        if (!this.rfc.trim()) {
          this.mensaje.set('El RFC es obligatorio para generar tu recibo');
          this.cargando.set(false);
          return;
        }
        const regimenFinalizado = this.regimenFiscalOtro ? this.regimenFiscalCustom : this.regimenFiscal;
        if (!regimenFinalizado) {
          this.mensaje.set('Selecciona tu Régimen Fiscal');
          this.cargando.set(false);
          return;
        }
        const usoCfdiFinalizado = this.usoCfdiOtro ? this.usoCfdiCustom : this.usoCfdi;
        if (!usoCfdiFinalizado) {
          this.mensaje.set('Selecciona el Uso del CFDI');
          this.cargando.set(false);
          return;
        }
        await firstValueFrom(
          this.userService.registrarUsuario({
            nombre: this.nombre,
            apellido: this.apellido,
            email: this.email,
            password: this.password,
            telefono: this.telefono || undefined,
            rfc: this.rfc || undefined,
            regimenFiscal: regimenFinalizado || undefined,
            usoCfdi: usoCfdiFinalizado || undefined
          })
        );
      }

      const resp = await firstValueFrom(
        this.userService.loginUsuario({ email: this.email, password: this.password })
      );

      this.userService.setUsuario(
        {
          id_usuario: resp.usuario.id,
          nombre: resp.usuario.nombre,
          email: resp.usuario.email,
          rol: resp.usuario.rol,
          rfc: resp.usuario.rfc || undefined,
          regimenFiscal: resp.usuario.regimenFiscal || undefined,
          usoCfdi: resp.usuario.usoCfdi || undefined
        },
        resp.token
      );

      this.router.navigate([resp.usuario.rol === 'admin' ? '/admin/inventario' : '/']);
    } catch (error: any) {
      this.mensaje.set(error.error?.mensaje || 'Error al procesar la solicitud');
    } finally {
      this.cargando.set(false);
    }
  }

  esError(): boolean {
    const m = this.mensaje().toLowerCase();
    return m.includes('error') || m.includes('incorrecta') || m.includes('inválido') || m.includes('obligatorio') || m.includes('existe');
  }

  limpiar(): void {
    this.email = '';
    this.password = '';
    this.nombre = '';
    this.apellido = '';
    this.telefono = '';
    this.rfc = '';
    this.regimenFiscal = '';
    this.regimenFiscalOtro = false;
    this.regimenFiscalCustom = '';
    this.usoCfdi = '';
    this.usoCfdiOtro = false;
    this.usoCfdiCustom = '';
    this.mensaje.set('');
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
