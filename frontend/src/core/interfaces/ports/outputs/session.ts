import type { AdministratorRole, UserRole } from '@core-interfaces/global';

export interface ISessionResponse {
  readonly data: { token: string };
}

export interface IActiveUserSession {
  readonly id: number;
  name: string;
  username: string;
  role: UserRole;
  admin_role: AdministratorRole | string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  institution_id?: string | null;
  course_id?: string | null;
  first_login: boolean;
  iat: number;
  exp: number;
}
