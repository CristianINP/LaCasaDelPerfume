import { Component, OnInit, OnDestroy, AfterViewInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HistorialComprasService } from '../../../services/historial-compras/historial-compras';
import { PurchaseOrder } from '../../../models/orden/orden';
import { Navbar } from '../../navbar/navbar';
import { Footer } from '../../footer/footer';

@Component({
  selector: 'app-historial-compras',
  standalone: true,
  imports: [RouterLink, Navbar, Footer],
  templateUrl: './historial-compras.html',
  styleUrl: './historial-compras.css',
})
export class HistorialCompras implements OnInit, AfterViewInit, OnDestroy {
  private servicio = inject(HistorialComprasService);
  
  compras = this.servicio.compras;
  loading = this.servicio.loading;
  error = this.servicio.error;

  ngOnInit(): void {
    this.cargarCompras();
  }

  ngAfterViewInit(): void {
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      setTimeout(() => this.initStarfield(), 100);
    }
  }

  ngOnDestroy(): void {}

  private initStarfield() {
    const existingStars = document.querySelectorAll('.star');
    if (existingStars.length > 0) return;

    const sf = document.getElementById('starfield');
    if (!sf) return;

    const STAR_COUNT = 280;
    const rand = (min: number, max: number) => Math.random() * (max - min) + min;

    for (let i = 0; i < STAR_COUNT; i++) {
      const s = document.createElement('div');
      s.className = 'star';
      const size = rand(0.5, 2.5);
      s.style.cssText = `
        left: ${rand(0, 100)}%;
        top: ${rand(0, 100)}%;
        width: ${size}px;
        height: ${size}px;
        opacity: ${rand(0.3, 0.9)};
        --base-op: ${rand(0.3, 0.9)};
      `;
      if (Math.random() < 0.4) {
        const dur = rand(2, 6);
        const delay = rand(0, 5);
        s.classList.add(Math.random() < 0.5 ? 'twinkle' : 'twinkle-fast');
        s.style.setProperty('--dur', dur + 's');
        s.style.setProperty('--delay', delay + 's');
      }
      sf.appendChild(s);
    }

    for (let i = 0; i < 18; i++) {
      const s = document.createElement('div');
      s.className = 'star twinkle';
      const size = rand(2, 4);
      const color = Math.random() < 0.3 ? '#b0c8ff' : '#fff0cc';
      s.style.cssText = `
        left: ${rand(0, 100)}%;
        top: ${rand(0, 100)}%;
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        box-shadow: 0 0 ${size * 3}px ${color};
        --base-op: 0.7;
        --dur: ${rand(3, 7)}s;
        --delay: ${rand(0, 4)}s;
      `;
      sf.appendChild(s);
    }

    const launchShootingStar = () => {
      const ss = document.createElement('div');
      ss.className = 'shooting-star';
      const angle = rand(-20, -5);
      const length = rand(120, 280);
      const top = rand(5, 55);
      const left = rand(-10, 60);
      const dist = rand(250, 500);
      const dur = rand(1.8, 3.2);
      const delay = rand(0, 0.5);
      ss.style.cssText = `
        top: ${top}%;
        left: ${left}%;
        width: ${length}px;
        transform: rotate(${angle}deg);
        --dist: ${dist}px;
        --sdur: ${dur}s;
        animation-delay: ${delay}s;
      `;
      sf.appendChild(ss);
      setTimeout(() => ss.remove(), (dur + delay + 1) * 1000);
    };

    const scheduleShootingStar = () => {
      launchShootingStar();
      setTimeout(scheduleShootingStar, rand(3500, 9000));
    };

    setTimeout(scheduleShootingStar, 2000);
    setTimeout(scheduleShootingStar, 5500);
  }

  cargarCompras(): void {
    // Cargar desde la base de datos
    this.servicio.cargarComprasSimuladas();
  }

  formatearMoneda(valor: number): string {
    if (typeof valor !== 'number' || isNaN(valor)) {
      return '$0.00';
    }
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 2
    }).format(valor);
  }

  formatearFecha(fechaISO: string): string {
    if (!fechaISO) {
      return 'Fecha no disponible';
    }
    try {
      const fecha = new Date(fechaISO);
      if (isNaN(fecha.getTime())) {
        return fechaISO;
      }
      return fecha.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return fechaISO;
    }
  }

  obtenerEstadoClase(estado: string): string {
    const estadoUpper = estado?.toUpperCase() || '';
    if (estadoUpper === 'COMPLETED' || estadoUpper === 'COMPLETADO') {
      return 'estado-completado';
    } else if (estadoUpper === 'PENDING' || estadoUpper === 'PENDIENTE') {
      return 'estado-pendiente';
    } else if (estadoUpper === 'FAILED' || estadoUpper === 'FALLIDO') {
      return 'estado-fallido';
    }
    return 'estado-desconocido';
  }

  obtenerEstadoTexto(estado: string): string {
    const estadoUpper = estado?.toUpperCase() || '';
    if (estadoUpper === 'COMPLETED' || estadoUpper === 'COMPLETADO') {
      return 'Completado';
    } else if (estadoUpper === 'PENDING' || estadoUpper === 'PENDIENTE') {
      return 'Pendiente';
    } else if (estadoUpper === 'FAILED' || estadoUpper === 'FALLIDO') {
      return 'Fallido';
    }
    return estado || 'Desconocido';
  }
}
