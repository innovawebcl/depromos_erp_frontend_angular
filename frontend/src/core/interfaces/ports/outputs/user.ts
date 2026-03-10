import type { IApiResponse } from '@core-interfaces/global';

export interface ILoginLog {
  id: number;
  action_log: string;
  description: string;
  user_id: number;
  created_at: string;
}
