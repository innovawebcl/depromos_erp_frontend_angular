import type {
  IApiResponse,
  NumberOrNull,
  StringOrNull,
  UserRole,
} from '@core-interfaces/global';
import type { Iuser } from '@core-interfaces/global/user';
import type { IuserDetail } from '@core-interfaces/global/user_detail';

import type { Icourse } from '@core-ports/outputs/course';
import type { Iguardian } from '@core-ports/inputs/guardian';
import type { Iannotation } from '@core-ports/outputs/annotation';
import { Iinstitution } from './institution';
import { IstudentAnswer } from './studentAnswer';
import { IstudentAnswerClassmate } from './studentAnswerClassmate';
import { Iinterview } from '@core-ports/outputs/interview';
import { ILoginLog } from './user';

// TODO queda acá mientras apoderados no tengan mantenedor
export interface IguardianStudent extends Iguardian {
  id: number;
}
// TODO refactor interfaz
export interface IsociogramByCourse {
  id: number;
  name: string;
  level: number;
  created_at: string;
  updated_at: string;
  institution_id: number;
  pivot: {
    student_id: number;
    course_id: number;
    active: number;
    created_at: string;
    updated_at: string;
  };
  sociograms: Array<{
    id: number;
    active: number;
    title: string;
    version: number;
    created_at: string;
    updated_at: string;
    institution_id: number;
    pivot: {
      course_id: number;
      sociogram_id: number;
      created_at: string;
      updated_at: string;
    };
    questions: Array<{
      id: number;
      title: string;
      is_multiple_choice: number;
      rules: string;
      enum_as_options: string;
      created_at: string;
      updated_at: string;
      laravel_through_key: number;
    }>;
  }>;
}

export interface Istudent {
  id: number;
  user: Iuser;
  years_in_school: number;
  people_living_with: Array<string>;
  number_of_siblings: number;
  medical_diagnosis: StringOrNull;
  repeated_courses: Array<string>;
  address: string;
  guardians?: Array<IguardianStudent>;
  courses?: Array<Icourse>;
  annotations?: Array<Iannotation>;
  student_responses?: Array<IstudentAnswer>;
  student_classmate_responses?: Array<IstudentAnswerClassmate>;
  interviews?: Array<Iinterview>;
  active_course?: Icourse;
  loginLogs?: ILoginLog[];
}

export interface IstudentDashboard {
  annotations: {
    type: string;
    total: number;
  }[];
  positive_reinforcement: number;
}

export type IstudentsResponse = IApiResponse<Istudent[]>;
export type IstudentDashboardResponse = IApiResponse<IstudentDashboard>;
export type IstudentFinishSociogramResponse = IApiResponse<{
  is_finished: boolean;
}>;
export type IstudentResponse = IApiResponse<Istudent>;
export type IsociogramsByCourseForStudent = IApiResponse<IsociogramByCourse[]>;
