import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserService } from '../services/user/user';

export const userOnlyGuard: CanActivateFn = () => {
  const userService = inject(UserService);
  const router = inject(Router);

  const user = userService.getUsuarioActual();
  if (!user) return router.createUrlTree(['/login']);
  if (userService.isAdmin()) return router.createUrlTree(['/admin/inventario']);
  return true;
};
