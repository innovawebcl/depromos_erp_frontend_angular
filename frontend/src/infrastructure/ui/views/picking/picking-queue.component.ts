import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { OrdersService } from '../orders/orders.service';
import type { Order } from '../orders/orders.models';

@Component({
  selector: 'app-picking-queue',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './picking-queue.component.html',
})
export class PickingQueueComponent implements OnInit {
  loading = false;
  orders: Order[] = [];

  constructor(private ordersService: OrdersService) {}

  ngOnInit(): void {
    this.reload();
  }

  reload(): void {
    this.loading = true;
    forkJoin({
      pending: this.ordersService.list({ status: 'pending', per_page: 50, page: 1 }),
      picking: this.ordersService.list({ status: 'picking', per_page: 50, page: 1 }),
    }).subscribe({
      next: (res) => {
        const merged = [...(res.pending.data || []), ...(res.picking.data || [])];
        // orden por id desc
        this.orders = merged.sort((a, b) => (b.id || 0) - (a.id || 0));
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  statusBadge(status: string): string {
    switch (status) {
      case 'pending': return 'info';
      case 'picking': return 'warning';
      case 'ready': return 'info';
      default: return 'secondary';
    }
  }

  statusLabel(status: string): string {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'picking': return 'En picking';
      case 'ready': return 'Listo';
      default: return status;
    }
  }
}
