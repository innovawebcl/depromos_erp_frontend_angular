import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PickingService } from './picking.service';
import type { Order } from '../orders/orders.models';

@Component({
  selector: 'app-picking-session',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './picking-session.component.html',
})
export class PickingSessionComponent implements OnInit {
  loading = false;
  scanning = false;
  closing = false;

  order?: Order;
  code = '';
  lastMessage: { type: 'success' | 'danger' | 'warning'; text: string } | null = null;

  constructor(private route: ActivatedRoute, private picking: PickingService) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.load(id);
  }

  load(orderId: number): void {
    this.loading = true;
    this.picking.getOrder(orderId).subscribe({
      next: (o) => {
        this.order = o;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  scan(): void {
    if (!this.order) return;
    const value = (this.code || '').trim();
    if (!value) return;
    this.scanning = true;
    this.lastMessage = null;

    this.picking.scan(this.order.id, value).subscribe({
      next: (res) => {
        this.scanning = false;
        if (res.order) {
          this.order = res.order as any;
        } else {
          // refresca para asegurar coherencia
          this.load(this.order!.id);
        }

        if (res.ok) {
          this.lastMessage = { type: 'success', text: res.message || 'Código validado' };
        } else {
          this.lastMessage = { type: 'warning', text: res.message || 'Código no válido para este pedido' };
        }
        this.code = '';
      },
      error: (err) => {
        this.scanning = false;
        this.lastMessage = {
          type: 'danger',
          text: err?.error?.message || 'No se pudo validar el código',
        };
      },
    });
  }

  closePicking(): void {
    if (!this.order) return;
    this.closing = true;
    this.lastMessage = null;
    this.picking.close(this.order.id).subscribe({
      next: (o) => {
        this.order = o;
        this.closing = false;
        this.lastMessage = { type: 'success', text: 'Picking cerrado. Pedido listo para despacho.' };
      },
      error: (err) => {
        this.closing = false;
        this.lastMessage = {
          type: 'danger',
          text: err?.error?.message || 'No se puede cerrar el picking. Revisa faltantes/códigos.',
        };
      },
    });
  }

  progress(it: any): string {
    const scanned = Number(it.scanned_quantity || 0);
    const qty = Number(it.quantity || 0);
    if (!qty) return '0%';
    const pct = Math.min(100, Math.round((scanned / qty) * 100));
    return `${pct}%`;
  }

  isComplete(it: any): boolean {
    return Number(it.scanned_quantity || 0) >= Number(it.quantity || 0);
  }
}
