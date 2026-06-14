import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

/** Only SUPER_ADMIN may enter admin routes; everyone else is sent home. */
export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isLoggedIn() && auth.isAdmin()) {
    return true;
  }
  return router.parseUrl(auth.isLoggedIn() ? '/dashboard' : '/login');
};
