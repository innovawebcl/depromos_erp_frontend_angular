import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { debounceTime, Subject, switchMap } from 'rxjs';
import { OrdersService } from './orders.service';
import { environment } from '@infra-env/environment';
import type { Order, OrderStatus, Paginated } from './orders.models';

@Component({
  selector: 'app-orders-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './orders-list.component.html',
})
export class OrdersListComponent implements OnInit {
  loading = false;
  exporting = false;
  status: OrderStatus | 'all' = 'all';
  search = '';
  page = 1;
  per_page = 20;

  data: Paginated<Order> = { data: [] };

  private search$ = new Subject<void>();

  constructor(private orders: OrdersService, private http: HttpClient) {}

  ngOnInit(): void {
    this.search$
      .pipe(
        debounceTime(250),
        switchMap(() => {
          this.loading = true;
          return this.orders.list({
            status: this.status,
            search: this.search,
            page: this.page,
            per_page: this.per_page,
          });
        })
      )
      .subscribe({
        next: (res) => {
          this.data = res;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        },
      });

    this.reload();
  }

  reload(): void {
    this.search$.next();
  }

  setStatus(s: any): void {
    this.status = s;
    this.page = 1;
    this.reload();
  }

  nextPage(): void {
    if (!this.data.meta) return;
    if (this.data.meta.current_page >= this.data.meta.last_page) return;
    this.page += 1;
    this.reload();
  }

  prevPage(): void {
    if (this.page <= 1) return;
    this.page -= 1;
    this.reload();
  }

  /** Export orders as CSV/Excel with auth token via programmatic download */
  exportOrders(): void {
    this.exporting = true;
    this.http.get(`${environment.apiUrl}/orders/export`, {
      responseType: 'blob',
      params: {
        status: this.status !== 'all' ? this.status : '',
        search: this.search || '',
      }
    }).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `pedidos_${new Date().toISOString().slice(0, 10)}.xlsx`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.exporting = false;
      },
      error: () => {
        this.exporting = false;
        alert('Error al exportar pedidos');
      },
    });
  }

  statusBadge(status: string): string {
    switch (status) {
      case 'pending': return 'info text-white';
      case 'picking': return 'warning text-dark';
      case 'ready': return 'success';
      case 'en_route': return 'primary';
      case 'delivered': return 'success';
      case 'cancelled': return 'danger';
      default: return 'secondary';
    }
  }

  statusLabel(status: string): string {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'picking': return 'En picking';
      case 'ready': return 'Listo';
      case 'en_route': return 'En ruta';
      case 'delivered': return 'Entregado';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  }

  formatDate(d: string | null | undefined): string {
    if (!d) return '—';
    try {
      return new Date(d).toLocaleDateString('es-CL', {
        timeZone: 'America/Santiago',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch { return d; }
  }
}
