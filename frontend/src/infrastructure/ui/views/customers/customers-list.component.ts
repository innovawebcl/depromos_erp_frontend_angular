import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BackofficeApi } from '@infra-adapters/services/backoffice-api.service';
import { environment } from '@infra-env/environment';
import { firstValueFrom } from 'rxjs';

type Customer = { id: number; name: string; email?: string | null; phone?: string | null; purchase_goal: number; purchase_count: number; is_blacklisted: boolean; level?: string | null };

@Component({
  standalone: true,
  selector: 'app-customers-list',
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
  <div class="d-flex justify-content-between align-items-center mb-3">
    <h2 class="mb-0">Clientes</h2>
    <div class="d-flex gap-2">
      <button class="btn btn-outline-success" (click)="showImportModal=true">Carga masiva clientes</button>
    </div>
  </div>

  <!-- Modal de importación -->
  <div *ngIf="showImportModal" class="card mb-3 border-success">
    <div class="card-header bg-primary text-white d-flex justify-content-between">
      <strong>Carga masiva de clientes</strong>
      <button class="btn btn-sm btn-light" (click)="showImportModal=false">&times;</button>
    </div>
    <div class="card-body">
      <p class="mb-2">Suba un archivo CSV con las columnas: <code>name, email, phone, purchase_goal</code></p>
      <input type="file" class="form-control mb-2" accept=".csv,.txt" (change)="onFileSelected($event)" />
      <button class="btn btn-success" [disabled]="!selectedFile || importing" (click)="importCustomers()">
        {{importing ? 'Importando...' : 'Importar clientes'}}
      </button>
      <div *ngIf="importResult" class="mt-2 alert" [class.alert-success]="!importResult.errors?.length" [class.alert-warning]="importResult.errors?.length">
        <strong>{{importResult.created ?? 0}} creados, {{importResult.updated ?? 0}} actualizados</strong>
        <div *ngIf="importResult.errors?.length">
          <small *ngFor="let e of importResult.errors" class="d-block text-danger">{{e}}</small>
        </div>
      </div>
    </div>
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
          <thead>
            <tr>
              <th class="sortable" (click)="toggleSort('id')">ID</th>
              <th class="sortable" (click)="toggleSort('name')">Nombre</th>
              <th>Email</th>
              <th>Teléfono</th>
              <th class="sortable" (click)="toggleSort('purchase_count')">Compras</th>
              <th>Meta</th>
              <th>Blacklist</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let c of sortedItems">
              <td>{{c.id}}</td>
              <td class="fw-semibold">{{c.name}}</td>
              <td>{{c.email || '—'}}</td>
              <td>{{c.phone || '—'}}</td>
              <td>{{c.purchase_count}}</td>
              <td>{{c.purchase_goal}}</td>
              <td>
                <span class="badge" [class.bg-danger]="c.is_blacklisted" [class.bg-secondary]="!c.is_blacklisted">
                  {{c.is_blacklisted?'Sí':'No'}}
                </span>
              </td>
              <td class="text-end">
                <button class="btn btn-sm btn-outline-warning me-1" (click)="toggleBlacklist(c)">{{c.is_blacklisted?'Quitar':'Agregar'}}</button>
                <a class="btn btn-sm btn-outline-primary" [routerLink]="['/customers', c.id]">Detalle</a>
              </td>
            </tr>
            <tr *ngIf="items.length===0"><td colspan="8" class="text-muted text-center py-3">Sin resultados</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
  `
})
export class CustomersListComponent {
  private api = inject(BackofficeApi);
  apiBase = environment.apiUrl;
  items: Customer[] = [];
  loading = false;
  search = '';
  blacklisted: '' | '1' | '0' = '';
  sortCol = '';
  sortDir: 'asc' | 'desc' = 'asc';

  // Import
  showImportModal = false;
  selectedFile: File | null = null;
  importing = false;
  importResult: any = null;

  async ngOnInit() { await this.load(); }

  get sortedItems(): Customer[] {
    if (!this.sortCol) return this.items;
    const dir = this.sortDir === 'asc' ? 1 : -1;
    return [...this.items].sort((a: any, b: any) => {
      const va = a[this.sortCol] ?? '';
      const vb = b[this.sortCol] ?? '';
      if (typeof va === 'number') return (va - vb) * dir;
      return String(va).localeCompare(String(vb)) * dir;
    });
  }

  toggleSort(col: string): void {
    if (this.sortCol === col) {
      this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortCol = col;
      this.sortDir = 'asc';
    }
  }

  async load() {
    this.loading = true;
    try {
      const res: any = await firstValueFrom(this.api.get<any>('/customers', {
        search: this.search,
        blacklisted: this.blacklisted,
      }));
      this.items = (res.data ?? res) as Customer[];
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

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0] ?? null;
    this.importResult = null;
  }

  async importCustomers() {
    if (!this.selectedFile) return;
    this.importing = true;
    this.importResult = null;
    try {
      const fd = new FormData();
      fd.append('file', this.selectedFile);
      const res = await firstValueFrom(this.api.post<any>('/customers/import', fd));
      this.importResult = res;
      await this.load();
    } catch (err: any) {
      this.importResult = { created: 0, errors: [err?.error?.message || 'Error en importación'] };
    } finally {
      this.importing = false;
    }
  }
}
