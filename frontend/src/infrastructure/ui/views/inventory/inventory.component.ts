import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { BackofficeApi } from '@infra-adapters/services/backoffice-api.service';
import { environment } from '@infra-env/environment';
import { firstValueFrom } from 'rxjs';

type Row = { productId: number; code: string; name: string; size: string; stock: number; barcode?: string | null; active: boolean };

@Component({
  standalone: true,
  selector: 'app-inventory',
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
  <div class="d-flex justify-content-between align-items-center mb-3">
    <h2 class="mb-0">Inventario</h2>
    <div class="d-flex gap-2">
      <button class="btn btn-outline-success" (click)="showImportModal=true">Importar stock</button>
      <a class="btn btn-outline-primary" [href]="apiBase + '/inventory/export'" target="_blank">Exportar inventario</a>
      <a class="btn btn-outline-secondary" [routerLink]="['/products']">Ir a Productos</a>
    </div>
  </div>

  <!-- Modal de importación de stock -->
  <div *ngIf="showImportModal" class="card mb-3 border-success">
    <div class="card-header bg-primary text-white d-flex justify-content-between">
      <strong>Carga masiva de stock</strong>
      <button class="btn btn-sm btn-light" (click)="showImportModal=false">&times;</button>
    </div>
    <div class="card-body">
      <p class="mb-2">Suba un archivo CSV con las columnas: <code>code, size, stock</code></p>
      <p class="text-muted small">El stock se reemplaza por el valor indicado en el archivo.</p>
      <div class="d-flex gap-2 mb-2">
        <a class="btn btn-sm btn-outline-primary" [href]="apiBase + '/inventory/template/download'" target="_blank">Descargar plantilla</a>
      </div>
      <input type="file" class="form-control mb-2" accept=".csv,.txt" (change)="onStockFileSelected($event)" />
      <button class="btn btn-success" [disabled]="!stockFile || stockImporting" (click)="importStock()">
        {{stockImporting ? 'Importando...' : 'Importar stock'}}
      </button>
      <div *ngIf="stockImportResult" class="mt-2 alert" [class.alert-success]="!stockImportResult.errors?.length" [class.alert-warning]="stockImportResult.errors?.length">
        <strong>{{stockImportResult.updated ?? 0}} tallas actualizadas</strong>
        <div *ngIf="stockImportResult.errors?.length">
          <small *ngFor="let e of stockImportResult.errors" class="d-block text-danger">{{e}}</small>
        </div>
      </div>
    </div>
  </div>

  <div class="card mb-3">
    <div class="card-body">
      <div class="row g-2 align-items-end">
        <div class="col-md-6">
          <label class="form-label">Buscar</label>
          <input class="form-control" [(ngModel)]="search" (keyup.enter)="applyFilter()" placeholder="producto, código o talla" />
        </div>
        <div class="col-md-3">
          <label class="form-label">Umbral alerta</label>
          <input type="number" class="form-control" [(ngModel)]="lowStock" (change)="applyFilter()" min="0" />
        </div>
        <div class="col-md-3">
          <button class="btn btn-outline-primary w-100" (click)="applyFilter()">Aplicar</button>
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
              <th class="sortable" [class.sort-asc]="sortCol==='name'&&sortDir==='asc'" [class.sort-desc]="sortCol==='name'&&sortDir==='desc'" (click)="toggleSort('name')">Producto</th>
              <th class="sortable" [class.sort-asc]="sortCol==='size'&&sortDir==='asc'" [class.sort-desc]="sortCol==='size'&&sortDir==='desc'" (click)="toggleSort('size')">Talla</th>
              <th>Código de barras</th>
              <th class="sortable" [class.sort-asc]="sortCol==='stock'&&sortDir==='asc'" [class.sort-desc]="sortCol==='stock'&&sortDir==='desc'" (click)="toggleSort('stock')">Stock</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let r of sortedFiltered">
              <td>
                <div class="fw-semibold">{{r.name}}</div>
                <div class="text-muted small">{{r.code}} · ID {{r.productId}}</div>
              </td>
              <td>{{r.size}}</td>
              <td>{{r.barcode || '-'}}</td>
              <td>
                <span class="badge me-2" [class.bg-danger]="r.stock<=0" [class.bg-warning]="r.stock>0 && r.stock<=lowStock" [class.bg-success]="r.stock>lowStock">
                  {{r.stock}}
                </span>
                <span *ngIf="r.stock<=0" class="text-danger small">Quiebre / sobreventa</span>
              </td>
              <td><span class="badge" [class.badge-active]="r.active" [class.badge-inactive]="!r.active">{{r.active?'Activa':'Inactiva'}}</span></td>
              <td class="text-end"><a class="btn btn-sm btn-outline-primary" [routerLink]="['/products', r.productId]">Editar</a></td>
            </tr>
            <tr *ngIf="sortedFiltered.length===0"><td colspan="6" class="text-muted">Sin resultados</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
  `
})
export class InventoryComponent {
  private api = inject(BackofficeApi);
  apiBase = environment.apiUrl;

  loading = false;
  rows: Row[] = [];
  filtered: Row[] = [];
  search = '';
  lowStock = 3;
  sortCol = '';
  sortDir: 'asc' | 'desc' = 'asc';

  // Import stock
  showImportModal = false;
  stockFile: File | null = null;
  stockImporting = false;
  stockImportResult: any = null;

  async ngOnInit() {
    await this.load();
  }

  get sortedFiltered(): Row[] {
    if (!this.sortCol) return this.filtered;
    const dir = this.sortDir === 'asc' ? 1 : -1;
    return [...this.filtered].sort((a: any, b: any) => {
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

  onStockFileSelected(event: any) {
    this.stockFile = event.target.files[0] ?? null;
    this.stockImportResult = null;
  }

  async importStock() {
    if (!this.stockFile) return;
    this.stockImporting = true;
    this.stockImportResult = null;
    try {
      const fd = new FormData();
      fd.append('file', this.stockFile);
      const res = await firstValueFrom(this.api.post<any>('/inventory/import', fd));
      this.stockImportResult = res;
      await this.load();
    } catch (err: any) {
      this.stockImportResult = { updated: 0, errors: [err?.error?.message || 'Error en importación'] };
    } finally {
      this.stockImporting = false;
    }
  }

  async load() {
    this.loading = true;
    try {
      const res: any = await firstValueFrom(this.api.get<any>('/products'));
      const products = (res.data ?? res) as any[];
      this.rows = [];
      for (const p of products) {
        for (const s of (p.sizes ?? [])) {
          this.rows.push({
            productId: p.id,
            code: p.code,
            name: p.name,
            size: s.size,
            stock: Number(s.stock ?? 0),
            barcode: s.barcode ?? null,
            active: !!s.active,
          });
        }
      }
      this.applyFilter();
    } finally {
      this.loading = false;
    }
  }

  applyFilter() {
    const s = this.search.trim().toLowerCase();
    this.filtered = this.rows.filter(r => {
      if (!s) return true;
      return (
        r.name.toLowerCase().includes(s) ||
        r.code.toLowerCase().includes(s) ||
        r.size.toLowerCase().includes(s) ||
        String(r.productId) === s
      );
    });
  }
}
