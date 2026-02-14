import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IuserService } from '@core-interfaces/services/user';
import { IcomplaintsResponse } from '@core-ports/outputs/complaint';
import { IuserProfileResponse } from '@core-ports/outputs/user';
import { environment } from '@infra-env/environment';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserManager implements IuserService {
  private readonly USER_API_URL = `${environment.apiUrl}/user`;

  constructor(private http: HttpClient) {}

  async loadUserByID(id: number): Promise<Observable<IuserProfileResponse>> {
    return this.http
      .get<IuserProfileResponse>(`${this.USER_API_URL}/${id}`)
      .pipe(
        map((response) => {
          if (response) {
            return response;
          } else {
            throw new Error('No se pudo obtener profesor mediante ID');
          }
        })
      );
  }

  async getComplaintsByUserID(
    id: number
  ): Promise<Observable<IcomplaintsResponse>> {
    return this.http
      .get<IcomplaintsResponse>(`${this.USER_API_URL}/${id}/complaints`)
      .pipe(
        map((response) => {
          if (response) {
            return response;
          } else {
            throw new Error('No se pudo obtener listado de denuncias');
          }
        })
      );
  }
}
