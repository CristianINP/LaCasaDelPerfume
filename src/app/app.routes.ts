import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { CarritoComponent } from './components/carrito/carrito/carrito';
import { Contactos } from './components/contactos/contactos';
import { Privacidad } from './components/privacidad/privacidad';
import { Checkout } from './components/checkout/checkout';
import { HistorialCompras } from './components/historial-compras/historial-compras/historial-compras';
import { DetalleCompra } from './components/detalle-compra/detalle-compra/detalle-compra';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'catalogo', component: Home },
  { path: 'carrito', component: CarritoComponent },
  { path: 'checkout', component: Checkout },
  { path: 'contactos', component: Contactos },
  { path: 'privacidad', component: Privacidad },
  { path: 'historial', component: HistorialCompras },
  { path: 'historial/:id', component: DetalleCompra },
  { path: '**', redirectTo: '' },
];
