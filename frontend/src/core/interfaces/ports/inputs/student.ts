import type { Iguardian } from '@core-ports/inputs/guardian';

export interface IstudentsInCourse {
  course_id: number;
}
export interface IstudentInput {
  username: string;
  password: string;
  first_name: string;
  second_name?: string;
  last_name: string;
  second_last_name?: string;
  email: string;
  rut: string;
  birth_date: string;
  years_in_school: number;
  medical_diagnosis: string;
  people_living_with: string;
  number_of_siblings: number;
  address: string;
  repeated_courses: string;
  guardians: Array<Iguardian>;
  courses: Array<IstudentsInCourse>;
}

export type StudentArgs =
  | 'username'
  | 'password'
  | 'first_name'
  | 'second_name'
  | 'last_name'
  | 'second_last_name'
  | 'email'
  | 'rut'
  | 'birth_date'
  | 'years_in_school'
  | 'people_living_with'
  | 'number_of_siblings'
  | 'repeated_courses'
  | 'address'
  | 'guardians'
  | 'courses'
  | 'medical_diagnosis';
