import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { firstValueFrom, map, Observable } from 'rxjs';
import { environment } from '@infra-env/environment';
import {
  type FormGroup,
  type FormArray,
  FormBuilder,
  Validators,
} from '@angular/forms';

import type {
  ErrorMessage,
  StringOrNull,
  NumberOrNull,
  DateOrNull,
} from '@core-interfaces/global';

import type {
  ICourseStudentsForm,
  IGuardianStudentForm,
  IStudentFormInput,
  IAnnotationStudentForm,
  IstudentService,
  IInterviewForm,
} from '@core-services/student';

import type {
  IstudentsResponse,
  IstudentResponse,
  IsociogramsByCourseForStudent,
  IstudentDashboardResponse,
  IstudentFinishSociogramResponse,
} from '@core-ports/outputs/student';

import type { IstudentInput } from '@core-ports/inputs/student';
import { IannotationInput } from '@core-ports/inputs/annotation';
import { IannotationResponse } from '@core-ports/outputs/annotation';
import {
  IanswerBySociogramResponses,
  IclassmateOptionsResponses,
  IsociogramResponse,
} from '@core-ports/outputs/sociograms';
import { IInterviewInput } from '@core-ports/inputs/interview';
import { IinterviewResponse } from '@core-ports/outputs/interview';
import { AuthManager } from './auth.service';
import { TranslateRolePipe } from '@infra-adapters/pipe/TranslateRole.pipe';

@Injectable({
  providedIn: 'root',
})
export class studentManager implements IstudentService {
  private readonly STUDENT_API_URL = `${environment.apiUrl}/student`;

  readonly errorMessages: ErrorMessage = {
    username: {
      required: 'El nombre de usuario es requerido.',
      serverError: '',
    },
    password: {
      required: 'La contraseña es requerido.',
      minlength: 'La contraseña debe tener al menos 6 caracteres.',
      serverError: '',
    },
    first_name: {
      required: 'El nombre del estudiante es requerido.',
      serverError: '',
    },
    second_name: {
      required: 'El segundo nombre del estudiante es requerido.',
      serverError: '',
    },
    name_guardian: {
      required: 'El nombre del estudiante es requerido.',
      serverError: '',
    },
    last_name: {
      required: 'El apellido paterno del estudiante es requerido.',
      serverError: '',
    },
    second_last_name: {
      required: 'El apellido materno del estudiante es requerido.',
      serverError: '',
    },
    last_name_guardian: {
      required: 'El apellido del apoderado es requerido.',
      serverError: '',
    },
    email: {
      required: 'Dirección de correo es requerido.',
      email: 'Dirección de correo debe ser valida.',
      serverError: '',
    },
    email_guardian: {
      required: 'Dirección de correo es requerido.',
      email: 'Dirección de correo debe ser valida.',
      serverError: '',
    },
    rut: {
      required: 'Rut de estudiante es requerido.',
      serverError: '',
    },
    birth_date: {
      required: 'Fecha de nacimiento del estudiante es requerido.',
      serverError: '',
    },
    address: { required: 'Dirección de estudiante es requerida.' },
    number_of_siblings: {
      required: 'Cantidad de hermanos de estudiante es requerido.',
    },
    people_living_with: {
      required: 'Personas que viven con el estudiante es requerido.',
    },
    repeated_courses: {
      required: 'Cursos repetidos de estudiante es requerido.',
    },
    years_in_school: {
      required: 'Años en la escuela es requerido.',
    },
    course_id: {
      required: 'Asignación de curso es requerido.',
      serverError: '',
    },
    phone_guardian: {
      required: 'Teléfono de apoderado es requerido.',
    },
    kinship_guardian: {
      required: 'Parentesco de apoderado es requerido.',
    },
  };

  readonly errorMessagesAnnotation: ErrorMessage = {
    observation: {
      required: 'Observación es requerida.',
    },
    type: {
      required: 'Tipo de anotación es requerido.',
    },
  };

  readonly errorMessagesInterview: ErrorMessage = {
    interview_date: {
      required: 'Fecha de entrevista es requerida.',
    },
    reason: {
      required: 'Motivo de entrevista es requerido.',
    },
    records: {
      required: 'Registros de entrevista es requerido.',
    },
    comments: {
      required: 'Comentarios de entrevista es requerido.',
    },
    agreements: {
      required: 'Acuerdos de entrevista es requerido.',
    },
  };

  studentForm: FormGroup<IStudentFormInput>;

  annotationForm: FormGroup<IAnnotationStudentForm>;

  interviewForm: FormGroup<IInterviewForm>;

  constructor(
    private http: HttpClient,
    private fb: FormBuilder,
    private authService: AuthManager
  ) {
    this.studentForm = this.fb.group<IStudentFormInput>({
      username: this.fb.control<StringOrNull>(null, {
        validators: [Validators.required],
      }),
      password: this.fb.control<StringOrNull>(null, {
        validators: [Validators.required, Validators.minLength(6)],
      }),
      first_name: this.fb.control<StringOrNull>(null, {
        validators: [Validators.required],
      }),
      second_name: this.fb.control<StringOrNull>(null, {
        validators: [Validators.required],
      }),
      last_name: this.fb.control<StringOrNull>(null, {
        validators: [Validators.required],
      }),
      second_last_name: this.fb.control<StringOrNull>(null, {
        validators: [Validators.required],
      }),
      email: this.fb.control<StringOrNull>(null, {
        validators: [Validators.required, Validators.email],
      }),
      rut: this.fb.control<StringOrNull>(null, {
        validators: [Validators.required], // TODO validación customizada para RUT
      }),
      birth_date: this.fb.control<DateOrNull>(null, {
        validators: [Validators.required],
      }),
      address: this.fb.control<StringOrNull>(null, {
        validators: [Validators.required],
      }),
      medical_diagnosis: this.fb.control<StringOrNull>(null, {}),
      number_of_siblings: this.fb.control<NumberOrNull>(null, {
        validators: [Validators.required],
      }),
      people_living_with: this.fb.control<Array<string> | null>([], {
        validators: [Validators.required],
      }),
      repeated_courses: this.fb.control<Array<string> | null>([]),
      years_in_school: this.fb.control<NumberOrNull>(null, {
        validators: [Validators.required],
      }),
      guardians: this.fb.array<FormGroup<IGuardianStudentForm>>([]),
      courses: this.fb.array<FormGroup<ICourseStudentsForm>>([]),
    });

    this.annotationForm = this.fb.group<IAnnotationStudentForm>({
      observation: this.fb.control<StringOrNull>(null, {
        validators: [Validators.required],
      }),
      type: this.fb.control<StringOrNull>(null, {
        validators: [Validators.required],
      }),
      subcategory: this.fb.control<number | null>(null),
    });

    this.interviewForm = this.fb.group<IInterviewForm>({
      interview_date: this.fb.control<DateOrNull>(null, {
        validators: [Validators.required],
      }),
      reason: this.fb.control<StringOrNull>(null, {
        validators: [Validators.required],
      }),
      records: this.fb.control<StringOrNull>(null),
      comments: this.fb.control<StringOrNull>(null),
      agreements: this.fb.control<StringOrNull>(null),
    });
  }

  async loadStudents(): Promise<Observable<IstudentsResponse>> {
    return this.http.get<IstudentsResponse>(this.STUDENT_API_URL).pipe(
      map((response) => {
        if (response) {
          return response;
        } else {
          throw new Error('No se pudo obtener listado de profesores');
        }
      })
    );
  }

  async loadStudentByID(id: number): Promise<Observable<IstudentResponse>> {
    return this.http
      .get<IstudentResponse>(`${this.STUDENT_API_URL}/${id}`)
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

  async loadStudentMe(): Promise<Observable<IstudentResponse>> {
    return this.http.get<IstudentResponse>(`${this.STUDENT_API_URL}/me`).pipe(
      map((response) => {
        if (response) {
          return response;
        } else {
          throw new Error('No se pudo obtener profesor mediante ID');
        }
      })
    );
  }

  async storeStudent(
    input: IstudentInput
  ): Promise<Observable<IstudentResponse>> {
    return this.http.post<IstudentResponse>(this.STUDENT_API_URL, input).pipe(
      map((response) => {
        if (response) {
          return response;
        } else {
          throw new Error('No se pudo crear profesor');
        }
      })
    );
  }

  async updateStudent(
    input: IstudentInput,
    id: number
  ): Promise<Observable<IstudentResponse>> {
    return this.http
      .put<IstudentResponse>(`${this.STUDENT_API_URL}/${id}`, input)
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

  async deleteStudent(id: number): Promise<Observable<boolean>> {
    return this.http.delete(`${this.STUDENT_API_URL}/${id}`).pipe(
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
    controlName: keyof IStudentFormInput | string
  ): string | null {
    const inputControl = this.studentForm.get(controlName);

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

  getCourseErrorMessage(
    index: number,
    controlName: keyof ICourseStudentsForm | string
  ): string | null {
    const courseForm = this.studentForm.get('courses') as FormArray<
      FormGroup<ICourseStudentsForm>
    >;
    const inputControl = courseForm.at(index).get(controlName);

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

  getGuardianErrorMessage(
    index: number,
    controlName: keyof IGuardianStudentForm | string
  ): string | null {
    const guardianForm = this.studentForm.get('guardians') as FormArray<
      FormGroup<IGuardianStudentForm>
    >;
    const inputControl = guardianForm.at(index).get(controlName);

    if (inputControl && inputControl.errors) {
      for (const errorKey in inputControl.errors) {
        const control = `${controlName}_guardian`;
        if (errorKey === 'serverError') {
          return (
            this.errorMessages[control]['serverError'] ||
            'Error en el servidor.'
          );
        }

        if (this.errorMessages[control]?.[errorKey]) {
          return this.errorMessages[control][errorKey];
        }
      }
    }

    return null;
  }

  getInterviewErrorMessage(
    controlName: keyof IInterviewForm | string
  ): string | null {
    const inputControl = this.interviewForm.get(controlName);

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

  async generateExcelFile(): Promise<void> {
    try {
      const blob = await firstValueFrom(
        this.http.get(`${this.STUDENT_API_URL}/download/template/common`, {
          responseType: 'blob',
        })
      );

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'plantilla_carga_masiva_estudiantes.xlsx'; // Nombre del archivo
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error al descargar el archivo:', error);
    }
  }

  async generateEmptyExcelFile(): Promise<void> {
    try {
      
      const blob = await firstValueFrom(
        this.http.get(`${this.STUDENT_API_URL}/download/template/sige`, {
          responseType: 'blob',
        })
      );

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'plantilla_estudiantes.xlsx'; // Nombre del archivo
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error al descargar el archivo:', error);
    }
  }

  async storeAnnotation(
    studentId: number,
    input: IannotationInput
  ): Promise<Observable<IannotationResponse>> {
    const annotator = `${this.authService.UserSessionData()?.first_name} ${
      this.authService.UserSessionData()?.last_name
    }`;

    return this.http
      .post<IannotationResponse>(
        `${this.STUDENT_API_URL}/${studentId}/annotation`,
        { ...input, annotator }
      )
      .pipe(
        map((response) => {
          if (response) {
            return response;
          } else {
            throw new Error('No se pudo crear anotación');
          }
        })
      );
  }
  // TODO seguimiento de interfaz

  async deleteAnnotation(
    annotation_id: number
  ): Promise<Observable<IannotationResponse>> {
    return this.http
      .delete<IannotationResponse>(
        `${this.STUDENT_API_URL}/annotation/${annotation_id}`
      )
      .pipe(
        map((response) => {
          if (response) {
            return response;
          } else {
            throw new Error('No se pudo eliminar anotación');
          }
        })
      );
  }
  // TODO seguimiento de interfaz
  getAnnotationErrorMessage(
    controlName: keyof IAnnotationStudentForm | string
  ): string | null {
    const inputControl = this.annotationForm.get(controlName);

    if (inputControl && inputControl.errors) {
      for (const errorKey in inputControl.errors) {
        if (errorKey === 'serverError') {
          return (
            this.errorMessagesAnnotation[controlName]['serverError'] ||
            'Error en el servidor.'
          );
        }
        if (this.errorMessagesAnnotation[controlName]?.[errorKey]) {
          return this.errorMessagesAnnotation[controlName][errorKey];
        }
      }
    }

    return null;
  }

  // TODO seguimiento de interfaz
  async uploadFile(
    file: File,
    isTemplateSIGE?: boolean
  ): Promise<Observable<any>> {
    let url = isTemplateSIGE
      ? `${this.STUDENT_API_URL}/upload/template/sige`
      : `${this.STUDENT_API_URL}/upload/template/common`;
      
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post(url, formData).pipe(
      map((response) => {
        if (response) {
          return response;
        } else {
          throw new Error('Error al procesar la carga masiva.');
        }
      })
    );
  }

  // TODO seguimiento de interfaz
  async getSociogramsByCourse(course_id: number) {
    return this.http
      .get<IstudentResponse>(
        `${this.STUDENT_API_URL}/course/${course_id}/sociograms`
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
  async getCourses() {
    return this.http
      .get<IstudentResponse>(`${this.STUDENT_API_URL}/course/list`)
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

  // TODO seguimiento de interfaz
  async getSociogramsByCourseBySociogramID(
    course_id: number,
    sociogram_id: number
  ) {
    return this.http
      .get<IstudentResponse>(
        `${this.STUDENT_API_URL}/course/${course_id}/sociograms/${sociogram_id}`
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

  // TODO seguimiento de interfaz
  async getClassmate(course_id: number) {
    return this.http
      .get<IstudentsResponse>(
        `${this.STUDENT_API_URL}/course/${course_id}/classmate`
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

  // TODO seguimiento de interfaz
  async getAnswerBySociogram(course_id: number, sociogram_id: number) {
    return this.http
      .get<IstudentResponse>(
        `${this.STUDENT_API_URL}/course/${course_id}/sociograms/${sociogram_id}/answer`
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

  // TODO implementación de interfaz
  async declareAnswerSociogram(input: {
    question_id: number;
    sociogram_id: number;
    course_id: number;
    value: string;
  }) {
    return this.http
      .post<any>(`${this.STUDENT_API_URL}/course/sociogram/answer`, input)
      .pipe(
        map((response) => {
          if (response) {
            return response;
          } else {
            throw new Error('No se declarar respuesta');
          }
        })
      );
  }
  // TODO implementación de interfaz
  async declareAnswerClassmateSociogram(input: {
    question_id: number;
    sociogram_id: number;
    course_id: number;
    references: number[];
  }) {
    return this.http
      .post<any>(
        `${this.STUDENT_API_URL}/course/sociogram/answer/classmate`,
        input
      )
      .pipe(
        map((response) => {
          if (response) {
            return response;
          } else {
            throw new Error('No se declarar respuesta');
          }
        })
      );
  }
  // TODO seguimiento de interfaz
  async loadDashboard() {
    return this.http
      .get<IstudentDashboardResponse>(`${this.STUDENT_API_URL}/dashboard`)
      .pipe(
        map((response) => {
          if (response) {
            return response;
          } else {
            throw new Error('No se pudo obtener dashboard');
          }
        })
      );
  }

  async finishSociogram(sociogram_id: number) {
    return this.http
      .post<IstudentFinishSociogramResponse>(
        `${this.STUDENT_API_URL}/sociogram/finish`,
        { sociogram_id }
      )
      .pipe(
        map((response) => {
          if (response) {
            return response;
          } else {
            throw new Error('No se pudo obtener dashboard');
          }
        })
      );
  }
  async isFinishSociogram(sociogram_id: number) {
    return this.http
      .get<IstudentFinishSociogramResponse>(
        `${this.STUDENT_API_URL}/sociogram/${sociogram_id}/finish`
      )
      .pipe(
        map((response) => {
          if (response) {
            return response;
          } else {
            throw new Error('No se pudo obtener dashboard');
          }
        })
      );
  }

  async storeInterview(
    studentId: number,
    input: IInterviewInput
  ): Promise<Observable<IinterviewResponse>> {
    return this.http
      .post<IinterviewResponse>(
        `${this.STUDENT_API_URL}/${studentId}/interview`,
        input
      )
      .pipe(
        map((response) => {
          if (response) {
            return response;
          } else {
            throw new Error('No se pudo crear entrevista');
          }
        })
      );
  }

  async loadInterviewById(id: number): Promise<Observable<IinterviewResponse>> {
    return this.http
      .get<IinterviewResponse>(`${this.STUDENT_API_URL}/interview/${id}`)
      .pipe(
        map((response) => {
          if (response) {
            return response;
          } else {
            throw new Error('No se pudo obtener entrevista mediante ID');
          }
        })
      );
  }
}
