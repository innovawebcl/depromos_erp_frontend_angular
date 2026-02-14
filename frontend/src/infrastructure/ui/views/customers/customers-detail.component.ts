import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BackofficeApi } from '@infra-adapters/services/backoffice-api.service';
import { firstValueFrom } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-customers-detail',
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
  <div class="d-flex justify-content-between align-items-center mb-3">
    <h2 class="mb-0">Detalle cliente</h2>
    <a class="btn btn-outline-secondary" [routerLink]="['/customers']">Volver</a>
  </div>

  <div class="card" *ngIf="customer">
    <div class="card-body">
      <div class="row g-3">
        <div class="col-md-6">
          <div class="text-muted">Nombre</div>
          <div class="h5">{{customer.name}}</div>
          <div class="text-muted">{{customer.email || '-'}} · {{customer.phone || '-'}}</div>
        </div>
        <div class="col-md-3">
          <div class="text-muted">Compras</div>
          <div class="h5">{{customer.purchase_count}}</div>
        </div>
        <div class="col-md-3">
          <div class="text-muted">Blacklist</div>
          <div class="h5"><span class="badge" [class.bg-danger]="customer.is_blacklisted" [class.bg-secondary]="!customer.is_blacklisted">{{customer.is_blacklisted?'Sí':'No'}}</span></div>
        </div>
      </div>

      <hr />

      <div class="row g-2 align-items-end">
        <div class="col-md-4">
          <label class="form-label">Meta compras para Platinum</label>
          <input type="number" class="form-control" [(ngModel)]="goal" min="0" />
        </div>
        <div class="col-md-4">
          <button class="btn btn-primary w-100" (click)="saveGoal()" [disabled]="saving">{{saving?'Guardando...':'Guardar meta'}}</button>
        </div>
        <div class="col-md-4">
          <button class="btn btn-outline-warning w-100" (click)="toggleBlacklist()" [disabled]="saving">{{customer.is_blacklisted?'Quitar blacklist':'Agregar blacklist'}}</button>
        </div>
      </div>
    </div>
  </div>

  <div *ngIf="loading" class="text-muted">Cargando...</div>
  `
})
export class CustomersDetailComponent {
  private api = inject(BackofficeApi);
  private route = inject(ActivatedRoute);

  loading = false;
  saving = false;
  customer: any;
  goal = 0;

  async ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loading = true;
    try {
      this.customer = await firstValueFrom(this.api.get<any>(`/customers/${id}`));
      this.goal = Number(this.customer.purchase_goal ?? 0);
    } finally {
      this.loading = false;
    }
  }

  async saveGoal() {
    this.saving = true;
    try {
      const res = await firstValueFrom(this.api.patch<any>(`/customers/${this.customer.id}/purchase-goal`, { purchase_goal: Number(this.goal) }));
      this.customer = res;
    } finally {
      this.saving = false;
    }
  }

  async toggleBlacklist() {
    this.saving = true;
    try {
      const res = await firstValueFrom(this.api.patch<any>(`/customers/${this.customer.id}/blacklist`, { is_blacklisted: !this.customer.is_blacklisted }));
      this.customer = res;
    } finally {
      this.saving = false;
    }
  }
}
