// * Complemento de tipados con framework
import type { Observable } from 'rxjs';
import type { FormControl } from '@angular/forms';

import type {
  ErrorMessage,
  StringOrNull,
  NumberOrNull,
} from '@core-interfaces/global';
import type {
  IinstitutionsResponse,
  IinstitutionResponse,
} from '@core-ports/outputs/institution';

import type {
  IinstitutionInput,
  InstitutionsArgs,
} from '@core-ports/inputs/institution';
import {
  AnnotationLevelArgs,
  IInstitutionAnnotationLevelInput,
} from '@core-ports/inputs/annotationLevel';
import { IinstitutionAnnotationLevelResponse, IinstitutionAnnotationLevelsResponse } from '@core-ports/outputs/annotationLevel';

export interface IInstitutionFormInput
  extends Omit<IinstitutionInput, InstitutionsArgs> {
  name: FormControl<StringOrNull>;
  address: FormControl<StringOrNull>;
  deadline_for_closing_a_complaint: FormControl<NumberOrNull>;
  amount_of_negative_annotations: FormControl<NumberOrNull>;
  logo: FormControl<File | string | null>;
}

export interface IAnnotationLevelFormInput
  extends Omit<IInstitutionAnnotationLevelInput, AnnotationLevelArgs> {
  annotation_level: FormControl<StringOrNull>;
  custom_label: FormControl<StringOrNull>;
}

export interface IinstitutionService {
  /**
   * * Define la estructura de errores para la interpretación del formulario en pantalla
   */
  readonly errorMessages: ErrorMessage;

  /**
   * * Solicitud para cargar listado de instituciones, es requerido rol SuperAdministrador o Administrador
   */
  loadInstitutions(): Promise<Observable<IinstitutionsResponse>>;
  /**
   * * Solicitud para cargar institución mediante ID, es requerido rol SuperAdministrador o Administrador
   */
  loadInstitutionByID(id: number): Promise<Observable<IinstitutionResponse>>;

  /**
   * * Solicitud para crear nuevas instituciones, es requerido rol SuperAdministrador
   * @param input IinstitutionInput
   */
  storeInstitution(
    input: IinstitutionInput
  ): Promise<Observable<IinstitutionResponse>>;

  /**
   * * Solicitud para actualizar una institución por ID, es requerido rol SuperAdministrador Administrador
   * @param input IinstitutionInput
   * @param id identificador de institución
   */
  updateInstitution(
    input: IinstitutionInput,
    id: number
  ): Promise<Observable<IinstitutionResponse>>;

  /**
   * * Solicitud para eliminar una institución por ID, es requerido rol SuperAdministrador
   * @param id identificador de institución
   */
  deleteInstitution(id: number): Promise<Observable<boolean>>;

  /**
   * * Obtiene los posibles errores por claves de formulario
   * @param controlName
   */
  getErrorMessage(controlName: keyof IInstitutionFormInput): string | null;

  /**
   * Obtiene annotation level por ID
   */
  loadAnnotationLevelByID(
    id: number
  ): Promise<Observable<IinstitutionAnnotationLevelResponse>>;

  /**
   * Obtiene los annotation levels custom de la institución
   */
  loadAnnotationLevels(): Promise<
    Observable<IinstitutionAnnotationLevelsResponse>
  >;

  /**
   * * Solicitud para crear nuevos annotation levels, es requerido rol SuperAdministrador
   * @param input IInstitutionAnnotationLevelInput
   */
  storeAnnotationLevel(
    input: IInstitutionAnnotationLevelInput
  ): Promise<Observable<IinstitutionAnnotationLevelsResponse>>;

  /**
   * * Solicitud para actualizar un annotation level por ID, es requerido rol SuperAdministrador
   * @param input IInstitutionAnnotationLevelInput
   * @param id identificador de annotation level
   */
  updateAnnotationLevel(
    input: IInstitutionAnnotationLevelInput,
    id: number
  ): Promise<Observable<IinstitutionAnnotationLevelsResponse>>;

  /**
   * * Solicitud para eliminar un annotation level por ID, es requerido rol SuperAdministrador
   * @param id identificador de annotation level
   */
  deleteAnnotationLevel(id: number): Promise<Observable<boolean>>;

  /**
   * * Obtiene los posibles errores por claves de formulario
   * @param controlName
   */
  getAnnotationLevelErrorMessage(
    controlName: keyof IAnnotationLevelFormInput
  ): string | null;
}
