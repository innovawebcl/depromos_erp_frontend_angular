import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '@infra-env/environment';
import { Observable } from 'rxjs';
import type { Paginated, RoleSummary, UserDetail, UserRow, UserUpsert } from './users.models';

@Injectable({ providedIn: 'root' })
export class UsersService {
  private base = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  list(params?: {
    search?: string;
    role_id?: number | 'all';
    active?: boolean | 'all';
    page?: number;
    per_page?: number;
  }): Observable<Paginated<UserRow>> {
    let p = new HttpParams();
    if (params?.search) p = p.set('search', params.search);
    if (params?.role_id && params.role_id !== 'all') p = p.set('role_id', String(params.role_id));
    if (params?.active !== undefined && params.active !== 'all') p = p.set('active', params.active ? '1' : '0');
    if (params?.page) p = p.set('page', String(params.page));
    if (params?.per_page) p = p.set('per_page', String(params.per_page));
    return this.http.get<Paginated<UserRow>>(`${this.base}/users`, { params: p });
  }

  get(id: number): Observable<UserDetail> {
    return this.http.get<UserDetail>(`${this.base}/users/${id}`);
  }

  create(payload: UserUpsert): Observable<UserDetail> {
    return this.http.post<UserDetail>(`${this.base}/users`, payload);
  }

  update(id: number, payload: UserUpsert): Observable<UserDetail> {
    return this.http.put<UserDetail>(`${this.base}/users/${id}`, payload);
  }

  toggleActive(id: number): Observable<UserDetail> {
    return this.http.patch<UserDetail>(`${this.base}/users/${id}/toggle-active`, {});
  }

  roles(): Observable<RoleSummary[]> {
    return this.http.get<RoleSummary[]>(`${this.base}/roles`);
  }
}
