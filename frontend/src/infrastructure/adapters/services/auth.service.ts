import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';
import { StorageKeys } from '@core-interfaces/global';
import type { IAuthService } from '@core-services/auth';
import type { IActiveUserSession } from '@core-ports/outputs/session';

@Injectable({
  providedIn: 'root',
})
export class AuthManager implements IAuthService {
  constructor() {}

  isAuth(): boolean {
    return this.isLoggedIn();
  }

  isLoggedIn(): boolean {
    const session = this.UserSessionData();
    if (!session) return false;
    // Verificar expiración del token
    if (session.exp && session.exp * 1000 < Date.now()) {
      this.cleanSession();
      return false;
    }
    return true;
  }

  UserSessionData(): IActiveUserSession | null {
    const sessionToken = sessionStorage.getItem(StorageKeys.session_token);
    if (!sessionToken) {
      return null;
    }
    try {
      return jwtDecode<IActiveUserSession>(sessionToken);
    } catch {
      this.cleanSession();
      return null;
    }
  }

  getModules(): Record<string, boolean> {
    const session = this.UserSessionData();
    return session?.modules ?? {};
  }

  setSession(token: string): void {
    sessionStorage.setItem(StorageKeys.session_token, token);
  }

  cleanSession(): void {
    sessionStorage.removeItem(StorageKeys.session_token);
  }
}
