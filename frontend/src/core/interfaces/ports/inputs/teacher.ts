import type { IcourseTeachers } from '@core-ports/outputs/course';
type course = IcourseTeachers;
export interface IteacherInput {
  username: string;
  password: string;
  first_name: string;
  last_name: string;
  email: string;
  rut: string;
  birth_date: Date;
  subject_specialty: string;
  courses: Array<Omit<course, 'id' | 'start_date' | 'end_date'>>;
}

export type TeacherArgs =
  | 'username'
  | 'password'
  | 'first_name'
  | 'last_name'
  | 'email'
  | 'rut'
  | 'birth_date'
  | 'subject_specialty'
  | 'role'
  | 'course_id'
  | 'is_substitute'
  | 'courses';
