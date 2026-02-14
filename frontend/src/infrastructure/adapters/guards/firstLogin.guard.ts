import { inject } from '@angular/core';
import {
  CanActivateFn,
  Router,
  type GuardResult,
  type MaybeAsync,
} from '@angular/router';
import { UserRole } from '@core-interfaces/global';
import { AuthManager } from '@infra-adapters/services/auth.service';

export const FirstLoginGuard: CanActivateFn = (
  route,
  state
): MaybeAsync<GuardResult> => {
  const authService = inject(AuthManager);
  const router = inject(Router);
  const isFirstLogin = authService.UserSessionData()?.first_login ?? true;
  const isSuperAdmin = authService.UserSessionData()?.role === UserRole.SuperAdministrator;
  if (isSuperAdmin) {
    return true;
  }
  if (!isFirstLogin) {
    return true;
  } else {
    return router.createUrlTree(['/reset-password']);
  }
};
