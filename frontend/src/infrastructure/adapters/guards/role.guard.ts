import { inject } from '@angular/core';
import {
  CanActivateFn,
  Router,
  type GuardResult,
  type MaybeAsync,
} from '@angular/router';
import { AuthManager } from '@infra-adapters/services/auth.service';

export const RoleGuard: CanActivateFn = (
  route,
  state
): MaybeAsync<GuardResult> => {
  const authService = inject(AuthManager);
  const router = inject(Router);

  const allowedRoles = route.data['roles'] as string[];

  const userRole = authService.UserSessionData()!.role;
  const adminRole = authService.UserSessionData()?.admin_role;

  if (adminRole && allowedRoles.includes(adminRole)) {
    return true;
  }
  if (allowedRoles.includes(userRole)) {
    return true;
  }
  return router.createUrlTree(['/dashboard']);
};
