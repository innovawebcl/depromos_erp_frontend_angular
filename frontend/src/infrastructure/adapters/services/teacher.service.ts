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
  DateOrNull,
} from '@core-interfaces/global';

import type {
  IteacherService,
  ITeacherFormInput,
  ICourseTeachersForm,
} from '@core-interfaces/services/teacher';

import type {
  IteachersResponse,
  IteacherResponse,
} from '@core-ports/outputs/teacher';

import type { IteacherInput } from '@core-ports/inputs/teacher';

@Injectable({
  providedIn: 'root',
})
export class teacherManager implements IteacherService {
  private readonly TEACHER_API_URL = `${environment.apiUrl}/teacher`;

  errorMessages: ErrorMessage = {
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
      required: 'El nombre del profesor es requerido.',
      serverError: '',
    },
    last_name: {
      required: 'El apellido del profesor es requerido.',
      serverError: '',
    },
    email: {
      required: 'Dirección de correo es requerido.',
      email: 'Dirección de correo debe ser valida.',
      serverError: '',
    },
    rut: {
      required: 'Rut de profesor es requerido.',
      serverError: '',
    },
    birth_date: {
      required: 'Fecha de nacimiento del profesor es requerido.',
      serverError: '',
    },
    subject_specialty: {
      required: 'Especialidad de profesor es requerido.',
      serverError: '',
    },
    role: {
      required: 'Rol de profesor es requerido.',
      serverError: '',
    },
    course_id: {
      required: 'Asignación de curso es requerido.',
      serverError: '',
    },
  };

  teacherForm: FormGroup<ITeacherFormInput>;

  constructor(private http: HttpClient, private fb: FormBuilder) {
    this.teacherForm = this.fb.group<ITeacherFormInput>({
      username: this.fb.control<StringOrNull>(null, {
        validators: [Validators.required],
      }),
      password: this.fb.control<StringOrNull>(null, {
        validators: [Validators.required, Validators.minLength(6)],
      }),
      first_name: this.fb.control<StringOrNull>(null, {
        validators: [Validators.required],
      }),
      last_name: this.fb.control<StringOrNull>(null, {
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
      subject_specialty: this.fb.control<StringOrNull>(null, {
        validators: [Validators.required],
      }),
      courses: this.fb.array<FormGroup<ICourseTeachersForm>>([]),
    });
  }

  async loadTeachers(): Promise<Observable<IteachersResponse>> {
    return this.http.get<IteachersResponse>(this.TEACHER_API_URL).pipe(
      map((response) => {
        if (response) {
          return response;
        } else {
          throw new Error('No se pudo obtener listado de profesores');
        }
      })
    );
  }

  async loadTeacherByID(id: number): Promise<Observable<IteacherResponse>> {
    return this.http
      .get<IteacherResponse>(`${this.TEACHER_API_URL}/${id}`)
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

  async loadTeacherMe(): Promise<Observable<IteacherResponse>> {
    return this.http.get<IteacherResponse>(`${this.TEACHER_API_URL}/me`).pipe(
      map((response) => {
        if (response) {
          return response;
        } else {
          throw new Error('No se pudo obtener profesor logueado');
        }
      })
    );
  }

  async storeTeacher(
    input: IteacherInput
  ): Promise<Observable<IteacherResponse>> {
    return this.http.post<IteacherResponse>(this.TEACHER_API_URL, input).pipe(
      map((response) => {
        if (response) {
          return response;
        } else {
          throw new Error('No se pudo crear profesor');
        }
      })
    );
  }

  async updateTeacher(
    input: IteacherInput,
    id: number
  ): Promise<Observable<IteacherResponse>> {
    return this.http
      .put<IteacherResponse>(`${this.TEACHER_API_URL}/${id}`, input)
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

  async deleteTeacher(id: number): Promise<Observable<boolean>> {
    return this.http.delete(`${this.TEACHER_API_URL}/${id}`).pipe(
      map((response) => {
        if (response) {
          return true;
        } else {
          throw new Error('No se pudo eliminar profesor');
        }
      })
    );
  }

  async generateExcelFile(): Promise<void> {
    try {
      const blob = await firstValueFrom(
        this.http.get(`${this.TEACHER_API_URL}/download/template`, {
          responseType: 'blob',
        })
      );

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'plantilla_carga_masiva_profesores.xlsx'; // Nombre del archivo
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error al descargar el archivo:', error);
    }
  }

  async uploadFile(file: File): Promise<Observable<any>> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http
      .post(`${this.TEACHER_API_URL}/upload/template`, formData)
      .pipe(
        map((response) => {
          if (response) {
            return response;
          } else {
            throw new Error('Error al procesar la carga masiva.');
          }
        })
      );
  }

  getErrorMessage(
    controlName: keyof ITeacherFormInput | string
  ): string | null {
    const inputControl = this.teacherForm.get(controlName);

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
    controlName: keyof ICourseTeachersForm | string
  ): string | null {
    const courseForm = this.teacherForm.get('courses') as FormArray<
      FormGroup<ICourseTeachersForm>
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
}
