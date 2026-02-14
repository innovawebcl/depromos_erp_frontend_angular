import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { map, Observable } from 'rxjs';
import { environment } from '@infra-env/environment';
import {
  type FormGroup,
  type FormArray,
  FormBuilder,
  Validators,
} from '@angular/forms';

import type {
  StringOrNull,
  NumberOrNull,
  ErrorMessage,
  BoolOrNull,
} from '@core-interfaces/global';

import type {
  IcoursesToSociogramInput,
  IinstitutionsToSociogramInput,
  IsociogramInput,
} from '@core-ports/inputs/sociogram';

import type {
  IsociogramResponses,
  IsociogramResponse,
  IsociogramAnswerResponses,
  IsociogramRulesResponses,
  IsociogramOptionsResponses,
  IcoursesToSociogramResponse,
  IreportSociogramResponse,
  IinstitutionsToSociogramResponse,
} from '@core-ports/outputs/sociograms';

import type {
  IsociogramService,
  IquestionForm,
  IsociogramFormInput,
  IcoursesToSociogramForm,
  IcoursesSociogramForm,
  IinstitutionToSociogramForm,
  IinstitutionsSociogramForm,
} from '@core-services/sociogram';

@Injectable({
  providedIn: 'root',
})
export class sociogramManager implements IsociogramService {
  private readonly SOCIOGRAM_API_URL = `${environment.apiUrl}/sociogram`;

  readonly errorMessages: ErrorMessage = {
    title: {
      required: 'El título del sociograma es requerido.',
    },
    version: {
      required: 'La versión del sociograma es requerida.',
    },
    'questions.title': {
      required: 'El título de la pregunta es requerido.',
    },
    'questions.is_multiple_choice': {
      required: 'Debe especificar si es de selección múltiple.',
    },
    'questions.is_classmates': {
      required: 'Debe especificar si es para compañeros de clase.',
    },
    'answers.text': {
      required: 'El texto de la respuesta es requerido.',
    },
  };

  sociogramForm: FormGroup<IsociogramFormInput>;
  coursesToSociogramForm: FormGroup<IcoursesToSociogramForm>;
  institutionsToSociogramForm: FormGroup<IinstitutionToSociogramForm>;

  constructor(private http: HttpClient, private fb: FormBuilder) {
    this.sociogramForm = this.fb.group<IsociogramFormInput>({
      title: this.fb.control<StringOrNull>(null, {
        validators: [Validators.required],
      }),
      version: this.fb.control<NumberOrNull>(null, {
        validators: [Validators.required],
      }),
      questions: this.fb.array<FormGroup<IquestionForm>>([
        this.fb.group<IquestionForm>({
          title: this.fb.control<StringOrNull>(null, {
            validators: [Validators.required],
          }),
          is_multiple_choice: this.fb.control<BoolOrNull>(false, {
            validators: [Validators.required],
          }),
          enum_as_options: this.fb.control<StringOrNull>(null, {
            validators: [Validators.required],
          }),
          rules: this.fb.control<StringOrNull>(null, {
            validators: [Validators.required],
          }),
        }),
      ]),
    });

    this.coursesToSociogramForm = this.fb.group<IcoursesToSociogramForm>({
      sociogram_id: this.fb.control<NumberOrNull>(null, {
        validators: [Validators.required],
      }),
      title: this.fb.control<StringOrNull>(null, {
        validators: [Validators.required],
      }),
      courses: this.fb.array<FormGroup<IcoursesSociogramForm>>([
        this.fb.group<IcoursesSociogramForm>({
          course_id: this.fb.control<NumberOrNull>(null, {
            validators: [Validators.required],
          }),
          title: this.fb.control<StringOrNull>(null, {
            validators: [Validators.required],
          }),
        }),
      ]),
    });
    this.institutionsToSociogramForm =
      this.fb.group<IinstitutionToSociogramForm>({
        sociogram_id: this.fb.control<NumberOrNull>(null, {
          validators: [Validators.required],
        }),
        title: this.fb.control<StringOrNull>(null, {
          validators: [Validators.required],
        }),
        institutions: this.fb.array<FormGroup<IinstitutionsSociogramForm>>([
          this.fb.group<IinstitutionsSociogramForm>({
            institution_id: this.fb.control<NumberOrNull>(null, {
              validators: [Validators.required],
            }),
            title: this.fb.control<StringOrNull>(null, {
              validators: [Validators.required],
            }),
          }),
        ]),
      });
  }

  async loadSociograms(): Promise<Observable<IsociogramResponses>> {
    return this.http.get<IsociogramResponses>(this.SOCIOGRAM_API_URL).pipe(
      map((response) => {
        if (response) {
          return response;
        } else {
          throw new Error('No se pudo obtener listado de sociogramas');
        }
      })
    );
  }
  async loadSociogramsByInstitutionID(): Promise<
    Observable<IsociogramResponses>
  > {
    return this.http
      .get<IsociogramResponses>(`${this.SOCIOGRAM_API_URL}/byinstitutions`)
      .pipe(
        map((response) => {
          if (response) {
            return response;
          } else {
            throw new Error('No se pudo obtener listado de sociogramas');
          }
        })
      );
  }

  async loadSociogramByID(id: number): Promise<Observable<IsociogramResponse>> {
    return this.http
      .get<IsociogramResponse>(`${this.SOCIOGRAM_API_URL}/${id}`)
      .pipe(
        map((response) => {
          if (response) {
            return response;
          } else {
            throw new Error('No se pudo obtener profesor mediante ID');
          }
        })
      );
  }

  async storeSociogram(
    input: IsociogramInput
  ): Promise<Observable<IsociogramResponse>> {
    return this.http
      .post<IsociogramResponse>(this.SOCIOGRAM_API_URL, input)
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

  async updateSociogram(
    input: IsociogramInput,
    id: number
  ): Promise<Observable<IsociogramResponse>> {
    return this.http
      .put<IsociogramResponse>(`${this.SOCIOGRAM_API_URL}/${id}`, input)
      .pipe(
        map((response) => {
          if (response) {
            return response;
          } else {
            throw new Error('No se pudo actualizar profesor');
          }
        })
      );
  }

  async deleteSociogram(id: number): Promise<Observable<boolean>> {
    return this.http.delete(`${this.SOCIOGRAM_API_URL}/${id}`).pipe(
      map((response) => {
        if (response) {
          return true;
        } else {
          throw new Error('No se pudo eliminar profesor');
        }
      })
    );
  }

  getErrorMessage(
    controlName: keyof IsociogramFormInput | string
  ): string | null {
    const inputControl = this.sociogramForm.get(controlName);

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
  getQuestionErrorMessage(
    index: number,
    controlName: keyof IquestionForm | string
  ): string | null {
    const questionsFormArray = this.sociogramForm.get('questions') as FormArray<
      FormGroup<IquestionForm>
    >;
    const inputControl = questionsFormArray.at(index).get(controlName);

    if (inputControl && inputControl.errors) {
      for (const errorKey in inputControl.errors) {
        if (errorKey === 'serverError') {
          return (
            this.errorMessages[controlName]?.['serverError'] ||
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

  getTypeAnswers() {
    return this.http
      .get<IsociogramAnswerResponses>(`${this.SOCIOGRAM_API_URL}/answer/type`)
      .pipe(
        map((response) => {
          if (response) {
            return response;
          } else {
            throw new Error('No se pudo obtener profesor mediante ID');
          }
        })
      );
  }
  getRules() {
    return this.http
      .get<IsociogramRulesResponses>(`${this.SOCIOGRAM_API_URL}/rules/type`)
      .pipe(
        map((response) => {
          if (response) {
            return response;
          } else {
            throw new Error('No se pudo obtener profesor mediante ID');
          }
        })
      );
  }
  getSociogramsOptions() {
    return this.http
      .get<IsociogramOptionsResponses>(`${this.SOCIOGRAM_API_URL}/options/type`)
      .pipe(
        map((response) => {
          if (response) {
            return response;
          } else {
            throw new Error('No se pudo obtener profesor mediante ID');
          }
        })
      );
  }

  getCoursesToSociogram(id: number) {
    return this.http
      .get<IcoursesToSociogramResponse>(
        `${this.SOCIOGRAM_API_URL}/${id}/courses`
      )
      .pipe(
        map((response) => {
          if (response) {
            return response;
          } else {
            throw new Error('No se pudo obtener profesor mediante ID');
          }
        })
      );
  }
  getReportBySociogramIdAndCourseID(sociogram_id: number, course_id: number) {
    return this.http
      .get<IreportSociogramResponse>(
        `${this.SOCIOGRAM_API_URL}/${sociogram_id}/metrics/course/${course_id}`
      )
      .pipe(
        map((response) => {
          if (response) {
            return response;
          } else {
            throw new Error('No se pudo obtener profesor mediante ID');
          }
        })
      );
  }
  registerOrUpdateCoursesToSociogram(input: IcoursesToSociogramInput) {
    return this.http
      .post<IcoursesToSociogramResponse>(
        `${this.SOCIOGRAM_API_URL}/courses`,
        input
      )
      .pipe(
        map((response) => {
          if (response) {
            return response;
          } else {
            throw new Error('No se pudo obtener profesor mediante ID');
          }
        })
      );
  }

  getInstitutionsToSociogram(id: number) {
    return this.http
      .get<IinstitutionsToSociogramResponse>(
        `${this.SOCIOGRAM_API_URL}/${id}/institutions`
      )
      .pipe(
        map((response) => {
          if (response) {
            return response;
          } else {
            throw new Error('No se pudo obtener profesor mediante ID');
          }
        })
      );
  }

  registerOrUpdateInstitutionsToSociogram(
    input: IinstitutionsToSociogramInput
  ) {
    return this.http
      .post<IinstitutionsToSociogramResponse>(
        `${this.SOCIOGRAM_API_URL}/institutions`,
        input
      )
      .pipe(
        map((response) => {
          if (response) {
            return response;
          } else {
            throw new Error('No se pudo obtener profesor mediante ID');
          }
        })
      );
  }
}
