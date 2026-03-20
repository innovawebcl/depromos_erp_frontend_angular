import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BackofficeApi } from '@infra-adapters/services/backoffice-api.service';
import { firstValueFrom } from 'rxjs';

type Address = { id?: number; label: string; address_line: string; commune_id?: number; lat?: number; lng?: number; is_default: boolean };

@Component({
  standalone: true,
  selector: 'app-customers-detail',
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
  <div class="d-flex justify-content-between align-items-center mb-3">
    <h2 class="mb-0">Detalle cliente</h2>
    <a class="btn btn-outline-secondary" [routerLink]="['/customers']">Volver</a>
  </div>

  <div *ngIf="loading" class="text-muted">Cargando...</div>

  <div *ngIf="customer">
    <!-- Info principal -->
    <div class="card mb-3">
      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-4">
            <div class="text-muted">Nombre</div>
            <div class="h5">{{customer.name}}</div>
            <div class="text-muted">{{customer.email || '-'}} · {{customer.phone || '-'}}</div>
          </div>
          <div class="col-md-2">
            <div class="text-muted">Compras</div>
            <div class="h5">{{customer.purchase_count}}</div>
          </div>
          <div class="col-md-2">
            <div class="text-muted">Nivel</div>
            <div class="h5"><span class="badge bg-info">{{customer.level || 'standard'}}</span></div>
          </div>
          <div class="col-md-2">
            <div class="text-muted">Blacklist</div>
            <div class="h5"><span class="badge" [class.bg-danger]="customer.is_blacklisted" [class.bg-secondary]="!customer.is_blacklisted">{{customer.is_blacklisted?'Sí':'No'}}</span></div>
          </div>
          <div class="col-md-2 d-flex align-items-end">
            <button class="btn btn-outline-warning btn-sm w-100" (click)="toggleBlacklist()" [disabled]="saving">{{customer.is_blacklisted?'Quitar blacklist':'Agregar blacklist'}}</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Contacto alternativo -->
    <div class="card mb-3">
      <div class="card-header"><strong>Contacto de respaldo</strong></div>
      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-4">
            <label class="form-label">Nombre alternativo</label>
            <input class="form-control" [(ngModel)]="customer.alt_name" />
          </div>
          <div class="col-md-4">
            <label class="form-label">Teléfono alternativo</label>
            <input class="form-control" [(ngModel)]="customer.alt_phone" />
          </div>
          <div class="col-md-4">
            <label class="form-label">Dirección alternativa</label>
            <input class="form-control" [(ngModel)]="customer.alt_address" />
          </div>
          <div class="col-md-12">
            <button class="btn btn-primary btn-sm" (click)="saveAltContact()" [disabled]="saving">{{saving?'Guardando...':'Guardar contacto alternativo'}}</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Direcciones de despacho -->
    <div class="card mb-3">
      <div class="card-header d-flex justify-content-between align-items-center">
        <strong>Direcciones de despacho</strong>
        <button class="btn btn-sm btn-outline-primary" (click)="showNewAddress=!showNewAddress">{{showNewAddress ? 'Cancelar' : 'Agregar dirección'}}</button>
      </div>
      <div class="card-body">
        <!-- Formulario nueva dirección -->
        <div *ngIf="showNewAddress" class="row g-2 mb-3 p-2 border rounded bg-light">
          <div class="col-md-3">
            <input class="form-control form-control-sm" [(ngModel)]="newAddr.label" placeholder="Etiqueta (ej: Oficina)" />
          </div>
          <div class="col-md-5">
            <input class="form-control form-control-sm" [(ngModel)]="newAddr.address_line" placeholder="Dirección completa" />
          </div>
          <div class="col-md-2">
            <select class="form-select form-select-sm" [(ngModel)]="newAddr.is_default">
              <option [ngValue]="false">Normal</option>
              <option [ngValue]="true">Principal</option>
            </select>
          </div>
          <div class="col-md-2">
            <button class="btn btn-sm btn-primary w-100" (click)="createAddress()" [disabled]="saving">Guardar</button>
          </div>
        </div>

        <div *ngIf="addresses.length===0" class="text-muted">Sin direcciones registradas</div>
        <div class="table-responsive" *ngIf="addresses.length>0">
          <table class="table table-sm align-middle mb-0">
            <thead>
              <tr><th>Etiqueta</th><th>Dirección</th><th>Principal</th><th></th></tr>
            </thead>
            <tbody>
              <tr *ngFor="let a of addresses">
                <td>{{a.label || '—'}}</td>
                <td>{{a.address_line}}</td>
                <td><span class="badge" [class.bg-primary]="a.is_default" [class.bg-secondary]="!a.is_default">{{a.is_default?'Sí':'No'}}</span></td>
                <td class="text-end">
                  <button class="btn btn-sm btn-outline-danger" (click)="deleteAddress(a)" [disabled]="saving">Eliminar</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Pedidos recientes -->
    <div class="card mb-3">
      <div class="card-header"><strong>Pedidos recientes</strong></div>
      <div class="card-body">
        <div *ngIf="!customer.orders?.length" class="text-muted">Sin pedidos</div>
        <div class="table-responsive" *ngIf="customer.orders?.length">
          <table class="table table-sm align-middle mb-0">
            <thead>
              <tr><th>#</th><th>Estado</th><th>Total</th><th>Fecha</th><th></th></tr>
            </thead>
            <tbody>
              <tr *ngFor="let o of customer.orders">
                <td>{{o.id}}</td>
                <td><span class="badge bg-info">{{o.status}}</span></td>
                <td>\${{o.total | number:'1.0-0'}}</td>
                <td>{{o.created_at | date:'dd/MM/yy'}}</td>
                <td><a class="btn btn-sm btn-outline-primary" [routerLink]="['/orders', o.id]">Ver</a></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Meta compras -->
    <div class="card mb-3">
      <div class="card-body">
        <div class="row g-2 align-items-end">
          <div class="col-md-4">
            <label class="form-label">Meta compras para Platinum</label>
            <input type="number" class="form-control" [(ngModel)]="goal" min="0" />
          </div>
          <div class="col-md-4">
            <button class="btn btn-primary w-100" (click)="saveGoal()" [disabled]="saving">{{saving?'Guardando...':'Guardar meta'}}</button>
          </div>
        </div>
      </div>
    </div>
  </div>
  `
})
export class CustomersDetailComponent {
  private api = inject(BackofficeApi);
  private route = inject(ActivatedRoute);

  loading = false;
  saving = false;
  customer: any;
  goal = 0;
  addresses: Address[] = [];
  showNewAddress = false;
  newAddr: Address = { label: '', address_line: '', is_default: false };

  async ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loading = true;
    try {
      this.customer = await firstValueFrom(this.api.get<any>(`/customers/${id}`));
      this.goal = Number(this.customer.purchase_goal ?? 0);
      await this.loadAddresses();
    } finally {
      this.loading = false;
    }
  }

  async loadAddresses() {
    try {
      const res: any = await firstValueFrom(this.api.get<any>(`/customers/${this.customer.id}/addresses`));
      this.addresses = (res.data ?? res) as Address[];
    } catch { this.addresses = []; }
  }

  async createAddress() {
    this.saving = true;
    try {
      await firstValueFrom(this.api.post(`/customers/${this.customer.id}/addresses`, this.newAddr));
      this.newAddr = { label: '', address_line: '', is_default: false };
      this.showNewAddress = false;
      await this.loadAddresses();
    } finally { this.saving = false; }
  }

  async deleteAddress(a: Address) {
    if (!confirm(`¿Eliminar dirección "${a.label || a.address_line}"?`)) return;
    this.saving = true;
    try {
      await firstValueFrom(this.api.delete(`/customers/${this.customer.id}/addresses/${a.id}`));
      await this.loadAddresses();
    } finally { this.saving = false; }
  }

  async saveAltContact() {
    this.saving = true;
    try {
      const res = await firstValueFrom(this.api.put<any>(`/customers/${this.customer.id}`, {
        name: this.customer.name,
        email: this.customer.email,
        phone: this.customer.phone,
        alt_name: this.customer.alt_name || null,
        alt_phone: this.customer.alt_phone || null,
        alt_address: this.customer.alt_address || null,
      }));
      this.customer = res;
    } finally { this.saving = false; }
  }

  async saveGoal() {
    this.saving = true;
    try {
      const res = await firstValueFrom(this.api.patch<any>(`/customers/${this.customer.id}/purchase-goal`, { purchase_goal: Number(this.goal) }));
      this.customer = res;
    } finally { this.saving = false; }
  }

  async toggleBlacklist() {
    this.saving = true;
    try {
      const res = await firstValueFrom(this.api.patch<any>(`/customers/${this.customer.id}/blacklist`, { is_blacklisted: !this.customer.is_blacklisted }));
      this.customer = res;
    } finally { this.saving = false; }
  }
}
