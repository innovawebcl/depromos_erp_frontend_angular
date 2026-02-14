import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BackofficeApi } from '@infra-adapters/services/backoffice-api.service';
import { firstValueFrom } from 'rxjs';

type Customer = { id: number; name: string; email?: string | null; phone?: string | null; purchase_goal: number; purchase_count: number; is_blacklisted: boolean };

@Component({
  standalone: true,
  selector: 'app-customers-list',
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
  <div class="d-flex justify-content-between align-items-center mb-3">
    <h2 class="mb-0">Clientes</h2>
  </div>

  <div class="card mb-3">
    <div class="card-body">
      <div class="row g-2 align-items-end">
        <div class="col-md-6">
          <label class="form-label">Buscar</label>
          <input class="form-control" [(ngModel)]="search" (keyup.enter)="load()" placeholder="nombre o email" />
        </div>
        <div class="col-md-3">
          <label class="form-label">Lista negra</label>
          <select class="form-select" [(ngModel)]="blacklisted" (change)="load()">
            <option value="">Todos</option>
            <option value="1">Sí</option>
            <option value="0">No</option>
          </select>
        </div>
        <div class="col-md-3">
          <button class="btn btn-outline-primary w-100" (click)="load()">Filtrar</button>
        </div>
      </div>
    </div>
  </div>

  <div class="card">
    <div class="card-body">
      <div *ngIf="loading" class="text-muted">Cargando...</div>
      <div class="table-responsive" *ngIf="!loading">
        <table class="table table-sm align-middle">
          <thead><tr><th>ID</th><th>Nombre</th><th>Email</th><th>Compras</th><th>Meta</th><th>Blacklist</th><th></th></tr></thead>
          <tbody>
            <tr *ngFor="let c of items">
              <td>{{c.id}}</td>
              <td>{{c.name}}</td>
              <td>{{c.email || '-'}}</td>
              <td>{{c.purchase_count}}</td>
              <td>{{c.purchase_goal}}</td>
              <td><span class="badge" [class.bg-danger]="c.is_blacklisted" [class.bg-secondary]="!c.is_blacklisted">{{c.is_blacklisted?'Sí':'No'}}</span></td>
              <td class="text-end">
                <button class="btn btn-sm btn-outline-warning me-2" (click)="toggleBlacklist(c)">{{c.is_blacklisted?'Quitar':'Agregar'}}</button>
                <a class="btn btn-sm btn-outline-primary" [routerLink]="['/customers', c.id]">Detalle</a>
              </td>
            </tr>
            <tr *ngIf="items.length===0"><td colspan="7" class="text-muted">Sin resultados</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
  `
})
export class CustomersListComponent {
  private api = inject(BackofficeApi);
  items: Customer[] = [];
  loading = false;
  search = '';
  blacklisted: '' | '1' | '0' = '';

  async ngOnInit() { await this.load(); }

  async load() {
    this.loading = true;
    try {
      const res: any = await firstValueFrom(this.api.get<any>('/customers', {
        search: this.search,
        blacklisted: this.blacklisted,
      }));
      this.items = (res.data ?? res) as Customer[];
      // filtro local (backend base no filtra)
      if (this.search) {
        const s = this.search.toLowerCase();
        this.items = this.items.filter(x => (x.name||'').toLowerCase().includes(s) || (x.email||'').toLowerCase().includes(s));
      }
      if (this.blacklisted !== '') {
        const want = this.blacklisted === '1';
        this.items = this.items.filter(x => !!x.is_blacklisted === want);
      }
    } finally {
      this.loading = false;
    }
  }

  async toggleBlacklist(c: Customer) {
    await firstValueFrom(this.api.patch(`/customers/${c.id}/blacklist`, { is_blacklisted: !c.is_blacklisted }));
    await this.load();
  }
}
