import type { Kinship } from '@core-interfaces/global';

export interface Iguardian {
  email: string;
  phone: string;
  name: string;
  last_name: string;
  kinship: Kinship;
}

export type GuardianArgs = 'email' | 'phone' | 'name' | 'last_name' | 'kinship';
