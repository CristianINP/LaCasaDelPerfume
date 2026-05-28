import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { PurchaseOrder } from '../../models/orden/orden';

@Injectable({ providedIn: 'root' })
export class HistorialComprasService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/pedidos`;

  private comprasSignal = signal<PurchaseOrder[]>([]);
  compras = this.comprasSignal.asReadonly();
  loading = signal(false);
  error = signal<string | null>(null);

  async obtenerCompras(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const response = await this.http
        .get<{ success: boolean; data: any[] }>(`${this.apiUrl}/historial`)
        .toPromise();

      if (response?.success && response.data) {
        const compras: PurchaseOrder[] = response.data.map((p: any) => ({
          id: p.id,
          folio: p.folio ?? `ORD-${p.id}`,
          fecha: p.fecha ?? new Date().toISOString(),
          paypal_orden_id: p.paypal_orden_id ?? '',
          paypal_estado: p.paypal_estado ?? 'COMPLETED',
          subtotal: Number(p.subtotal) || 0,
          iva: Number(p.iva) || 0,
          total: Number(p.total) || 0,
          items: Array.isArray(p.items) ? p.items : [],
        }));
        this.comprasSignal.set(compras);
      }
    } catch {
      this.error.set('No se pudo cargar el historial de compras.');
    } finally {
      this.loading.set(false);
    }
  }

  async obtenerCompraPorId(id: number): Promise<PurchaseOrder | null> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const response = await this.http
        .get<{ success: boolean; data: any }>(`${this.apiUrl}/${id}`)
        .toPromise();

      if (response?.success && response.data) {
        const p = response.data;
        return {
          id: p.id,
          folio: p.folio,
          fecha: p.fecha,
          paypal_orden_id: p.paypal_orden_id,
          paypal_estado: p.paypal_estado,
          subtotal: Number(p.subtotal),
          iva: Number(p.iva),
          total: Number(p.total),
          items: p.items ?? [],
        };
      }
      return null;
    } catch {
      this.error.set('No se pudo cargar el pedido.');
      return null;
    } finally {
      this.loading.set(false);
    }
  }

  limpiarCompras(): void {
    this.comprasSignal.set([]);
  }
}
