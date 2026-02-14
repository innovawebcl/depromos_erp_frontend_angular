import type { IActiveUserSession } from '@core-ports/outputs/session';

export interface IAuthService {
  /**
   * * Verifica si la sesión se encuentra activa
   */
  isAuth(): boolean;
  /**
   * * Obtiene los datos del usuario que se encuentra con sesión activa
   */
  UserSessionData(): IActiveUserSession | null;
  /**
   * * Registra token JWT para control de sesión
   * @param token
   */
  setSession(token: string): void;
  /**
   * * Remueve token JWT que mantiene sesión activa
   */
  cleanSession(): void;
  /**
   * * Registra token id de institución en caso de ser super administrador
   * @param id
   */
  setInstitution(id: number): void;
  /**
   * * Remueve token JWT que mantiene sesión activa
   */
  cleanInstitution(): void;
}
