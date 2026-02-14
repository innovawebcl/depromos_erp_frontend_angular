import type { IApiResponse } from '@core-interfaces/global';

export interface Iinstitution {
  id: number;
  name: string;
  address: string;
  deadline_for_closing_a_complaint: number;
  amount_of_negative_annotations: number;
  active: boolean;
  logo_url?: string;
  created_at: Date;
  updated_at: Date;
}

export type IinstitutionsResponse = IApiResponse<Iinstitution[]>;
export type IinstitutionResponse = IApiResponse<Iinstitution>;
