import type { IcomplaintsResponse } from '@core-ports/outputs/complaint';
import type { IuserProfileResponse } from '@core-ports/outputs/user';
import type { Observable } from 'rxjs';

export interface IuserService {
  /**
   * * Solicitud para cargar usuario por id
   */
  loadUserByID(id: number): Promise<Observable<IuserProfileResponse>>;

  /**
   * * Consulta listado de denuncias por id de usuario
   *
   * @param id de usuario
   * @return Promise<Observable<IcomplaintsResponse>> listado de denuncias por id de usuario
   */
  getComplaintsByUserID(id: number): Promise<Observable<IcomplaintsResponse>>;
}
