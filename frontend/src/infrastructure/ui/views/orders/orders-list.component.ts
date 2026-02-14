import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { debounceTime, distinctUntilChanged, Subject, switchMap } from 'rxjs';
import { OrdersService } from './orders.service';
import type { Order, OrderStatus, Paginated } from './orders.models';

@Component({
  selector: 'app-orders-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './orders-list.component.html',
})
export class OrdersListComponent implements OnInit {
  loading = false;
  status: OrderStatus | 'all' = 'all';
  search = '';
  page = 1;
  per_page = 20;

  data: Paginated<Order> = { data: [] };

  private search$ = new Subject<void>();

  constructor(private orders: OrdersService) {}

  ngOnInit(): void {
    this.search$
      .pipe(
        debounceTime(250),
        distinctUntilChanged(),
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

  statusBadge(status: string): string {
    switch (status) {
      case 'pending':
        return 'secondary';
      case 'picking':
        return 'warning';
      case 'ready':
        return 'info';
      case 'en_route':
        return 'primary';
      case 'delivered':
        return 'success';
      case 'cancelled':
        return 'danger';
      default:
        return 'secondary';
    }
  }
}
