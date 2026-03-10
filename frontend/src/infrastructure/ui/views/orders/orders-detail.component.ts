import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '@infra-environments/environment';
import { OrdersService } from './orders.service';
import type { Order } from './orders.models';

interface CourierMini {
  id: number;
  name: string;
  rating?: number | null;
}

@Component({
  selector: 'app-orders-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './orders-detail.component.html',
})
export class OrdersDetailComponent implements OnInit {
  loading = false;
  saving = false;
  order?: Order;
  couriers: CourierMini[] = [];

  courier_id?: number | null;
  eta_minutes: number = 30;
  receiver_rut: string = '';
  delivery_photo_url: string = '';

  constructor(
    private route: ActivatedRoute,
    private orders: OrdersService,
    private http: HttpClient,
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.load(id);
    this.loadCouriers();
  }

  load(id: number): void {
    this.loading = true;
    this.orders.get(id).subscribe({
      next: (o) => {
        this.order = o;
        this.courier_id = o.courier_id ?? null;
        this.eta_minutes = o.eta_minutes ?? 30;
        this.receiver_rut = o.receiver_rut ?? '';
        this.delivery_photo_url = o.delivery_photo_url ?? '';
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  loadCouriers(): void {
    this.http.get<any>(`${environment.apiUrl}/couriers`).subscribe({
      next: (res) => {
        // soporta array directo o {data:[]}
        const list = Array.isArray(res) ? res : (res?.data ?? []);
        this.couriers = list.map((c: any) => ({
          id: c.id,
          name: c.name ?? c.full_name ?? (`${c.first_name ?? ''} ${c.last_name ?? ''}`.trim() || `#${c.id}`),
          rating: c.rating ?? c.avg_rating ?? null,
        }));
      },
      error: () => {},
    });
  }

  assignCourier(): void {
    if (!this.order || !this.courier_id) return;
    this.saving = true;
    this.orders.assignCourier(this.order.id, Number(this.courier_id)).subscribe({
      next: (o) => {
        this.order = o;
        this.saving = false;
      },
      error: () => (this.saving = false),
    });
  }

  markEnRoute(): void {
    if (!this.order) return;
    this.saving = true;
    this.orders.markEnRoute(this.order.id, Number(this.eta_minutes || 0)).subscribe({
      next: (o) => {
        this.order = o;
        this.saving = false;
      },
      error: () => (this.saving = false),
    });
  }

  markDelivered(): void {
    if (!this.order) return;
    this.saving = true;
    this.orders
      .markDelivered(this.order.id, {
        receiver_rut: this.receiver_rut ? this.receiver_rut : null,
        delivery_photo_url: this.delivery_photo_url ? this.delivery_photo_url : null,
      })
      .subscribe({
        next: (o) => {
          this.order = o;
          this.saving = false;
        },
        error: () => (this.saving = false),
      });
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
