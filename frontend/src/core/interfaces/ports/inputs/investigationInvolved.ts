import type { RoleInComplaintFull } from '@core-interfaces/global';


export interface IinvestigationInvolved {
    involved_id: number;
    involved_type: string;
    role: RoleInComplaintFull;
}