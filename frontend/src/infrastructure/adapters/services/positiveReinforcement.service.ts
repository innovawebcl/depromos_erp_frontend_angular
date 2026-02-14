import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { map, Observable } from 'rxjs';
import { environment } from '@infra-env/environment';
import {
  type FormGroup,
  type FormArray,
  FormBuilder,
  Validators,
  FormControl,
} from '@angular/forms';

import type {
  ErrorMessage,
  StringOrNull,
  NumberOrNull,
} from '@core-interfaces/global';
import { IpositiveReinforcementsResponse } from '@core-ports/outputs/positiveReinforcement';
import { IpositiveReinforcementInput } from '@core-ports/inputs/positiveReinforcement';

export interface IpositiveReinforcementForm {
  message: FormControl<StringOrNull>;
  receiver_student_id: FormControl<NumberOrNull>;
}

@Injectable({
  providedIn: 'root',
})
export class positiveReinforcementManager {
  private readonly POSITIVE_REINFORCEMENT_API_URL = `${environment.apiUrl}/positivereinforcement`;

  readonly errorMessages: ErrorMessage = {
    message: {
      required: 'Mensaje es requerido',
      serverError: '',
    },
    receiver_student_id: {
      required: 'Estudiante es requerido',
      serverError: '',
    },
  };

  positiveReinforcementForm: FormGroup<IpositiveReinforcementForm>;

  constructor(private http: HttpClient, private fb: FormBuilder) {
    this.positiveReinforcementForm = this.fb.group<IpositiveReinforcementForm>({
      message: this.fb.control<StringOrNull>(null, {
        validators: [Validators.required],
      }),
      receiver_student_id: this.fb.control<NumberOrNull>(null, {
        validators: [Validators.required],
      }),
    });
  }
  // IpositiveReinforcement

  async loadPositiveReinforcements(): Promise<
    Observable<IpositiveReinforcementsResponse>
  > {
    return this.http
      .get<IpositiveReinforcementsResponse>(this.POSITIVE_REINFORCEMENT_API_URL)
      .pipe(
        map((response) => {
          if (response) {
            return response;
          } else {
            throw new Error('No se pudo obtener listado de profesores');
          }
        })
      );
  }

  async loadInstitutionPositiveReinforcements(): Promise<
    Observable<IpositiveReinforcementsResponse>
  > {
    return this.http
      .get<IpositiveReinforcementsResponse>(
        `${this.POSITIVE_REINFORCEMENT_API_URL}/institution`
      )
      .pipe(
        map((response) => {
          if (response) {
            return response;
          } else {
            throw new Error('No se pudo obtener listado de profesores');
          }
        })
      );
  }

  async storePositiveReinforcement(
    input: IpositiveReinforcementInput
  ): Promise<Observable<IpositiveReinforcementsResponse>> {
    return this.http
      .post<IpositiveReinforcementsResponse>(
        this.POSITIVE_REINFORCEMENT_API_URL,
        input
      )
      .pipe(
        map((response) => {
          if (response) {
            return response;
          } else {
            throw new Error('No se pudo crear profesor');
          }
        })
      );
  }

  getErrorMessage(
    controlName: keyof IpositiveReinforcementForm | string
  ): string | null {
    const inputControl = this.positiveReinforcementForm.get(controlName);

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
