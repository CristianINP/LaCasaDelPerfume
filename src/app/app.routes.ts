import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { CarritoComponent } from './components/carrito/carrito/carrito';
import { Privacidad } from './components/privacidad/privacidad';
import { Terminos } from './components/terminos/terminos';
import { Checkout } from './components/checkout/checkout';
import { HistorialCompras } from './components/historial-compras/historial-compras/historial-compras';
import { DetalleCompra } from './components/detalle-compra/detalle-compra/detalle-compra';
import { LoginComponent } from './components/login/login';
import { InventarioComponent } from './components/inventario/inventario';
import { PerfilComponent } from './components/perfil/perfil';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password';
import { ResetPasswordComponent } from './components/reset-password/reset-password';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';
import { userOnlyGuard } from './guards/user-only.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: '', component: Home, canActivate: [userOnlyGuard] },
  { path: 'catalogo', component: Home, canActivate: [userOnlyGuard] },
  { path: 'carrito', component: CarritoComponent, canActivate: [userOnlyGuard] },
  { path: 'checkout', component: Checkout, canActivate: [userOnlyGuard] },
  { path: 'privacidad', component: Privacidad, canActivate: [userOnlyGuard] },
  { path: 'terminos', component: Terminos, canActivate: [userOnlyGuard] },
  { path: 'historial', component: HistorialCompras, canActivate: [userOnlyGuard] },
  { path: 'historial/:id', component: DetalleCompra, canActivate: [userOnlyGuard] },
  { path: 'admin/inventario', component: InventarioComponent, canActivate: [adminGuard] },
  { path: 'perfil', component: PerfilComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: 'login' },
];
