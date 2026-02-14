// * Complemento de tipados con framework
import type { Observable } from 'rxjs';
import type { FormControl } from '@angular/forms';

import type {
  ErrorMessage,
  StringOrNull,
  NumberOrNull,
} from '@core-interfaces/global';

import type {
  IcoursesResponse,
  IcourseResponse,
} from '@core-ports/outputs/course';

import type { IcourseInput, courseArgs } from '@core-ports/inputs/course';
import { IannotationInput } from '@core-ports/inputs/annotation';
import { IannotationsResponse } from '@core-ports/outputs/annotation';

export interface IcourseFormInput extends Omit<IcourseInput, courseArgs> {
  name: FormControl<StringOrNull>;
  // level: FormControl<NumberOrNull>;
}

export interface IcourseService {
  /**
   * * Define la estructura de errores para la interpretación del formulario en pantalla
   */
  readonly errorMessages: ErrorMessage;

  /**
   * * Solicitud para cargar listado de cursos, es requerido rol SuperAdministrador o Administrador
   */
  loadCourses(): Promise<Observable<IcoursesResponse>>;
  /**
   * * Solicitud para cargar curso mediante ID, es requerido rol SuperAdministrador o Administrador
   */
  loadCourseByID(id: number): Promise<Observable<IcourseResponse>>;

  /**
   * * Solicitud para crear nuevos cursos, es requerido rol SuperAdministrador
   * @param input IcourseInput
   */
  storeCourse(input: IcourseInput): Promise<Observable<IcourseResponse>>;

  /**
   * * Solicitud para actualizar un curso por ID, es requerido rol SuperAdministrador Administrador
   * @param input IcourseInput
   * @param id identificador de institución
   */
  updateCourse(
    input: IcourseInput,
    id: number
  ): Promise<Observable<IcourseResponse>>;

  /**
   * * Solicitud para eliminar un curso por ID, es requerido rol SuperAdministrador
   * @param id identificador de curso
   */
  deleteCourse(id: number): Promise<Observable<boolean>>;

  /**
   * * Obtiene los posibles errores por claves de formulario
   * @param controlName
   */
  getErrorMessage(controlName: keyof IcourseFormInput): string | null;

  storeAnnotation(
    courseId: number,
    input: IannotationInput
  ): Promise<Observable<IannotationsResponse>> 
}
