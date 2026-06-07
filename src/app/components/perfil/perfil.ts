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
  rfc: string | null;
  regimen_fiscal: string | null;
  uso_cfdi: string | null;
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

  form = {
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    rfc: '',
    regimenFiscal: '',
    regimenFiscalOtro: false,
    regimenFiscalCustom: '',
    usoCfdi: '',
    usoCfdiOtro: false,
    usoCfdiCustom: '',
  };
  passwordForm = { nueva: '', confirmar: '' };

  // Opciones predefinidas para validar si el valor del DB coincide con alguna
  private readonly REGIMENES = ['605','606','612','614','615','616','621','622','626'];
  private readonly USOS_CFDI = ['S01','G01','G03','I04','D01','D05','D07','D10','CP01','CN01'];

  async ngOnInit() {
    try {
      const data = await firstValueFrom(
        this.http.get<PerfilData>(`${environment.apiUrl}/user/profile`)
      );
      this.perfil.set(data);
      this.populateForm(data);
    } catch {
      this.error.set('Error al cargar el perfil');
    } finally {
      this.loading.set(false);
    }
  }

  private populateForm(data: PerfilData) {
    const rfVal = data.regimen_fiscal ?? '';
    const ucVal = data.uso_cfdi ?? '';

    const rfEsOtro = rfVal !== '' && !this.REGIMENES.includes(rfVal);
    const ucEsOtro = ucVal !== '' && !this.USOS_CFDI.includes(ucVal);

    this.form = {
      nombre: data.nombre,
      apellido: data.apellido ?? '',
      email: data.email,
      telefono: data.telefono ?? '',
      rfc: data.rfc ?? '',
      regimenFiscal: rfEsOtro ? 'otro' : rfVal,
      regimenFiscalOtro: rfEsOtro,
      regimenFiscalCustom: rfEsOtro ? rfVal : '',
      usoCfdi: ucEsOtro ? 'otro' : ucVal,
      usoCfdiOtro: ucEsOtro,
      usoCfdiCustom: ucEsOtro ? ucVal : '',
    };
  }

  onRegimenFiscalChange(): void {
    this.form.regimenFiscalOtro = this.form.regimenFiscal === 'otro';
    if (!this.form.regimenFiscalOtro) this.form.regimenFiscalCustom = '';
  }

  onUsoCfdiChange(): void {
    this.form.usoCfdiOtro = this.form.usoCfdi === 'otro';
    if (!this.form.usoCfdiOtro) this.form.usoCfdiCustom = '';
  }

  async guardarPerfil() {
    if (!this.form.nombre.trim()) {
      this.error.set('El nombre es obligatorio');
      return;
    }

    if (this.form.email && !this.form.email.includes('@')) {
      this.error.set('Ingresa un correo electrónico válido');
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

    const regimenFinal = this.form.regimenFiscalOtro ? this.form.regimenFiscalCustom : this.form.regimenFiscal;
    const usoCfdiFinal = this.form.usoCfdiOtro ? this.form.usoCfdiCustom : this.form.usoCfdi;

    try {
      const body: any = {
        nombre: this.form.nombre,
        apellido: this.form.apellido,
        email: this.form.email || undefined,
        telefono: this.form.telefono,
        rfc: this.form.rfc || undefined,
        regimen_fiscal: regimenFinal || undefined,
        uso_cfdi: usoCfdiFinal || undefined,
      };
      if (this.mostrarCambioPassword && this.passwordForm.nueva) {
        body.password = this.passwordForm.nueva;
      }

      const resp = await firstValueFrom(
        this.http.put<{ success: boolean; mensaje: string; email: string }>(
          `${environment.apiUrl}/user/profile`, body
        )
      );

      // Actualizar sesión local con nombre y email actualizados
      const usuario = this.userService.getUsuarioActual();
      if (usuario) {
        this.userService.setUsuario(
          { ...usuario, nombre: this.form.nombre, email: resp.email },
          this.userService.getToken()!
        );
      }

      this.perfil.update(p => p ? {
        ...p,
        nombre: this.form.nombre,
        apellido: this.form.apellido,
        email: resp.email,
        telefono: this.form.telefono,
        rfc: this.form.rfc || null,
        regimen_fiscal: regimenFinal || null,
        uso_cfdi: usoCfdiFinal || null,
      } : p);

      this.exito.set('Perfil actualizado correctamente');
      this.mostrarCambioPassword = false;
      this.passwordForm = { nueva: '', confirmar: '' };
    } catch (err: any) {
      this.error.set(err.error?.mensaje || 'Error al guardar los cambios');
    } finally {
      this.guardando.set(false);
    }
  }
}
