import type { Iuser } from '@core-interfaces/global/user';
import type { IuserDetail } from '@core-interfaces/global/user_detail';
import type { Iadministrator } from './administrator';
import type {
  AnnotationLevel,
  IApiResponse,
  UserRole,
} from '@core-interfaces/global';
import { Iteacher } from '@core-ports/outputs/teacher';
import { Istudent } from '@core-ports/outputs/student';

export interface IUserAdministrator extends Iuser {
  id: number;
  user_details?: IuserDetail;
  administrator?: Iadministrator;
  username : string;
  loginLogs?: ILoginLog[];
}

export interface IuserDashboard {
  sociogram: {
    sociogram_id: number;
    sociogram_title: string;
    courses: {
      course_id: number;
      course_name: string;
      total_students: number;
      students_responded: number;
      percentage_responded: number;
    }[];
  }[];
  students: {
    course_id: number;
    course_name: string;
    total_students: number;
  }[];
  complaints: number;
  investigation: number;
}

export interface IsuperAdminDashboard {
  complaints: number;
  investigation: number;
  users: Record<UserRole, number>;
  //annotations: Record<AnnotationLevel, number>;
  //interviews: number;
  positive_reinforcement: number;
}

export interface IUserProfile extends Iuser {
  id: number;
  detail?: IuserDetail;
  administrator?: Iadministrator;
  teacher?: Iteacher;
  student?: Istudent;
}

export interface ILoginLog {
  id: number;
  action_log: string;
  description: string;
  user_id: number;
  created_at: string;
}

export type IAdministratorsResponse = IApiResponse<IUserAdministrator[]>;
export type IAdministratorResponse = IApiResponse<IUserAdministrator>;
export type IuserDashboardResponse = IApiResponse<IuserDashboard>;
export type IuserProfileResponse = IApiResponse<IUserProfile>;
export type IsuperAdminDashboardResponse = IApiResponse<IsuperAdminDashboard>;
