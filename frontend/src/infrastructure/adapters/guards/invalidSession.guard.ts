import { inject } from '@angular/core';
import {
  CanActivateFn,
  Router,
  type GuardResult,
  type MaybeAsync,
} from '@angular/router';
import { AuthManager } from '@infra-adapters/services/auth.service';

export const InvalidSessionGuard: CanActivateFn = (
  route,
  state
): MaybeAsync<GuardResult> => {
  const authService = inject(AuthManager);
  const router = inject(Router);
  if (!authService.isAuth()) {
    return true;
  } else {
    return router.createUrlTree(['/dashboard']);
  }
};
