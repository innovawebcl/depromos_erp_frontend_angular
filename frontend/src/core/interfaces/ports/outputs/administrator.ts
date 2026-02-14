import type { AdministratorRole } from '@core-interfaces/global';
import type { Iinstitution } from './institution';
import type { IUserAdministrator } from './user';

export interface Iadministrator {
  id: number;
  admin_role: AdministratorRole;
  institution: Iinstitution;
  institution_id: number;
  user: IUserAdministrator;

}
