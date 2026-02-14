import type { IApiResponse, UserRole } from '@core-interfaces/global';
import type { Iuser } from '@core-interfaces/global/user';
import type { IuserDetail } from '@core-interfaces/global/user_detail';
import type { ILoginLog } from './user';
import type { Icourse, IcourseTeachers } from '@core-ports/outputs/course';

export interface ImappingCourseTeachers extends IcourseTeachers {
  course: Icourse;
}

export interface Iteacher {
  id: number;
  user: Iuser;
  name?: string;
  role?: UserRole;
  user_detail: IuserDetail;
  subject_specialty: string;
  courses?: Array<ImappingCourseTeachers>;
}

// TODO pendiente de eliminación
export interface IteacherN {
  id: number;
  user: Iuser;
  name?: string;
  role?: UserRole;
  subject_specialty: string;
  courses?: Array<Icourse>;
  loginLogs?: ILoginLog[];
}

export type IteachersResponse = IApiResponse<IteacherN[]>;
export type IteacherResponse = IApiResponse<IteacherN>;
