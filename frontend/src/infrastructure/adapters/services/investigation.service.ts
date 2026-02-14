import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { map, Observable } from 'rxjs';
import { environment } from '@infra-env/environment';
import { type FormGroup, FormBuilder, Validators } from '@angular/forms';

import type { ErrorMessage, StringOrNull } from '@core-interfaces/global';

import type {
  IinvestigationResponse,
  IinvestigationsResponse,
} from '@core-ports/outputs/investigation';
import type { IinvestigationInput } from '@core-ports/inputs/investigation';
import {
  IinvestigationService,
  IInvestigationFormInput,
  IInvestigationComplaintForm,
  IInvestigationInvolvedForm,
} from '@core-services/investigation';
import {
  IinvolvedCommentResponse,
  IinvolvedEvidenceResponse,
} from '@core-ports/outputs/involved';

@Injectable({
  providedIn: 'root',
})
export class InvestigationManager implements IinvestigationService {
  private readonly INVESTIGATION_API_URL = `${environment.apiUrl}/investigation`;

  readonly errorMessages: ErrorMessage = {
    description: {
      required: 'La descripción es requerida',
      serverError: '',
    },
  };

  investigationForm: FormGroup<IInvestigationFormInput>;

  constructor(private http: HttpClient, private fb: FormBuilder) {
    this.investigationForm = this.fb.group<IInvestigationFormInput>({
      title: this.fb.control<StringOrNull>(null, {
        validators: [],
      }),
      description: this.fb.control<StringOrNull>(null, {
        validators: [Validators.required],
      }),
      complaints: this.fb.array<FormGroup<IInvestigationComplaintForm>>([]),
      involveds: this.fb.array<FormGroup<IInvestigationInvolvedForm>>([]),
    });
  }

  async loadInvestigations(): Promise<Observable<IinvestigationsResponse>> {
    return this.http
      .get<IinvestigationsResponse>(this.INVESTIGATION_API_URL)
      .pipe(
        map((response) => {
          if (response) {
            return response;
          } else {
            throw new Error('No se pudieron cargar las investigaciones');
          }
        })
      );
  }

  async loadInvestigationByID(
    id: number
  ): Promise<Observable<IinvestigationResponse>> {
    return this.http
      .get<IinvestigationResponse>(`${this.INVESTIGATION_API_URL}/${id}`)
      .pipe(
        map((response) => {
          if (response) {
            return response;
          } else {
            throw new Error('No se pudo cargar la investigación');
          }
        })
      );
  }

  async storeInvestigation(
    input: IinvestigationInput
  ): Promise<Observable<IinvestigationResponse>> {
    return this.http
      .post<IinvestigationResponse>(this.INVESTIGATION_API_URL, input)
      .pipe(
        map((response) => {
          if (response) {
            return response;
          } else {
            throw new Error('No se pudo crear la investigación');
          }
        })
      );
  }

  async storeInvestigationInvolvedEvidence(
    investigation_involved_id: number,
    evidence: File
  ): Promise<Observable<IinvolvedEvidenceResponse>> {
    const formData = new FormData();
    formData.append('evidence', evidence);
    return this.http
      .post<IinvolvedEvidenceResponse>(
        `${this.INVESTIGATION_API_URL}/involved/${investigation_involved_id}/evidence`,
        formData
      )
      .pipe(
        map((response) => {
          if (response) {
            return response;
          } else {
            throw new Error('No se pudo subir la evidencia');
          }
        })
      );
  }
  async storeInvestigationEvidence(
    investigation_id: number,
    evidence: File
  ): Promise<Observable<IinvolvedEvidenceResponse>> {
    const formData = new FormData();
    formData.append('evidence', evidence);
    return this.http
      .post<IinvolvedEvidenceResponse>(
        `${this.INVESTIGATION_API_URL}/${investigation_id}/upload/evidence`,
        formData
      )
      .pipe(
        map((response) => {
          if (response) {
            return response;
          } else {
            throw new Error('No se pudo subir la evidencia');
          }
        })
      );
  }

  async storeInvestigationInvolvedComment(
    involved_id: number,
    comment: string
  ): Promise<Observable<IinvolvedCommentResponse>> {
    return this.http
      .post<IinvolvedCommentResponse>(
        `${this.INVESTIGATION_API_URL}/involved/${involved_id}/comments`,
        { comment }
      )
      .pipe(
        map((response) => {
          if (response) {
            return response;
          } else {
            throw new Error('No se pudo agregar el comentario');
          }
        })
      );
  }
  async storeInvestigationComment(
    investigation_id: number,
    comment: string
  ): Promise<Observable<IinvolvedCommentResponse>> {
    return this.http
      .post<IinvolvedCommentResponse>(
        `${this.INVESTIGATION_API_URL}/${investigation_id}/upload/comments`,
        { comment }
      )
      .pipe(
        map((response) => {
          if (response) {
            return response;
          } else {
            throw new Error('No se pudo agregar el comentario');
          }
        })
      );
  }

  async updateInvestigationResolution(
    investigation_id: number,
    resolution: string
  ): Promise<Observable<IinvestigationResponse>> {
    return this.http
      .put<IinvestigationResponse>(
        `${this.INVESTIGATION_API_URL}/${investigation_id}`,
        { resolution }
      )
      .pipe(
        map((response) => {
          if (response) {
            return response;
          } else {
            throw new Error('No se pudo actualizar la resolución');
          }
        })
      );
  }

  async finalizeInvestigation(
    investigation_id: number
  ): Promise<Observable<IinvestigationResponse>> {
    return this.http
      .put<IinvestigationResponse>(
        `${this.INVESTIGATION_API_URL}/${investigation_id}/finalize`,
        {}
      )
      .pipe(
        map((response) => {
          if (response) {
            return response;
          } else {
            throw new Error('No se pudo finalizar la investigación');
          }
        })
      );
  }

  async downloadEvidence(
    involved_evidence_id: number
  ): Promise<Observable<Blob>> {
    return this.http.get(
      `${this.INVESTIGATION_API_URL}/involved/evidence/${involved_evidence_id}`,
      {
        responseType: 'blob',
      }
    );
  }

  async downloadGlobalEvidence(evidence_id: number): Promise<Observable<Blob>> {
    return this.http.get(
      `${this.INVESTIGATION_API_URL}/evidence/${evidence_id}`,
      {
        responseType: 'blob',
      }
    );
  }

  getErrorMessage(controlName: keyof IInvestigationFormInput): string | null {
    const inputControl = this.investigationForm.get(controlName);

    if (inputControl && inputControl.errors) {
      for (const errorKey in inputControl.errors) {
        if (errorKey === 'serverError') {
          return (
            this.errorMessages[controlName]['serverError'] ||
            'Error en el servidor.'
          );
        }
        if (this.errorMessages[controlName]?.[errorKey]) {
          return this.errorMessages[controlName][errorKey];
        }
      }
    }

    return null;
  }
}
