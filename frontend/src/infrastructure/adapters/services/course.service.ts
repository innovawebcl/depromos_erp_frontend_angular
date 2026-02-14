import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import type { IcourseFormInput, IcourseService } from '@core-services/course';

import type { ErrorMessage, StringOrNull } from '@core-interfaces/global';

import type {
  IcoursesResponse,
  IcourseResponse,
} from '@core-ports/outputs/course';

import type { IcourseInput } from '@core-ports/inputs/course';

import { map, Observable } from 'rxjs';
import { environment } from '@infra-env/environment';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import type { IstudentsResponse } from '@core-ports/outputs/student';
import type { IannotationInput } from '@core-ports/inputs/annotation';
import type { IannotationsResponse } from '@core-ports/outputs/annotation';
import { AuthManager } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class CourseManager implements IcourseService {
  private readonly COURSE_API_URL = `${environment.apiUrl}/course`;

  readonly errorMessages: ErrorMessage = {
    name: {
      required: 'El nombre de curso es requerido.',
      minlength: 'El nombre de curso debe tener al menos 4 caracteres.',
      serverError: '',
    },
    // level: {
    //   required: 'Nivel de curso es requerido.',
    //   min: 'Nivel debe ser minímo de primer grado',
    //   serverError: '',
    // },
  };

  courseForm: FormGroup<IcourseFormInput>;

  constructor(private http: HttpClient, private authService: AuthManager) {
    this.courseForm = new FormGroup<IcourseFormInput>({
      name: new FormControl<StringOrNull>(null, {
        validators: [Validators.required, Validators.minLength(4)],
      }),
      // level: new FormControl<NumberOrNull>(null, {
      //   validators: [Validators.required, Validators.min(1)],
      // }),
    });
  }

  async loadCourses(): Promise<Observable<IcoursesResponse>> {
    return this.http.get<IcoursesResponse>(this.COURSE_API_URL).pipe(
      map((response) => {
        if (response) {
          return response;
        } else {
          throw new Error('No se pudo obtener listado de cursos');
        }
      })
    );
  }

  async loadCourseByID(id: number): Promise<Observable<IcourseResponse>> {
    return this.http.get<IcourseResponse>(`${this.COURSE_API_URL}/${id}`).pipe(
      map((response) => {
        if (response) {
          return response;
        } else {
          throw new Error('No se pudo obtener curso mediante ID');
        }
      })
    );
  }
  async loadStudentsByCourseID(
    id: number
  ): Promise<Observable<IstudentsResponse>> {
    return this.http
      .get<IstudentsResponse>(`${this.COURSE_API_URL}/${id}/students`)
      .pipe(
        map((response) => {
          if (response) {
            return response;
          } else {
            throw new Error('No se pudo obtener curso mediante ID');
          }
        })
      );
  }

  async storeCourse(input: IcourseInput): Promise<Observable<IcourseResponse>> {
    return this.http.post<IcourseResponse>(this.COURSE_API_URL, input).pipe(
      map((response) => {
        if (response) {
          return response;
        } else {
          throw new Error('No se pudo crear curso');
        }
      })
    );
  }

  async updateCourse(
    input: IcourseInput,
    id: number
  ): Promise<Observable<IcourseResponse>> {
    return this.http
      .put<IcourseResponse>(`${this.COURSE_API_URL}/${id}`, input)
      .pipe(
        map((response) => {
          if (response) {
            return response;
          } else {
            throw new Error('No se pudo actualizar curso');
          }
        })
      );
  }

  async deleteCourse(id: number): Promise<Observable<boolean>> {
    return this.http.delete(`${this.COURSE_API_URL}/${id}`).pipe(
      map((response) => {
        if (response) {
          return true;
        } else {
          throw new Error('No se pudo eliminar curso');
        }
      })
    );
  }

  getErrorMessage(controlName: keyof IcourseFormInput): string | null {
    const inputControl = this.courseForm.get(controlName);
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

  async storeAnnotation(
    courseId: number,
    input: IannotationInput
  ): Promise<Observable<IannotationsResponse>> {
    const annotator = `${this.authService.UserSessionData()?.first_name} ${
      this.authService.UserSessionData()?.last_name
    }`;

    return this.http
      .post<IannotationsResponse>(
        `${this.COURSE_API_URL}/${courseId}/annotation`,
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
}
