import type { AnnotationLevel, IApiResponse } from '@core-interfaces/global';
import type { Iuser } from '@core-interfaces/global/user';

export interface Iannotation {
  id: number;
  type: AnnotationLevel;
  observation: string;
  created_at: Date;
  user_id: number;
  user: Iuser;
  subcategory: string;
}

export type IannotationResponse = IApiResponse<Iannotation>;

export type IannotationsResponse = IApiResponse<Iannotation[]>;
