import type { IApiResponse } from '@core-interfaces/global';
import type { Istudent } from './student';

export interface IpositiveReinforcement {
  id: number;
  message: string;
  rating: number;
  created_at: string;
  senders?: Istudent;
  receivers?: Istudent;
}

export type IpositiveReinforcementsResponse = IApiResponse<
  IpositiveReinforcement[]
>;
