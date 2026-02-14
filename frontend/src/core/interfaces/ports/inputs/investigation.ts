import { IinvestigationInvolved } from "./investigationInvolved";

export interface IcomplaintsInInvestigation {
    complaint_id: number;
}

export interface IinvestigationInput {
    title: string;
    description: string;
    complaints: Array<IcomplaintsInInvestigation>;
    involveds: Array<IinvestigationInvolved>;
}



export type InvestigationArgs =
    | 'title'
    | 'description'
    | 'complaints'
    | 'involveds';