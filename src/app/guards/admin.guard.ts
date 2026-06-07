import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserService } from '../services/user/user';

export const adminGuard: CanActivateFn = () => {
  const userService = inject(UserService);
  const router = inject(Router);

  if (userService.isAdmin()) {
    return true;
  }
  return router.createUrlTree(['/catalogo'], { queryParams: { acceso: 'denegado' } });
};
