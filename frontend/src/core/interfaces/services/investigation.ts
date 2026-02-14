import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { NumberOrNull, StringOrNull, ErrorMessage } from '@core-interfaces/global';
import { IinvestigationResponse, IinvestigationsResponse } from '@core-ports/outputs/investigation'; 
import { Observable } from 'rxjs';
import { IinvestigationInput, InvestigationArgs } from '@core-ports/inputs/investigation';
import { IinvolvedCommentResponse, IinvolvedEvidenceResponse } from '@core-ports/outputs/involved';

export interface IInvestigationComplaintForm {
    complaint_id: FormControl<NumberOrNull>;
}


export interface IInvestigationInvolvedForm {
    involved_id: FormControl<NumberOrNull>;
    involved_type: FormControl<StringOrNull>;
    role: FormControl<StringOrNull>;
}

export interface IInvestigationFormInput extends Omit<IinvestigationInput, InvestigationArgs> { 
    title: FormControl<StringOrNull>;
    description: FormControl<StringOrNull>;
    complaints: FormArray<FormGroup<IInvestigationComplaintForm>>;
    involveds: FormArray<FormGroup<IInvestigationInvolvedForm>>;
}


export interface IinvestigationService {
    readonly errorMessages: ErrorMessage;

    loadInvestigations(): Promise<Observable<IinvestigationsResponse>>;

    loadInvestigationByID(id: number): Promise<Observable<IinvestigationResponse>>; 

    storeInvestigation(investigation: IinvestigationInput): Promise<Observable<IinvestigationResponse>>;

    storeInvestigationInvolvedEvidence(
        investigation_involved_id: number,
        evidence: File
    ): Promise<Observable<IinvolvedEvidenceResponse>>;

    storeInvestigationInvolvedComment(
        involved_id: number,
        comment: string
    ): Promise<Observable<IinvolvedCommentResponse>>;

    updateInvestigationResolution(
        investigation_id: number,
        resolution: string
    ): Promise<Observable<IinvestigationResponse>>;

    finalizeInvestigation(
        investigation_id: number,
    ): Promise<Observable<IinvestigationResponse>>;

    downloadEvidence(
        involved_evidence_id: number,
    ): Promise<Observable<Blob>>;
}

