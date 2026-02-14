import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { AuthManager } from '@infra-adapters/services/auth.service';

/**
 * Guard por módulo (prender/apagar desde Roles).
 *
 * Se usa con data: { module: 'orders' }.
 *
 * - Si el JWT no trae 'modules', se permite (compatibilidad con app previa).
 * - Si trae 'modules' y el módulo está apagado, redirige a /dashboard.
 */
@Injectable({ providedIn: 'root' })
export class ModuleGuard implements CanActivate {
  constructor(private auth: AuthManager, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const moduleKey = route.data?.['module'] as string | undefined;
    if (!moduleKey) {
      return true;
    }

    const user = this.auth.UserSessionData();
    // Si no hay sesión, AuthGuard debería bloquear; aquí solo por seguridad.
    if (!user) {
      this.router.navigate(['/login']);
      return false;
    }

    // Compatibilidad: si el token no trae módulos, no bloqueamos.
    const modules = (user as any).modules as Record<string, boolean> | undefined;
    if (!modules) {
      return true;
    }

    const allowed = !!modules[moduleKey];
    if (!allowed) {
      this.router.navigate(['/dashboard']);
      return false;
    }
    return true;
  }
}
