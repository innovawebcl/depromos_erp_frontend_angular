import type {
  UserRole,
  DateOrNull,
} from '@core-interfaces/global';

export interface IuserInput {
  username: string;
  password: string;
  first_name: string;
  last_name: string;
  email: string;
  rut: string;
  birth_date: DateOrNull;
  role: UserRole;
}

export type UserArgs =
  | 'username'
  | 'password'
  | 'first_name'
  | 'last_name'
  | 'email'
  | 'rut'
  | 'birth_date'
  | 'role';
