import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@infra-env/environment';
import { Observable } from 'rxjs';
import type { ModuleDef, RoleRow, RoleUpsert } from './roles.models';

@Injectable({ providedIn: 'root' })
export class RolesService {
  private base = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  list(): Observable<RoleRow[]> {
    return this.http.get<RoleRow[]>(`${this.base}/roles`);
  }

  get(id: number): Observable<RoleRow> {
    return this.http.get<RoleRow>(`${this.base}/roles/${id}`);
  }

  create(payload: RoleUpsert): Observable<RoleRow> {
    return this.http.post<RoleRow>(`${this.base}/roles`, payload);
  }

  update(id: number, payload: RoleUpsert): Observable<RoleRow> {
    return this.http.put<RoleRow>(`${this.base}/roles/${id}`, payload);
  }

  modules(): Observable<ModuleDef[]> {
    return this.http.get<ModuleDef[]>(`${this.base}/modules`);
  }

  setRoleModules(id: number, modules: Record<string, boolean>): Observable<RoleRow> {
    return this.http.put<RoleRow>(`${this.base}/roles/${id}/modules`, { modules });
  }
}
