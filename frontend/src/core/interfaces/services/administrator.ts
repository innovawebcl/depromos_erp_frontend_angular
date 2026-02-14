import type {
  StringOrNull,
  NumberOrNull,
  DateOrNull,
  ErrorMessage,
} from '@core-interfaces/global';
import type { IuserInput, UserArgs } from '@core-ports/inputs/user';
import type {
  IAdministratorResponse,
  IAdministratorsResponse,
  IsuperAdminDashboardResponse,
  IuserDashboardResponse,
} from '@core-ports/outputs/user';

/** Complementos de interfaz del core de angular */
import type { FormControl } from '@angular/forms';
import type { Observable } from 'rxjs';

export interface IAdministratorFormInput extends Omit<IuserInput, UserArgs> {
  username: FormControl<StringOrNull>;
  password: FormControl<StringOrNull>;
  first_name: FormControl<StringOrNull>;
  last_name: FormControl<StringOrNull>;
  email: FormControl<StringOrNull>;
  rut: FormControl<StringOrNull>;
  birth_date: FormControl<DateOrNull>;
  role: FormControl<StringOrNull>;
  admin_role: FormControl<StringOrNull>;
}

export interface IAdministratorService {
  /**
   * * Define la estructura de errores para la interpretación del formulario en pantalla
   */
  readonly errorMessages: ErrorMessage;
  /**
   * * Solicitud para cargar listado de adminsitradores, es requerido rol SuperAdministrador o Administrador
   */
  loadAdministrators(): Promise<Observable<IAdministratorsResponse>>;
  /**
   * * Solicitud para cargar listado de adminsitradores, es requerido rol SuperAdministrador o Administrador
   */
  loadSuperAdministrators(): Promise<Observable<IAdministratorsResponse>>;
  /**
   * * Solicitud para cargar profesor mediante ID, es requerido rol SuperAdministrador o Administrador
   */
  loadAdministratorByID(
    id: number
  ): Promise<Observable<IAdministratorResponse>>;

  /**
   * * Solicitud para crear nuevos adminsitradores, es requerido rol SuperAdministrador o Administrador
   * @param input IuserInput
   */
  storeAdmin(input: IuserInput): Promise<Observable<IAdministratorResponse>>;

  /**
   * * Solicitud para actualizar un profesor por ID, es requerido rol SuperAdministrador o Administrador
   * @param input IuserInput
   * @param id identificador de profesor
   */
  updateAdmin(
    input: IuserInput,
    id: number
  ): Promise<Observable<IAdministratorResponse>>;

  /**
   * * Solicitud para eliminar un administrador por ID, es requerido rol SuperAdministrador o Administrador
   * @param id identificador de adminisrador
   */
  deleteAdmin(id: number): Promise<Observable<boolean>>;

  /**
   * * Obtiene los posibles errores por claves de formulario
   * @param controlName
   */
  getErrorMessage(controlName: keyof IAdministratorFormInput): string | null;

  loadDashboard(): Promise<Observable<IuserDashboardResponse>>;

  loadSuperAdminDashBoard(): Promise<Observable<IsuperAdminDashboardResponse>>;
}
