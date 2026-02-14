import type { IApiResponse, RoleInComplaint } from '@core-interfaces/global';

import type { Iuser } from '@core-interfaces/global/user';

export interface IComplaintEvidence {
  complaint_id: number;
  file_name: string;
  file_ref: string;
  id: number;
}

export interface Icomplaint {
  id: number;
  name?: string;
  description: string;
  where_description?: string;
  with_description?: string;
  role_in_complaint: RoleInComplaint;
  evidences: IComplaintEvidence[];
  alone: boolean;
  date_event: Date;
  created_at: Date;
  user_id?: number;
  user?: Iuser;
}

export type IcomplaintResponse = IApiResponse<Icomplaint>;
export type IcomplaintsResponse = IApiResponse<Icomplaint[]>;
