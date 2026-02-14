import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import type {
  IinstitutionService,
  IInstitutionFormInput,
  IAnnotationLevelFormInput,
} from '@core-services/institution';

import type {
  ErrorMessage,
  NumberOrNull,
  StringOrNull,
} from '@core-interfaces/global';

import type {
  IinstitutionsResponse,
  IinstitutionResponse,
} from '@core-ports/outputs/institution';
import type { IinstitutionInput } from '@core-ports/inputs/institution';

import { map, Observable } from 'rxjs';
import { environment } from '@infra-env/environment';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import optionalValidator from '@infra-adapters/validators/optional.validator';
import { IInstitutionAnnotationLevelInput } from '@core-ports/inputs/annotationLevel';
import {
  IinstitutionAnnotationLevelResponse,
  IinstitutionAnnotationLevelsResponse,
} from '@core-ports/outputs/annotationLevel';

@Injectable({
  providedIn: 'root',
})
export class InstitutionManager implements IinstitutionService {
  private readonly INSTITUTION_API_URL = `${environment.apiUrl}/institution`;

  readonly errorMessages: ErrorMessage = {
    name: {
      required: 'El nombre de institución es requerido.',
      minlength: 'El nombre de institución debe tener al menos 4 caracteres.',
      serverError: '',
    },
    address: {
      required: 'La dirección es requerida.',
      minlength: 'La dirección debe tener al menos 4 caracteres.',
      serverError: '',
    },
    deadline_for_closing_a_complaint: {
      required: 'Limite para cerrar una reclamación es requerido.',
      min: 'Minímo de 5 días para cerrar una reclamación',
      serverError: '',
    },
    amount_of_negative_annotations: {
      required: 'Cantidad de anotaciones negativas es requerido',
      min: 'Minímo de 1 anotación negativa',
      serverError: '',
    },
  };

  readonly annotationLevelErrorMessages: ErrorMessage = {
    annotation_level: {
      required: 'El nivel de anotación es requerido.',
      serverError: '',
    },
    custom_label: {
      required: 'La etiqueta personalizada es requerida.',
      serverError: '',
    },
  };

  institutionForm: FormGroup<IInstitutionFormInput>;
  institutionAnnotationLevelForm: FormGroup<IAnnotationLevelFormInput>;

  constructor(private http: HttpClient) {
    this.institutionForm = new FormGroup<IInstitutionFormInput>({
      name: new FormControl<StringOrNull>(null, {
        validators: [Validators.required, Validators.minLength(4)],
      }),
      address: new FormControl<StringOrNull>(null, {
        validators: [Validators.required, Validators.minLength(4)],
      }),
      amount_of_negative_annotations: new FormControl<NumberOrNull>(null, {
        validators: [optionalValidator(Validators.min(1))],
      }),
      deadline_for_closing_a_complaint: new FormControl<NumberOrNull>(null, {
        validators: [optionalValidator(Validators.min(5))],
      }),
      logo: new FormControl<File | null>(null),
    });
    this.institutionAnnotationLevelForm =
      new FormGroup<IAnnotationLevelFormInput>({
        annotation_level: new FormControl<StringOrNull>(null, {
          validators: [Validators.required],
        }),
        custom_label: new FormControl<StringOrNull>(null, {
          validators: [Validators.required],
        }),
      });
  }

  async loadInstitutions(): Promise<Observable<IinstitutionsResponse>> {
    return this.http.get<IinstitutionsResponse>(this.INSTITUTION_API_URL).pipe(
      map((response) => {
        if (response) {
          return response;
        } else {
          throw new Error('No se pudo obtener listado de instituciones');
        }
      })
    );
  }

  async loadInstitutionByID(
    id: number
  ): Promise<Observable<IinstitutionResponse>> {
    return this.http
      .get<IinstitutionResponse>(`${this.INSTITUTION_API_URL}/${id}`)
      .pipe(
        map((response) => {
          if (response) {
            return response;
          } else {
            throw new Error('No se pudo obtener institución mediante ID');
          }
        })
      );
  }

  async storeInstitution(
    input: IinstitutionInput
  ): Promise<Observable<IinstitutionResponse>> {
    const form = new FormData();
    Object.entries(input).forEach(([key, value]) => {
      if (value != null) {
        if (key === 'logo' && value instanceof File) {
          form.append(key, value);
        } else {
          form.append(key, value.toString());
        }
      }
    });

    return this.http
      .post<IinstitutionResponse>(this.INSTITUTION_API_URL, form)
      .pipe(
        map((response) => {
          if (response) {
            return response;
          } else {
            throw new Error('No se pudo crear institución');
          }
        })
      );
  }

  async updateInstitution(
    input: IinstitutionInput,
    id: number
  ): Promise<Observable<IinstitutionResponse>> {
    const form = new FormData();

    Object.entries(input).forEach(([key, value]) => {
      if (value != null) {
        if (key === 'logo' && value instanceof File) {
          form.append(key, value);
        } else {
          form.append(key, value.toString());
        }
      }
    });

    return this.http
      .post<IinstitutionResponse>(`${this.INSTITUTION_API_URL}/${id}`, form)
      .pipe(
        map((response) => {
          if (response) {
            return response;
          } else {
            throw new Error('No se pudo actualizar institución');
          }
        })
      );
  }

  async deleteInstitution(id: number): Promise<Observable<boolean>> {
    return this.http.delete(`${this.INSTITUTION_API_URL}/${id}`).pipe(
      map((response) => {
        if (response) {
          return true;
        } else {
          throw new Error('No se pudo eliminar institución');
        }
      })
    );
  }

  getErrorMessage(controlName: keyof IInstitutionFormInput): string | null {
    const inputControl = this.institutionForm.get(controlName);
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

  async loadAnnotationLevelByID(
    id: number
  ): Promise<Observable<IinstitutionAnnotationLevelResponse>> {
    return this.http
      .get<IinstitutionAnnotationLevelResponse>(
        `${this.INSTITUTION_API_URL}/annotation/level/${id}`
      )
      .pipe(
        map((response) => {
          if (response) {
            return response;
          } else {
            throw new Error(
              'No se pudo obtener nivel de anotación mediante ID'
            );
          }
        })
      );
  }

  async loadAnnotationLevels(): Promise<
    Observable<IinstitutionAnnotationLevelsResponse>
  > {
    return this.http
      .get<IinstitutionAnnotationLevelsResponse>(
        `${this.INSTITUTION_API_URL}/annotation/level`
      )
      .pipe(
        map((response) => {
          if (response) {
            return response;
          } else {
            throw new Error(
              'No se pudo obtener listado de niveles de anotación'
            );
          }
        })
      );
  }

  async storeAnnotationLevel(
    input: IInstitutionAnnotationLevelInput
  ): Promise<Observable<IinstitutionAnnotationLevelsResponse>> {
    return this.http
      .post<IinstitutionAnnotationLevelsResponse>(
        `${this.INSTITUTION_API_URL}/annotation/level`,
        input
      )
      .pipe(
        map((response) => {
          if (response) {
            return response;
          } else {
            throw new Error('No se pudo crear nivel de anotación');
          }
        })
      );
  }

  async updateAnnotationLevel(
    input: IInstitutionAnnotationLevelInput,
    id: number
  ): Promise<Observable<IinstitutionAnnotationLevelsResponse>> {
    return this.http
      .put<IinstitutionAnnotationLevelsResponse>(
        `${this.INSTITUTION_API_URL}/annotation/level/${id}`,
        input
      )
      .pipe(
        map((response) => {
          if (response) {
            return response;
          } else {
            throw new Error('No se pudo actualizar nivel de anotación');
          }
        })
      );
  }

  async deleteAnnotationLevel(id: number): Promise<Observable<boolean>> {
    return this.http
      .delete(`${this.INSTITUTION_API_URL}/annotation/level/${id}`)
      .pipe(
        map((response) => {
          if (response) {
            return true;
          } else {
            throw new Error('No se pudo eliminar nivel de anotación');
          }
        })
      );
  }

  getAnnotationLevelErrorMessage(
    controlName: keyof IAnnotationLevelFormInput
  ): string | null {
    const inputControl = this.institutionAnnotationLevelForm.get(controlName);
    if (inputControl && inputControl.errors) {
      for (const errorKey in inputControl.errors) {
        if (errorKey === '0') {
          // TODO mejorar validaciones personalizadas por respuestas del servidor
          return this.annotationLevelErrorMessages[controlName]['serverError'];
        } else if (errorKey in this.annotationLevelErrorMessages[controlName]) {
          return this.annotationLevelErrorMessages[controlName][errorKey];
        }
      }
    }
    return null;
  }
}
