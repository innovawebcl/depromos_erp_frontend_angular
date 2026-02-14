import type { UserRole } from '@core-interfaces/global';
import type { IuserDetail } from './user_detail';
import type { Iteacher } from '@core-ports/outputs/teacher';
import type { Iadministrator } from '@core-ports/outputs/administrator';
import type { Istudent } from '@core-ports/outputs/student';
export interface Iuser {
  username: string;
  role: UserRole;
  detail?: IuserDetail;
  teacher?: Iteacher;
  administrator?: Iadministrator;
  student?: Istudent;
  loginLogs?: ILoginLog[];
}

export interface ILoginLog {
  id: number;
  action_log: string;
  description: string;
  user_id: number;
  created_at: string;
}