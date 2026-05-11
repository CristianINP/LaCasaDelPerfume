import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { PurchaseOrder, PurchaseItem } from '../../models/orden/orden';

@Injectable({ providedIn: 'root' })
export class HistorialComprasService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/pedidos`;
  
  // Señal reactiva para almacenar el historial
  private comprasSignal = signal<PurchaseOrder[]>([]);
  compras = this.comprasSignal.asReadonly();
  
  // Estado de carga
  loading = signal(false);
  error = signal<string | null>(null);

  /**
   * Obtiene todas las compras del usuario desde la base de datos real
   */
  async obtenerCompras(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    
    try {
      // Obtener pedidos desde MariaDB
      const response = await this.http.get<{ success: boolean; data: any[] }>(
        `${this.apiUrl}/todos`
      ).toPromise();
      
      if (response && response.success && response.data) {
        // Mapear datos de la base de datos al formato de nuestra aplicación
        const compras = response.data.map((compra: any) => ({
          id: compra.id,
          folio: compra.folio || `ORD-${compra.id}`,
          fecha: compra.fecha || new Date().toISOString(),
          paypal_orden_id: compra.paypal_orden_id || 'N/A',
          paypal_estado: compra.paypal_estado || 'COMPLETED',
          subtotal: Number(compra.subtotal) || 0,
          iva: Number(compra.iva) || 0,
          total: Number(compra.total) || 0,
          items: [] as PurchaseItem[]
        }));
        
        // Obtener detalles de cada pedido
        for (let i = 0; i < compras.length; i++) {
          await this.cargarDetallesPedido(compras[i]);
        }
        
        this.comprasSignal.set(compras);
      }
    } catch (err) {
      console.error('Error al obtener el historial de compras:', err);
      this.error.set('No se pudo cargar el historial de compras. Intenta nuevamente.');
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Carga los detalles de un pedido específico desde detalles_pedido
   */
  private async cargarDetallesPedido(compra: PurchaseOrder): Promise<void> {
    try {
      const response = await this.http.get<{ success: boolean; data: any[] }>(
        `${this.apiUrl}/${compra.id}/detalles`
      ).toPromise();
      
      if (response && response.success && response.data) {
        const items: PurchaseItem[] = response.data.map((detalle: any) => ({
          producto_id: detalle.producto_id || 0,
          nombre_producto: detalle.nombre_producto || 'Producto',
          categoria: detalle.categoria || '',
          cantidad: detalle.cantidad || 0,
          precio_unitario: Number(detalle.precio_unitario) || 0,
          importe: Number(detalle.importe) || 0
        }));
        
        // Actualizar items en la compra
        Object.assign(compra, { items });
      }
    } catch (err) {
      console.warn(`No se pudieron cargar detalles para pedido ${compra.id}:`, err);
      compra.items = [];
    }
  }

  /**
   * Obtiene una compra específica por ID
   */
  async obtenerCompraPorId(id: number): Promise<PurchaseOrder | null> {
    this.loading.set(true);
    this.error.set(null);
    try {
      console.log('Buscando compra por ID:', id);
      const response = await this.http.get<{ success: boolean; data: any }>(
        `${this.apiUrl}/${id}`
      ).toPromise();
      
      console.log('Respuesta del servidor:', response);
      
      if (response && response.success && response.data) {
        const compraData = response.data;
        const compra: PurchaseOrder = {
          id: compraData.id,
          folio: compraData.folio,
          fecha: compraData.fecha,
          paypal_orden_id: compraData.paypal_orden_id,
          paypal_estado: compraData.paypal_estado,
          subtotal: Number(compraData.subtotal),
          iva: Number(compraData.iva),
          total: Number(compraData.total),
          items: []
        };
        
        // Cargar detalles
        await this.cargarDetallesPedido(compra);
        
        console.log('Compra devuelta con items:', compra);
        return compra;
      }
      console.log('No se encontró la compra');
      return null;
    } catch (err) {
      console.error('Error al obtener la compra:', err);
      this.error.set('No se pudo cargar la compra.');
      return null;
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Guarda la compra después de un pago exitoso
   */
  async guardarCompra(compra: {
    folio: string;
    paypalOrderId: string;
    paypalEstado: string;
    subtotal: number;
    iva: number;
    total: number;
    items: PurchaseItem[];
  }): Promise<{ success: boolean; pedidoId: number } | null> {
    try {
      const response = await this.http.post<{ success: boolean; pedidoId: number }>(
        `${this.apiUrl}/guardar-compra`,
        compra
      ).toPromise();
      
      if (response && response.success) {
        // Recargar el historial
        await this.obtenerCompras();
      }
      
      return response || null;
    } catch (err) {
      console.error('Error al guardar la compra:', err);
      this.error.set('No se pudo guardar la compra.');
      return null;
    }
  }

  /**
   * Carga inicial de compras desde la base de datos
   */
  async cargarComprasSimuladas(): Promise<void> {
    try {
      // Intentar cargar desde la API real primero
      await this.obtenerCompras();
      
      // Si no hay datos, usar datos simulados
      if (this.compras().length === 0) {
        console.log('No hay compras en BD, usando datos de ejemplo...');
        const comprasSimuladas: PurchaseOrder[] = [
          {
            id: 1,
            folio: 'FOL-2026-001',
            fecha: new Date().toISOString(),
            paypal_orden_id: 'PAYPAL-5O123456789',
            paypal_estado: 'COMPLETED',
            subtotal: 150.00,
            iva: 24.00,
            total: 174.00,
            items: [
              {
                producto_id: 1,
                nombre_producto: 'Perfume Nocturnal Aura',
                categoria: 'Oriental',
                cantidad: 1,
                precio_unitario: 85.00,
                importe: 85.00
              },
              {
                producto_id: 2,
                nombre_producto: 'Perfume Celestial Mist',
                categoria: 'Fresco',
                cantidad: 1,
                precio_unitario: 65.00,
                importe: 65.00
              }
            ]
          }
        ];
        
        this.comprasSignal.set(comprasSimuladas);
      }
      
      this.error.set(null);
    } catch (err) {
      this.error.set('Error al cargar el historial.');
    }
  }

  /**
   * Limpia el historial
   */
  limpiarCompras(): void {
    this.comprasSignal.set([]);
  }
}
