import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '@infra-env/environment';
import { OrdersService } from './orders.service';
import type { Order } from './orders.models';

interface CourierMini {
  id: number;
  name: string;
  rating?: number | null;
}

interface CustomerAddress {
  id: number;
  label: string;
  address_line: string;
  is_default: boolean;
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
  customerAddresses: CustomerAddress[] = [];
  selectedAddressId: number | null = null;

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

  loadCustomerAddresses(customerId: number): void {
    this.http.get<any>(`${environment.apiUrl}/customers/${customerId}/addresses`).subscribe({
      next: (res) => {
        this.customerAddresses = Array.isArray(res) ? res : (res?.data ?? []);
      },
      error: () => { this.customerAddresses = []; },
    });
  }

  changeAddress(): void {
    if (!this.order || !this.selectedAddressId) return;
    this.saving = true;
    this.http.patch<any>(`${environment.apiUrl}/orders/${this.order.id}/change-address`, {
      customer_address_id: this.selectedAddressId
    }).subscribe({
      next: (o) => {
        this.order = o;
        this.selectedAddressId = null;
        this.saving = false;
      },
      error: () => (this.saving = false),
    });
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
        if (o.customer_id) this.loadCustomerAddresses(o.customer_id);
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
      case 'pending': return 'info';
      case 'picking': return 'warning';
      case 'ready': return 'primary';
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

  /** Safely extract product name - prevents [object Object] display */
  getProductName(it: any): string {
    if (!it) return '—';
    if (typeof it.product_name === 'string') return it.product_name;
    if (it.product && typeof it.product === 'object') return it.product.name || '—';
    return String(it.product_name || '—');
  }

  /** Safely extract size - prevents [object Object] display */
  getSize(it: any): string {
    if (!it) return '—';
    if (typeof it.size_label === 'string' && it.size_label !== '—') return it.size_label;
    if (typeof it.size === 'string') return it.size;
    if (typeof it.size === 'object' && it.size !== null) return it.size?.size || it.size?.name || '—';
    return String(it.size || '—');
  }

  /** Safely extract barcode */
  getBarcode(it: any): string {
    if (!it) return '—';
    if (typeof it.barcode === 'string' && it.barcode) return it.barcode;
    if (typeof it.size === 'object' && it.size?.barcode) return it.size.barcode;
    return '—';
  }

  /** Safely extract delivery address */
  getDeliveryAddress(order: any): string {
    if (!order?.delivery_address) return '—';
    const da = order.delivery_address;
    if (typeof da === 'string') return da;
    if (typeof da === 'object') {
      return da.address_line || da.street || [da.street_name, da.number].filter(Boolean).join(' ') || JSON.stringify(da);
    }
    return String(da);
  }

  /** Safely extract commune name */
  getCommune(order: any): string {
    if (!order) return '—';
    if (typeof order.commune_name === 'string') return order.commune_name;
    if (order.commune && typeof order.commune === 'object') return order.commune.name || '—';
    return '—';
  }

  /** Format date to DD/MM/YYYY HH:mm (Chile timezone) */
  formatDate(dateStr: string | null | undefined): string {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('es-CL', {
        timeZone: 'America/Santiago',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }) + ' ' + d.toLocaleTimeString('es-CL', {
        timeZone: 'America/Santiago',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  }
}
