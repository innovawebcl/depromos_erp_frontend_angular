import type {
  StringOrNull,
  NumberOrNull,
  DateOrNull,
  ErrorMessage,
} from '@core-interfaces/global';
import type { IstudentInput, StudentArgs } from '@core-ports/inputs/student';
import type {
  IstudentResponse,
  IstudentsResponse,
} from '@core-ports/outputs/student';

/** Complementos de interfaz del core de angular */
import type { FormArray, FormControl, FormGroup } from '@angular/forms';
import type { Observable } from 'rxjs';
import type { Iguardian, GuardianArgs } from '@core-ports/inputs/guardian';
import { IannotationResponse } from '@core-ports/outputs/annotation';
import {
  IannotationInput,
  AnnotationArgs,
} from '@core-ports/inputs/annotation';
import { IInterviewInput, InterviewArgs } from '@core-ports/inputs/interview';
import { IinterviewResponse } from '@core-ports/outputs/interview';

export interface ICourseStudentsForm {
  course_id: FormControl<NumberOrNull>;
}

export interface IGuardianStudentForm extends Omit<Iguardian, GuardianArgs> {
  email: FormControl<StringOrNull>;
  phone: FormControl<StringOrNull>;
  name: FormControl<StringOrNull>;
  last_name: FormControl<StringOrNull>;
  kinship: FormControl<StringOrNull>;
}

export interface IStudentFormInput extends Omit<IstudentInput, StudentArgs> {
  username: FormControl<StringOrNull>;
  password: FormControl<StringOrNull>;
  first_name: FormControl<StringOrNull>;
  second_name: FormControl<StringOrNull>;
  last_name: FormControl<StringOrNull>;
  second_last_name: FormControl<StringOrNull>;
  email: FormControl<StringOrNull>;
  rut: FormControl<StringOrNull>;
  birth_date: FormControl<DateOrNull>;
  years_in_school: FormControl<NumberOrNull>;
  people_living_with: FormControl<Array<string> | null>;
  number_of_siblings: FormControl<NumberOrNull>;
  medical_diagnosis: FormControl<StringOrNull>;
  repeated_courses: FormControl<Array<string> | null>;
  address: FormControl<StringOrNull>;
  guardians: FormArray<FormGroup<IGuardianStudentForm>>;
  courses: FormArray<FormGroup<ICourseStudentsForm>>;
}

export interface IAnnotationStudentForm
  extends Omit<IannotationInput, AnnotationArgs> {
  observation: FormControl<StringOrNull>;
  type: FormControl<StringOrNull>;
  subcategory: FormControl<number | null>; 
}

export interface IInterviewForm
extends Omit<IInterviewInput, InterviewArgs> {
  interview_date: FormControl<DateOrNull>;
  reason: FormControl<StringOrNull>;
  records: FormControl<StringOrNull>;
  comments: FormControl<StringOrNull>;
  agreements: FormControl<StringOrNull>;
}

export interface IstudentService {
  /**
   * * Define la estructura de errores para la interpretación del formulario en pantalla
   */
  readonly errorMessages: ErrorMessage;

  /**
   * * Define la estructura de errores para la interpretación del formulario de anotaciones en pantalla
   */
  readonly errorMessagesAnnotation: ErrorMessage;

  /**
   * * Define la estructura de errores para la interpretación del formulario de entrevistas en pantalla
   */
  readonly errorMessagesInterview: ErrorMessage;

  /**
   * * Solicitud para cargar listado de estudiantes, es requerido rol SuperAdministrador o Administrador
   */
  loadStudents(): Promise<Observable<IstudentsResponse>>;
  /**
   * * Solicitud para cargar estudiantes mediante ID, es requerido rol SuperAdministrador o Administrador
   */
  loadStudentByID(id: number): Promise<Observable<IstudentResponse>>;

  loadStudentMe(): Promise<Observable<IstudentResponse>>

  /**
   * * Solicitud para crear nuevos estudiantes, es requerido rol SuperAdministrador o Administrador
   *
   * @param input IstudentInput
   */
  storeStudent(input: IstudentInput): Promise<Observable<IstudentResponse>>;

  /**
   * * Solicitud para actualizar un estudiante por ID, es requerido rol SuperAdministrador o Administrador
   *
   * @param input IstudentInput
   * @param id identificador de estudiante
   */
  updateStudent(
    input: IstudentInput,
    id: number
  ): Promise<Observable<IstudentResponse>>;

  /**
   * * Solicitud para eliminar un estudiante por ID, es requerido rol SuperAdministrador o Administrador
   *
   * @param id identificador de estudiante
   */
  deleteStudent(id: number): Promise<Observable<boolean>>;

  /**
   * * Obtiene los posibles errores por claves de formulario
   *
   * @param controlName
   */
  getErrorMessage(controlName: keyof IStudentFormInput): string | null;

  /**
   * * Obtiene los posibles errores por claves de formulario
   * @param index
   * @param controlName
   */
  getGuardianErrorMessage(
    index: number,
    controlName: keyof IGuardianStudentForm | string
  ): string | null;

  /**
   * * Obtiene los posibles errores por claves de formulario
   * @param index
   * @param controlName
   */
  getCourseErrorMessage(
    index: number,
    controlName: keyof ICourseStudentsForm | string
  ): string | null;

  /**
   * * Obtiene plantilla de excel en binario
   */
  generateExcelFile(): Promise<void>;

  /**
   * * Solicitud para crear nuevos estudiantes, es requerido rol Teacher
   *
   * @param studentId identificador de estudiante
   * @param input IannotationInput
   */
  storeAnnotation(
    studentId: number,
    input: IannotationInput
  ): Promise<Observable<IannotationResponse>>;


  /**
   * * Solicitud para crear una entrevista
   *
   * @param studentId identificador de estudiante
   * @param input IInterviewInput
   */
  storeInterview(
    studentId: number,
    input: IInterviewInput
  ): Promise<Observable<IinterviewResponse>>;

  /**
   * Obtiene una entrevista por id
   */
  loadInterviewById(
    id: number
  ): Promise<Observable<IinterviewResponse>>;
}
