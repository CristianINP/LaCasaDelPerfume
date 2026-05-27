import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { CarritoComponent } from './components/carrito/carrito/carrito';
import { Contactos } from './components/contactos/contactos';
import { Privacidad } from './components/privacidad/privacidad';
import { Checkout } from './components/checkout/checkout';
import { HistorialCompras } from './components/historial-compras/historial-compras/historial-compras';
import { DetalleCompra } from './components/detalle-compra/detalle-compra/detalle-compra';
import { LoginComponent } from './components/login/login';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: '', component: Home, canActivate: [authGuard] },
  { path: 'catalogo', component: Home, canActivate: [authGuard] },
  { path: 'carrito', component: CarritoComponent, canActivate: [authGuard] },
  { path: 'checkout', component: Checkout, canActivate: [authGuard] },
  { path: 'contactos', component: Contactos, canActivate: [authGuard] },
  { path: 'privacidad', component: Privacidad, canActivate: [authGuard] },
  { path: 'historial', component: HistorialCompras, canActivate: [authGuard] },
  { path: 'historial/:id', component: DetalleCompra, canActivate: [authGuard] },
  { path: '**', redirectTo: 'login' },
];
