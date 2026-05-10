import { AfterViewInit, Component, ElementRef, ViewChild, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { CarritoService } from '../../services/carrito/carrito/carrito';
import { PaypalService } from '../../services/paypal/paypal';
import { HistorialComprasService } from '../../services/historial-compras/historial-compras';
import { environment } from '../../../environments/environment';

declare const paypal: any;

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CurrencyPipe, RouterLink],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css',
})
export class Checkout implements AfterViewInit {
  @ViewChild('paypalButtonContainer')
  paypalButtonContainer!: ElementRef<HTMLDivElement>;

  private carritoService = inject(CarritoService);
  private paypalService = inject(PaypalService);
  private historialService = inject(HistorialComprasService);

  carrito = this.carritoService.carrito;
  total = this.carritoService.total;

  mensaje = '';

  ngAfterViewInit(): void {
    this.loadPaypalSdk().then(() => this.renderPaypalButton());
  }

  private loadPaypalSdk(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof paypal !== 'undefined') { resolve(); return; }
      const script = document.createElement('script');
      script.src = `https://www.paypal.com/sdk/js?client-id=${environment.paypalClientId}&currency=MXN`;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('No se pudo cargar el SDK de PayPal'));
      document.head.appendChild(script);
    });
  }

  private renderPaypalButton(): void {
    if (this.carrito().length === 0) return;

    if (typeof paypal === 'undefined') {
      this.mensaje = 'No se cargó el SDK de PayPal.';
      return;
    }

    if (!this.paypalButtonContainer) return;

    this.paypalButtonContainer.nativeElement.innerHTML = '';

    paypal.Buttons({
      style: {
        layout: 'horizontal',
        height: 55,
        color: 'gold',
        shape: 'rect',
        label: 'paypal'
      },

      createOrder: async () => {
        try {
          const response = await firstValueFrom(
            this.paypalService.crearOrden({
              items: this.carrito(),
              total: this.total()
            })
          );
          return response.id;
        } catch (error) {
          console.error('Error al crear la orden:', error);
          this.mensaje = 'No se pudo crear la orden.';
          throw error;
        }
      },

      onApprove: async (data: any) => {
        try {
          const capture = await firstValueFrom(
            this.paypalService.capturarOrden(data.orderID)
          );
          console.log('Pago capturado:', capture);
          this.mensaje = 'Pago realizado correctamente.';
          
          // Guardar la compra en el historial
          const itemsParaHistorial = this.carrito().map(item => ({
            producto_id: item.id,
            nombre_producto: item.nombre,
            categoria: '',
            cantidad: item.cantidad,
            precio_unitario: item.precio,
            importe: item.precio * item.cantidad
          }));

          const subtotal = this.carritoService.subtotal();
          const iva = this.carritoService.impuestos();
          const total = this.carritoService.totalConImpuestos();

          await this.historialService.guardarCompra({
            folio: 'FOL-' + Date.now(),
            paypalOrderId: data.orderID,
            paypalEstado: capture.status || 'COMPLETED',
            subtotal: subtotal,
            iva: iva,
            total: total,
            items: itemsParaHistorial
          });

          this.carritoService.vaciar();
          this.paypalButtonContainer.nativeElement.innerHTML = '';
        } catch (error) {
          console.error('Error al capturar el pago:', error);
          this.mensaje = 'Ocurrió un error al capturar el pago.';
        }
      },

      onCancel: () => {
        this.mensaje = 'El usuario canceló el pago.';
      },

      onError: (error: any) => {
        console.error('Error PayPal:', error);
        this.mensaje = 'Error en el proceso de PayPal.';
      }
    }).render(this.paypalButtonContainer.nativeElement);
  }
}

