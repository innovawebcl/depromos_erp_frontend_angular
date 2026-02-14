import type {
  StringOrNull,
  NumberOrNull,
  ErrorMessage,
  BoolOrNull,
} from '@core-interfaces/global';

import type {
  IsociogramInput,
  sociogramArgs,
  questionArgs,
  IquestionInput,
  coursesToSociogramArgs,
  institutionsToSociogramArgs,
  IcoursesToSociogramInput,
  IinstitutionsToSociogramInput,
} from '@core-ports/inputs/sociogram';

import type {
  IsociogramResponses,
  IsociogramResponse,
  IsociogramOptionsResponses,
  IsociogramRulesResponses,
  IsociogramAnswerResponses,
  IcoursesToSociogramResponse,
  IreportSociogramResponse,
  IinstitutionsToSociogramResponse,
} from '@core-ports/outputs/sociograms';

/** Complementos de interfaz del core de angular */
import type { FormArray, FormControl, FormGroup } from '@angular/forms';
import type { Observable } from 'rxjs';

export interface IquestionForm extends Omit<IquestionInput, questionArgs> {
  title: FormControl<StringOrNull>;
  is_multiple_choice: FormControl<BoolOrNull>;
  rules: FormControl<StringOrNull>;
  enum_as_options: FormControl<StringOrNull>;
}

export interface IcoursesSociogramForm {
  course_id: FormControl<NumberOrNull>;
  title: FormControl<StringOrNull>;
}
export interface IinstitutionsSociogramForm {
  institution_id: FormControl<NumberOrNull>;
  title: FormControl<StringOrNull>;
}

export interface IsociogramFormInput
  extends Omit<IsociogramInput, sociogramArgs> {
  title: FormControl<StringOrNull>;
  version: FormControl<NumberOrNull>;
  questions: FormArray<FormGroup<IquestionForm>>;
}

export interface IcoursesToSociogramForm
  extends Omit<IcoursesToSociogramInput, coursesToSociogramArgs> {
  sociogram_id: FormControl<NumberOrNull>;
  title: FormControl<StringOrNull>;
  courses: FormArray<FormGroup<IcoursesSociogramForm>>;
}

export interface IinstitutionToSociogramForm
  extends Omit<IinstitutionsToSociogramInput, institutionsToSociogramArgs> {
  sociogram_id: FormControl<NumberOrNull>;
  title: FormControl<StringOrNull>;
  institutions: FormArray<FormGroup<IinstitutionsSociogramForm>>;
}

export interface IsociogramService {
  /**
   * * Define la estructura de errores para la interpretación del formulario en pantalla
   */
  readonly errorMessages: ErrorMessage;

  /**
   * * Solicitud para cargar listado de sociogramas, es requerido rol SuperAdministrador o Administrador
   */
  loadSociograms(): Promise<Observable<IsociogramResponses>>;
  /**
   * * Solicitud para cargar sociogramas mediante ID, es requerido rol SuperAdministrador o Administrador
   */
  loadSociogramByID(id: number): Promise<Observable<IsociogramResponse>>;

  /**
   * * Solicitud para crear nuevos sociogramas, es requerido rol SuperAdministrador o Administrador
   *
   * @param input IsociogramInput
   */
  storeSociogram(
    input: IsociogramInput
  ): Promise<Observable<IsociogramResponse>>;

  /**
   * * Solicitud para actualizar un sociograma por ID, es requerido rol SuperAdministrador o Administrador
   *
   * @param input IsociogramInput
   * @param id identificador de sociograma
   */
  updateSociogram(
    input: IsociogramInput,
    id: number
  ): Promise<Observable<IsociogramResponse>>;

  /**
   * * Solicitud para eliminar un sociograma por ID, es requerido rol SuperAdministrador o Administrador
   *
   * @param id identificador de sociograma
   */
  deleteSociogram(id: number): Promise<Observable<boolean>>;

  /**
   * * Obtiene los posibles errores por claves de formulario
   *
   * @param controlName
   */
  getErrorMessage(controlName: keyof IsociogramFormInput): string | null;

  /**
   * Obtiene los posibles errores por claves de formulario
   *
   * @param index
   * @param controlName
   *
   * @return retorna texto (string) descriptivo del error o null en caso de no encontrar errores
   */
  getQuestionErrorMessage(
    index: number,
    controlName: keyof IquestionForm | string
  ): string | null;

  /**
   *  Procesa solicitud http para cargar listado de respuestas a preguntas de un sociograma
   *
   * @return Observable IsociogramAnswerResponses
   */
  getTypeAnswers(): Observable<IsociogramAnswerResponses>;
  /**
   * Procesa solicitud http para cargar reglas para crear preguntas de un sociograma
   *
   *  @return Observable IsociogramRulesResponses
   */
  getRules(): Observable<IsociogramRulesResponses>;
  /**
   * Procesa solicitud http para listar las posibles opciones de un sociograma
   *
   * @return Observable IsociogramOptionsResponses
   */
  getSociogramsOptions(): Observable<IsociogramOptionsResponses>;

  /**
   * Procesa solicitud http para obtener listado de cursos por id de sociograma
   *
   * @param number sociogram_id
   *
   * @return Observable IcoursesToSociogramResponse
   */
  getCoursesToSociogram(
    sociogram_id: number
  ): Observable<IcoursesToSociogramResponse>;

  /**
   * Procesa solicitud http para obtener reporte de sociograma por id de curso y id de sociograma
   *
   * @param number sociogram_id
   * @param number course_id
   *
   * @return Observable IreportSociogramResponse
   */
  getReportBySociogramIdAndCourseID(
    sociogram_id: number,
    course_id: number
  ): Observable<IreportSociogramResponse>;

  /**
   * Procesa solicitud http para asociar cursos a un sociograma
   *
   * @param IcoursesToSociogramInput
   *
   * @return Observable IcoursesToSociogramResponse
   */
  registerOrUpdateCoursesToSociogram(
    input: IcoursesToSociogramInput
  ): Observable<IcoursesToSociogramResponse>;

  /**
   * Procesa solicitud http para obtener listado de instituciones por id de sociograma
   *
   * @param number sociogram_id
   *
   * @return Observable IinstitutionsToSociogramResponse
   */
  getInstitutionsToSociogram(
    sociogram_id: number
  ): Observable<IinstitutionsToSociogramResponse>;

  /**
   * Procesa solicitud http para asociar institutiones a un sociograma
   *
   * @param IinstitutionsToSociogramInput
   *
   * @return Observable IinstitutionsToSociogramResponse
   */
  registerOrUpdateInstitutionsToSociogram(
    input: IinstitutionsToSociogramInput
  ): Observable<IinstitutionsToSociogramResponse>;

  /**
   * Procesa solicitud http para obtener listado de sociograma  por id de institución
   *
   * @return Observable IsociogramResponses
   */
  loadSociogramsByInstitutionID(): Promise<Observable<IsociogramResponses>>;
}
