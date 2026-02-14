import type { IForgotPasswordInput, ILoginInput } from '@core-ports/inputs/login';
import type { ISessionResponse } from '@core-ports/outputs/session';
import type { ErrorMessage, StringOrNull } from '@core-interfaces/global';

// * Complemento de tipados con framework
import type { Observable } from 'rxjs';
import type { FormControl, FormGroup } from '@angular/forms';

export interface IloginFormInput
  extends Omit<ILoginInput, 'username' | 'password'> {
  username: FormControl<StringOrNull>;
  password: FormControl<StringOrNull>;
}

export interface ILoginService {
  /**
   * * Define la estructura de errores para la interpretación del formulario en pantalla
   */
  readonly errorMessages: ErrorMessage;
  /**
   * * Solicitud para la generación de token JWT
   * @param input
   */
  loginRequest(input: ILoginInput): Promise<Observable<ISessionResponse>>;

  /**
   * * Solicitud para obtener un código de recuperación de contraseña
   */
  forgotPasswordRequest(input: IForgotPasswordInput): Promise<Observable<boolean>>;

  /**
   * Solicita la validación de un código de recuperación
   */
  validateCodeRequest(email: string, code: string): Promise<Observable<ISessionResponse>>;

  /**
   * * Solicitud para la actualización de contraseña
   */
  resetPasswordRequest(password: string): Promise<Observable<ISessionResponse>>;

  /**
   * * Control de formulario para la pantalla de inicio de sesión
   */
  loginForm: FormGroup<IloginFormInput>;
  /**
   * * Obtiene los posibles errores por claves de formulario
   * @param controlName
   */
  getErrorMessage(controlName: keyof IloginFormInput): string | null;
}
