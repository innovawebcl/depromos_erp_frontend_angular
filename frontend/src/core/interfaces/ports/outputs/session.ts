import type { UserRole } from '@core-interfaces/global';

export interface ISessionResponse {
  readonly data: { token: string };
}

export interface IActiveUserSession {
  readonly id: number;
  name: string;
  username: string;
  role: UserRole;
  email: string;
  first_name: string | null;
  last_name: string | null;
  first_login: boolean;
  modules?: Record<string, boolean>;
  iat: number;
  exp: number;
}
