import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@infra-env/environment';
import type {
  IcomplaintService,
  IcomplaintFormInput,
} from '@core-interfaces/services/complaint';
import type { IDroppedFile } from '@core-interfaces/global';

import type {
  ErrorMessage,
  StringOrNull,
  DateOrNull,
  BoolOrNull,
} from '@core-interfaces/global';

import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable, map } from 'rxjs';
import { IcomplaintInput } from '@core-ports/inputs/complaint';
import {
  IcomplaintResponse,
  IcomplaintsResponse,
} from '@core-ports/outputs/complaint';

@Injectable({
  providedIn: 'root',
})
export class ComplaintManager implements IcomplaintService {
  private readonly COMPLAINT_API_URL = `${environment.apiUrl}/complaint`;

  readonly errorMessages: ErrorMessage = {
    description: {
      required: 'La descripción de la denuncia es requerida.',
      minlength:
        'La descripción de la denuncia debe tener al menos 10 caracteres.',
      serverError: '',
    },
    where_description: {
      required: 'El lugar de la denuncia es requerido.',
      serverError: '',
    },
    with_description: {
      required: 'Con quién ocurrió la denuncia es requerido.',
      serverError: '',
    },
    alone: {
      required: 'Si estaba solo es requerido.',
      serverError: '',
    },
    date_event: {
      required: 'La fecha de lo ocurrido es requerida.',
      serverError: '',
    },
    role_in_complaint: {
      required: 'El rol en la denuncia es requerido.',
      serverError: '',
    },
  };

  complaintForm: FormGroup<IcomplaintFormInput>;

  constructor(private http: HttpClient) {
    this.complaintForm = new FormGroup<IcomplaintFormInput>({
      description: new FormControl<StringOrNull>(null, {
        validators: [Validators.required, Validators.minLength(10)],
      }),
      where_description: new FormControl<StringOrNull>(null, {
        validators: [Validators.required],
      }),
      alone: new FormControl<BoolOrNull>(null, {
        validators: [Validators.required],
      }),
      with_description: new FormControl<StringOrNull>(null, {
        validators: [],
      }),
      date_event: new FormControl<DateOrNull>(null, {
        validators: [Validators.required],
      }),
      role_in_complaint: new FormControl<StringOrNull>(null, {
        validators: [Validators.required],
      }),
    });
  }

  async getAllComplaints(): Promise<Observable<IcomplaintsResponse>> {
    return this.http.get<IcomplaintsResponse>(this.COMPLAINT_API_URL).pipe(
      map((response) => {
        if (response) {
          return response;
        } else {
          throw new Error('No se pudo obtener listado de denuncias');
        }
      })
    );
  }

  async storeComplaint(
    input: IcomplaintInput,
    files: IDroppedFile[]
  ): Promise<Observable<IcomplaintResponse>> {
    const form = new FormData();
    form.append('description', input.description);
    form.append('where_description', input.where_description);
    form.append('alone', input.alone.toString());
    if (input.with_description) {
      form.append('with_description', input.with_description);
    }
    form.append('date_event', input.date_event.toISOString());
    form.append('role_in_complaint', input.role_in_complaint);

    files.forEach((file) => {
      form.append('evidences[]', file.file);
    });

    return this.http
      .post<IcomplaintResponse>(this.COMPLAINT_API_URL, form)
      .pipe(
        map((response) => {
          if (response) {
            return response;
          } else {
            throw new Error('No se pudo crear la denuncia');
          }
        })
      );
  }

  getErrorMessage(controlName: keyof IcomplaintFormInput): string | null {
    const inputControl = this.complaintForm.get(controlName);
    if (inputControl && inputControl.errors) {
      for (const errorKey in inputControl.errors) {
        if (errorKey === '0') {
          // TODO mejorar validaciones personalizadas por respuestas del servidor
          return this.errorMessages[controlName]['serverError'];
        } else if (errorKey in this.errorMessages[controlName]) {
          return this.errorMessages[controlName][errorKey];
        }
      }
    }
    return null;
  }

  async downloadEvidence(evidence_id: number): Promise<Observable<Blob>> {
    return this.http.get(
      `${this.COMPLAINT_API_URL}/evidence/${evidence_id}/download`,
      {
        responseType: 'blob',
      }
    );
  }
}
