import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '@infra-environments/environment';
import { Observable } from 'rxjs';
import type { Order, Paginated, OrderStatus } from './orders.models';

@Injectable({ providedIn: 'root' })
export class OrdersService {
  private base = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  list(params?: {
    status?: OrderStatus | 'all';
    search?: string;
    page?: number;
    per_page?: number;
  }): Observable<Paginated<Order>> {
    let p = new HttpParams();
    if (params?.status && params.status !== 'all') p = p.set('status', params.status);
    if (params?.search) p = p.set('search', params.search);
    if (params?.page) p = p.set('page', params.page);
    if (params?.per_page) p = p.set('per_page', params.per_page);
    return this.http.get<Paginated<Order>>(`${this.base}/orders`, { params: p });
  }

  get(id: number): Observable<Order> {
    return this.http.get<Order>(`${this.base}/orders/${id}`);
  }

  assignCourier(id: number, courier_id: number): Observable<Order> {
    return this.http.patch<Order>(`${this.base}/orders/${id}/assign-courier`, { courier_id });
  }

  markEnRoute(id: number, eta_minutes: number): Observable<Order> {
    return this.http.patch<Order>(`${this.base}/orders/${id}/en-route`, { eta_minutes });
  }

  markDelivered(id: number, payload: { receiver_rut?: string | null; delivery_photo_url?: string | null }): Observable<Order> {
    return this.http.patch<Order>(`${this.base}/orders/${id}/delivered`, payload);
  }
}
