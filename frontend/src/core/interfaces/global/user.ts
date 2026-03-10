import type { UserRole } from '@core-interfaces/global';

export interface Iuser {
  username: string;
  role: UserRole;
  loginLogs?: ILoginLog[];
}

export interface ILoginLog {
  id: number;
  action_log: string;
  description: string;
  user_id: number;
  created_at: string;
}