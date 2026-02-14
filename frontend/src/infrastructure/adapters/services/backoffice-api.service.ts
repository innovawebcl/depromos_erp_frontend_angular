import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '@infra-env/environment';
import { Observable } from 'rxjs';

/**
 * Cliente HTTP simple para el Backoffice.
 *
 * - Usa environment.apiUrl (ej: http://localhost:8000/api)
 * - Los interceptors actuales agregan Authorization Bearer.
 */
@Injectable({ providedIn: 'root' })
export class BackofficeApi {
  private readonly base = environment.apiUrl;

  constructor(private http: HttpClient) {}

  get<T>(path: string, query?: Record<string, any>): Observable<T> {
    let params = new HttpParams();
    if (query) {
      for (const [k, v] of Object.entries(query)) {
        if (v === undefined || v === null || v === '') continue;
        params = params.set(k, String(v));
      }
    }
    return this.http.get<T>(`${this.base}${path}`, { params });
  }

  post<T>(path: string, body: any): Observable<T> {
    return this.http.post<T>(`${this.base}${path}`, body);
  }

  put<T>(path: string, body: any): Observable<T> {
    return this.http.put<T>(`${this.base}${path}`, body);
  }

  patch<T>(path: string, body: any): Observable<T> {
    return this.http.patch<T>(`${this.base}${path}`, body);
  }

  delete<T>(path: string): Observable<T> {
    return this.http.delete<T>(`${this.base}${path}`);
  }
}
