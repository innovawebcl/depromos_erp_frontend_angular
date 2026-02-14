import { UserRole, RoleInComplaintFull, IApiResponse } from "@core-interfaces/global";
import { Istudent } from "@core-ports/outputs/student";
import { Iteacher } from "@core-ports/outputs/teacher";

export interface Iinvolved {
    id: number;
    involved_type: UserRole;
    role: RoleInComplaintFull;
    evidences: Array<IinvolvedEvidence>;
    comments: Array<IinvolvedComment>;
    involved: Istudent | Iteacher;
}

export interface IinvolvedEvidence {
    id: number;
    investigation_involved_id: number;
    filename: string;
    file_ref: string;
    created_at: string;
    updated_at: string;
}

export interface IinvolvedComment {
    id: number;
    comment: string;
    investigation_involved_id: number;
    created_at: string;
    updated_at: string;
}


export type IinvolvedEvidenceResponse = IApiResponse<IinvolvedEvidence>;
export type IinvolvedCommentResponse = IApiResponse<IinvolvedComment>;