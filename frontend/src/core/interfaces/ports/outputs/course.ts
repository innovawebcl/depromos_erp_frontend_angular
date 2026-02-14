import type { IApiResponse, TeacherRole } from '@core-interfaces/global';
import type { Isociogram } from './sociograms';

export interface Icourse {
  id: number;
  name: string;
  // level: number;
  active: boolean;
  institution?: string;
  annotations_count?: number;
  sociogram?: Isociogram | Isociogram[];
  detail?: IcourseTeachers;
}

export interface IcourseTeachers {
  id: number;
  role: TeacherRole;
  course_id: number;
  is_substitute: boolean;
  start_date: Date;
  end_date: Date;
}

export type IcoursesResponse = IApiResponse<Icourse[]>;
export type IcourseResponse = IApiResponse<Icourse>;
