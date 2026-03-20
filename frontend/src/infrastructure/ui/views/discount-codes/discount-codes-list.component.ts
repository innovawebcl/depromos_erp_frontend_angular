import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BackofficeApi } from '@infra-adapters/services/backoffice-api.service';
import { firstValueFrom } from 'rxjs';

type DiscountCode = {
  id: number; code: string; name: string; type: string;
  value: number; starts_at?: string; ends_at?: string;
  max_uses?: number; times_used: number; active: boolean;
};

@Component({
  standalone: true,
  selector: 'app-discount-codes-list',
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
  <div class="d-flex justify-content-between align-items-center mb-3">
    <h2 class="mb-0">Códigos de Descuento</h2>
    <a class="btn btn-primary" [routerLink]="['/discount-codes/new']">Crear código</a>
  </div>

  <div class="card mb-3">
    <div class="card-body">
      <div class="row g-2 align-items-end">
        <div class="col-md-8">
          <input class="form-control" [(ngModel)]="search" (keyup.enter)="load()" placeholder="Buscar por código o nombre" />
        </div>
        <div class="col-md-4">
          <button class="btn btn-outline-primary w-100" (click)="load()">Buscar</button>
        </div>
      </div>
    </div>
  </div>

  <div class="card">
    <div class="card-body">
      <div *ngIf="loading" class="text-muted">Cargando...</div>
      <div *ngIf="!loading && items.length===0" class="text-muted">Sin códigos de descuento</div>
      <div class="table-responsive" *ngIf="!loading && items.length>0">
        <table class="table table-sm align-middle">
          <thead>
            <tr>
              <th>Código</th>
              <th>Nombre</th>
              <th>Tipo</th>
              <th>Valor</th>
              <th>Vigencia</th>
              <th>Usos</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let c of items">
              <td><code>{{c.code}}</code></td>
              <td>{{c.name}}</td>
              <td>{{c.type === 'percentage' ? 'Porcentaje' : 'Monto fijo'}}</td>
              <td>{{c.type === 'percentage' ? c.value + '%' : '$' + (c.value | number:'1.0-0')}}</td>
              <td>
                <small *ngIf="c.starts_at || c.ends_at">
                  {{c.starts_at ? (c.starts_at | date:'dd/MM/yy') : '...'}} — {{c.ends_at ? (c.ends_at | date:'dd/MM/yy') : '...'}}
                </small>
                <span *ngIf="!c.starts_at && !c.ends_at" class="text-muted">Sin límite</span>
              </td>
              <td>{{c.times_used}}<span *ngIf="c.max_uses"> / {{c.max_uses}}</span></td>
              <td>
                <span class="badge" [class.bg-success]="c.active" [class.bg-secondary]="!c.active">{{c.active?'Activo':'Inactivo'}}</span>
              </td>
              <td class="text-end">
                <a class="btn btn-sm btn-outline-primary" [routerLink]="['/discount-codes', c.id]">Editar</a>
                <button class="btn btn-sm btn-outline-danger ms-1" (click)="remove(c)">Eliminar</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
  `
})
export class DiscountCodesListComponent {
  private api = inject(BackofficeApi);
  items: DiscountCode[] = [];
  loading = false;
  search = '';

  async ngOnInit() { await this.load(); }

  async load() {
    this.loading = true;
    try {
      const res: any = await firstValueFrom(this.api.get<any>('/discount-codes', { search: this.search }));
      this.items = (res.data ?? res) as DiscountCode[];
    } finally { this.loading = false; }
  }

  async remove(c: DiscountCode) {
    if (!confirm(`¿Eliminar código "${c.code}"?`)) return;
    await firstValueFrom(this.api.delete(`/discount-codes/${c.id}`));
    await this.load();
  }
}
