import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { map, Observable } from 'rxjs';
import { environment } from '@infra-env/environment';

import { type FormGroup, FormBuilder, Validators } from '@angular/forms';

import type {
  ErrorMessage,
  StringOrNull,
  DateOrNull,
  NumberOrNull,
} from '@core-interfaces/global';

import type {
  IAdministratorResponse,
  IAdministratorsResponse,
  IsuperAdminDashboardResponse,
  IuserDashboardResponse,
} from '@core-ports/outputs/user';

import type { IuserInput } from '@core-ports/inputs/user';

import type {
  IAdministratorService,
  IAdministratorFormInput,
} from '@core-interfaces/services/administrator';

@Injectable({
  providedIn: 'root',
})
export class administratorManager implements IAdministratorService {
  private readonly USER_API_URL = `${environment.apiUrl}/user`;

  readonly errorMessages: ErrorMessage = {
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
      required: 'El nombre del administrador es requerido.',
      serverError: '',
    },
    last_name: {
      required: 'El apellido del administrador es requerido.',
      serverError: '',
    },
    email: {
      required: 'Dirección de correo es requerido.',
      email: 'Dirección de correo debe ser valida.',
      serverError: '',
    },
    rut: {
      required: 'Rut de administrador es requerido.',
      serverError: '',
    },
    birth_date: {
      required: 'Fecha de nacimiento del administrador es requerido.',
      serverError: '',
    },
    role: {
      required: 'Rol de usuario es requerido.',
      serverError: '',
    },
    admin_role: {
      required: 'Rol de administrador es requerido.',
      serverError: '',
    },
  };

  adminForm: FormGroup<IAdministratorFormInput>;

  constructor(private http: HttpClient, private fb: FormBuilder) {
    this.adminForm = this.fb.group<IAdministratorFormInput>({
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
      admin_role: this.fb.control<StringOrNull>(null, {
        validators: [Validators.required],
      }),
      role: this.fb.control<StringOrNull>(null, {
        validators: [Validators.required],
      }),
    });
  }

  async loadAdministrators(): Promise<Observable<IAdministratorsResponse>> {
    return this.http
      .get<IAdministratorsResponse>(`${this.USER_API_URL}/admin`)
      .pipe(
        map((response) => {
          if (response) {
            return response;
          } else {
            throw new Error('No se pudo obtener listado de administradores');
          }
        })
      );
  }

  async loadSuperAdministrators(): Promise<
    Observable<IAdministratorsResponse>
  > {
    return this.http
      .get<IAdministratorsResponse>(`${this.USER_API_URL}/superadmin`)
      .pipe(
        map((response) => {
          if (response) {
            return response;
          } else {
            throw new Error('No se pudo obtener listado de administradores');
          }
        })
      );
  }

  async loadAdministratorByID(
    id: number
  ): Promise<Observable<IAdministratorResponse>> {
    return this.http
      .get<IAdministratorResponse>(`${this.USER_API_URL}/${id}`)
      .pipe(
        map((response) => {
          if (response) {
            return response;
          } else {
            throw new Error('No se pudo obtener administrador mediante ID');
          }
        })
      );
  }

  async loadDashboard(): Promise<Observable<IuserDashboardResponse>> {
    return this.http
      .get<IuserDashboardResponse>(`${this.USER_API_URL}/dashboard`)
      .pipe(
        map((response) => {
          if (response) {
            return response;
          } else {
            throw new Error('No se pudo obtener administrador mediante ID');
          }
        })
      );
  }

  async loadSuperAdminDashBoard(): Promise<
    Observable<IsuperAdminDashboardResponse>
  > {
    return this.http
      .get<IsuperAdminDashboardResponse>(
        `${this.USER_API_URL}/superadmin/dashboard`
      )
      .pipe(
        map((response) => {
          if (response) {
            return response;
          } else {
            throw new Error('No se pudo obtener administrador mediante ID');
          }
        })
      );
  }

  async storeAdmin(
    input: IuserInput
  ): Promise<Observable<IAdministratorResponse>> {
    return this.http
      .post<IAdministratorResponse>(this.USER_API_URL, input)
      .pipe(
        map((response) => {
          if (response) {
            return response;
          } else {
            throw new Error('No se pudo crear administrador');
          }
        })
      );
  }

  async updateAdmin(
    input: IuserInput,
    id: number
  ): Promise<Observable<IAdministratorResponse>> {
    return this.http
      .put<IAdministratorResponse>(`${this.USER_API_URL}/${id}`, input)
      .pipe(
        map((response) => {
          if (response) {
            return response;
          } else {
            throw new Error('No se pudo actualizar adminsitrador');
          }
        })
      );
  }

  async deleteAdmin(id: number): Promise<Observable<boolean>> {
    return this.http.delete(`${this.USER_API_URL}/${id}`).pipe(
      map((response) => {
        if (response) {
          return true;
        } else {
          throw new Error('No se pudo eliminar administrador');
        }
      })
    );
  }

  getErrorMessage(controlName: keyof IuserInput | string): string | null {
    const inputControl = this.adminForm.get(controlName);

    if (inputControl && inputControl.errors) {
      if (inputControl.errors['serverError']) {
        return inputControl.errors['serverError'];
      }
      // Recorremos otros errores configurados
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
      return null;
    }

    return null;
  }
}
