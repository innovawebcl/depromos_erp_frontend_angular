import type { IActiveUserSession } from '@core-ports/outputs/session';

export interface IAuthService {
  /**
   * Verifica si la sesión se encuentra activa (alias de isLoggedIn)
   */
  isAuth(): boolean;
  /**
   * Verifica si el usuario tiene sesión activa y token no expirado
   */
  isLoggedIn(): boolean;
  /**
   * Obtiene los datos del usuario que se encuentra con sesión activa
   */
  UserSessionData(): IActiveUserSession | null;
  /**
   * Obtiene los módulos habilitados del usuario autenticado
   */
  getModules(): Record<string, boolean>;
  /**
   * Registra token JWT para control de sesión
   */
  setSession(token: string): void;
  /**
   * Remueve token JWT que mantiene sesión activa
   */
  cleanSession(): void;
}
