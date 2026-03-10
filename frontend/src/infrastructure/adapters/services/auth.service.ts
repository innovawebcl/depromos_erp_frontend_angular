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
    const sessionToken = sessionStorage.getItem(StorageKeys.session_token);
    return sessionToken && sessionToken.length > 0 ? true : false;
  }

  UserSessionData(): IActiveUserSession | null {
    const sessionToken = sessionStorage.getItem(StorageKeys.session_token);
    if (!sessionToken) {
      return null;
    }
    return jwtDecode<IActiveUserSession>(sessionToken);
  }

  setSession(token: string): void {
    sessionStorage.setItem(StorageKeys.session_token, token);
  }

  cleanSession(): void {
    sessionStorage.removeItem(StorageKeys.session_token);
  }
}
