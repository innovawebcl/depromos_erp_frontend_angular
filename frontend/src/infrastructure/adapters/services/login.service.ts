import type { IloginFormInput, ILoginService } from '@core-services/login';
import type { ISessionResponse } from '@core-ports/outputs/session';
import type {
  IForgotPasswordInput,
  ILoginInput,
} from '@core-ports/inputs/login';
import type { ErrorMessage, StringOrNull } from '@core-interfaces/global';

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { map, Observable, throwError, BehaviorSubject } from 'rxjs';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { environment } from '@infra-env/environment';
import { finalize, catchError } from 'rxjs/operators'; // map?

@Injectable({
  providedIn: 'root',
})
export class ManagerLogin implements ILoginService {
  private readonly LOGIN_API_URL = `${environment.apiUrl}`;
  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  public isLoading: Observable<boolean> = this.isLoadingSubject.asObservable();

  errorMessages: ErrorMessage = {
    username: {
      required: 'El nombre de usuario es requerido.',
      minlength: 'El nombre de usuario debe tener al menos 4 caracteres.',
      serverError: 'El usuario es incorrecto.',
    },
    password: {
      required: 'La contraseña es requerida.',
      minlength: 'La contraseña debe tener al menos 6 caracteres.',
      serverError: 'La contraseña es incorrecta.',
    },
  };

  loginForm: FormGroup<IloginFormInput>;

  constructor(private http: HttpClient) {
    this.loginForm = new FormGroup<IloginFormInput>({
      password: new FormControl<StringOrNull>(null, {
        validators: [Validators.required, Validators.minLength(6)],
      }),
      username: new FormControl<StringOrNull>(null, {
        validators: [Validators.required, Validators.minLength(4)],
      }),
    });
  }

  async loginRequest(
    FormLogin: ILoginInput
  ): Promise<Observable<ISessionResponse>> {
    this.isLoadingSubject.next(true);
    return this.http
      .post<ISessionResponse>(`${this.LOGIN_API_URL}/login`, FormLogin)
      .pipe(
        map((response) => {
          if (response) {
            return response;
          } else {
            throw new Error('No se pudo obtener la sesión');
          }
        }),
        finalize(() => {
          this.isLoadingSubject.next(false);
        })      );
  }

  async forgotPasswordRequest(
    input: IForgotPasswordInput
  ): Promise<Observable<boolean>> {
    return this.http
      .post<boolean>(`${this.LOGIN_API_URL}/forgot-password`, input)
      .pipe(
        map((response) => {
          if (response) {
            return response;
          } else {
            throw new Error('No se pudo obtener la sesión');
          }
        })
      );
  }

  async validateCodeRequest(
    email: string,
    code: string
  ): Promise<Observable<ISessionResponse>> {
    return this.http
      .post<ISessionResponse>(`${this.LOGIN_API_URL}/validate-otp`, {
        email,
        otp: code,
      })
      .pipe(
        map((response) => {
          if (response) {
            return response;
          } else {
            throw new Error('No se pudo obtener la sesión');
          }
        })
      );
  }

  async resetPasswordRequest(password: string): Promise<Observable<ISessionResponse>> {
    return this.http
      .post<ISessionResponse>(`${this.LOGIN_API_URL}/reset-password`, {
        password,
      })
      .pipe(
        map((response) => {
          if (response) {
            return response;
          } else {
            throw new Error('No se pudo obtener la sesión');
          }
        })
      );
  }

  getErrorMessage(controlName: keyof IloginFormInput): string | null {
    const inputControl = this.loginForm.get(controlName);
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
}
