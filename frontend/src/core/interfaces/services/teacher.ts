import type {
  StringOrNull,
  NumberOrNull,
  DateOrNull,
  BoolOrNull,
  ErrorMessage,
} from '@core-interfaces/global';
import type { IteacherInput, TeacherArgs } from '@core-ports/inputs/teacher';
import type {
  IteachersResponse,
  IteacherResponse,
} from '@core-ports/outputs/teacher';

/** Complementos de interfaz del core de angular */
import type { FormArray, FormControl, FormGroup } from '@angular/forms';
import type { Observable } from 'rxjs';

export interface ICourseTeachersForm {
  course_id: FormControl<NumberOrNull>;
  is_substitute: FormControl<BoolOrNull>;
  role: FormControl<StringOrNull>;
}

export interface ITeacherFormInput extends Omit<IteacherInput, TeacherArgs> {
  username: FormControl<StringOrNull>;
  password: FormControl<StringOrNull>;
  first_name: FormControl<StringOrNull>;
  last_name: FormControl<StringOrNull>;
  email: FormControl<StringOrNull>;
  rut: FormControl<StringOrNull>;
  birth_date: FormControl<DateOrNull>;
  subject_specialty: FormControl<StringOrNull>;
  courses: FormArray<FormGroup<ICourseTeachersForm>>;
}

export interface IteacherService {
  /**
   * * Define la estructura de errores para la interpretación del formulario en pantalla
   */
  readonly errorMessages: ErrorMessage;

  /**
   * * Solicitud para cargar listado de profesores, es requerido rol SuperAdministrador o Administrador
   */
  loadTeachers(): Promise<Observable<IteachersResponse>>;
  /**
   * * Solicitud para cargar profesor mediante ID, es requerido rol SuperAdministrador o Administrador
   */
  loadTeacherByID(id: number): Promise<Observable<IteacherResponse>>;

  loadTeacherMe(): Promise<Observable<IteacherResponse>>

  /**
   * * Solicitud para crear nuevos profesores, es requerido rol SuperAdministrador o Administrador
   * @param input IteacherInput
   */
  storeTeacher(input: IteacherInput): Promise<Observable<IteacherResponse>>;

  /**
   * * Solicitud para actualizar un profesor por ID, es requerido rol SuperAdministrador o Administrador
   * @param input IteacherInput
   * @param id identificador de profesor
   */
  updateTeacher(
    input: IteacherInput,
    id: number
  ): Promise<Observable<IteacherResponse>>;

  /**
   * * Solicitud para eliminar un profesor por ID, es requerido rol SuperAdministrador o Administrador
   * @param id identificador de profesor
   */
  deleteTeacher(id: number): Promise<Observable<boolean>>;

  /**
   * * Obtiene los posibles errores por claves de formulario
   * @param controlName
   */
  getErrorMessage(controlName: keyof ITeacherFormInput): string | null;

  /**
   * * Obtiene los posibles errores por claves de formulario
   * @param index
   * @param controlName
   */
  getCourseErrorMessage(
    index: number,
    controlName: keyof ICourseTeachersForm | string
  ): string | null;

  generateExcelFile(): Promise<void>;

  uploadFile(file: File): Promise<Observable<any>>;
}
