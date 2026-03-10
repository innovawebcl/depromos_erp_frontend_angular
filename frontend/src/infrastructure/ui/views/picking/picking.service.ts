import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@infra-env/environment';
import { Observable } from 'rxjs';
import type { PickingScanResponse } from './picking.models';
import type { Order } from '../orders/orders.models';

@Injectable({ providedIn: 'root' })
export class PickingService {
  private base = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  getOrder(orderId: number): Observable<Order> {
    return this.http.get<Order>(`${this.base}/orders/${orderId}`);
  }

  scan(orderId: number, code: string): Observable<PickingScanResponse> {
    return this.http.post<PickingScanResponse>(
      `${this.base}/orders/${orderId}/picking/scan`,
      { code }
    );
  }

  close(orderId: number): Observable<Order> {
    return this.http.post<Order>(
      `${this.base}/orders/${orderId}/picking/close`,
      {}
    );
  }
}
