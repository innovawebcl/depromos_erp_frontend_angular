import { IApiResponse } from '@core-interfaces/global';
import { Iuser } from '@core-interfaces/global/user';

export interface Iinterview {
  id: number;
  student_id: number;
  interview_date: Date;
  reason: string;
  records: string;
  comments: string;
  agreements: string;
  created_at: Date;
  user?: Iuser;
}

export type IinterviewResponse = IApiResponse<Iinterview>;

export type IinterviewsResponse = IApiResponse<Iinterview[]>;
