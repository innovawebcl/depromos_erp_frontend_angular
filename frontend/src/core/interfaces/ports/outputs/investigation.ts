import type { IApiResponse, InvestigationState } from '@core-interfaces/global';
import type { Iadministrator } from './administrator';
import type { Icomplaint } from './complaint';
import type { Iinvolved } from './involved';

export interface IinvestigationEvidence {
  id: number;
  investigation_id: number;
  filename: string;
  file_ref: string;
  created_at: string;
  updated_at: string;
}

export interface IinvestigationComment {
  id: number;
  comment: string;
  investigation_id: number;
  created_at: string;
  updated_at: string;
}

export interface Iinvestigation {
  id: number;
  title: string;
  description: string;
  resolution: string;
  state: InvestigationState;
  other_background?: string;
  created_at: string;
  updated_at: string;
  administrator: Iadministrator;
  complaints: Array<Icomplaint>;
  involveds: Array<Iinvolved>;
  comments: Array<IinvestigationComment>;
  evidences: Array<IinvestigationEvidence>;
}

export type IinvestigationResponse = IApiResponse<Iinvestigation>;
export type IinvestigationsResponse = IApiResponse<Array<Iinvestigation>>;
