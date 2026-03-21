import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BackofficeApi } from '@infra-adapters/services/backoffice-api.service';
import { firstValueFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '@infra-env/environment';

type ProductSize = { size: string; barcode?: string | null; stock: number; price?: number; offer_price?: number | null; active: boolean };
type Brand = { id: number; name: string };
type Product = { id: number; code: string; name: string; price: number; active: boolean; brand?: Brand | null; sizes: ProductSize[] };

@Component({
  standalone: true,
  selector: 'app-products-list',
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
  <div class="d-flex justify-content-between align-items-center mb-3">
    <h2 class="mb-0">Productos</h2>
    <div class="d-flex gap-2 flex-wrap">
      <button class="btn btn-outline-success" (click)="showProductImportModal=true">Carga masiva productos</button>
      <button class="btn btn-outline-warning" (click)="showImportModal=true">Carga masiva ofertas</button>
      <a class="btn btn-primary" [routerLink]="['/products/new']">Crear producto</a>
    </div>
  </div>

  <!-- Modal de importación de productos -->
  <div *ngIf="showProductImportModal" class="card mb-3 border-success">
    <div class="card-header bg-primary text-white d-flex justify-content-between">
      <strong>Carga masiva de productos</strong>
      <button class="btn btn-sm btn-light" (click)="showProductImportModal=false">&times;</button>
    </div>
    <div class="card-body">
      <p class="mb-2">Suba un archivo CSV con las columnas: <code>code, name, description, brand_id, price, active, sizes</code></p>
      <p class="text-muted small">La columna <code>sizes</code> debe ser JSON: <code>[{{"{"}}size,price,barcode,stock{{"}"}}]</code></p>
      <div class="d-flex gap-2 mb-2">
        <a class="btn btn-sm btn-outline-primary" [href]="apiBase + '/products/template/products'" target="_blank">Descargar plantilla</a>
      </div>
      <input type="file" class="form-control mb-2" accept=".csv,.txt" (change)="onProductFileSelected($event)" />
      <button class="btn btn-success" [disabled]="!productFile || productImporting" (click)="importProducts()">
        {{productImporting ? 'Importando...' : 'Importar productos'}}
      </button>
      <div *ngIf="productImportResult" class="mt-2 alert" [class.alert-success]="!productImportResult.errors?.length" [class.alert-warning]="productImportResult.errors?.length">
        <strong>{{productImportResult.created ?? 0}} creados, {{productImportResult.updated ?? 0}} actualizados</strong>
        <div *ngIf="productImportResult.errors?.length">
          <small *ngFor="let e of productImportResult.errors" class="d-block text-danger">{{e}}</small>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal de importación de ofertas -->
  <div *ngIf="showImportModal" class="card mb-3 border-warning">
    <div class="card-header bg-info text-white d-flex justify-content-between">
      <strong>Carga masiva de ofertas</strong>
      <button class="btn btn-sm btn-light" (click)="showImportModal=false">&times;</button>
    </div>
    <div class="card-body">
      <p class="mb-2">Suba un archivo CSV con las columnas: <code>code, size, offer_price</code></p>
      <p class="text-muted small">Si offer_price > 0, se aplica como precio oferta. Si es 0 o vacío, se elimina la oferta.</p>
      <div class="d-flex gap-2 mb-2">
        <a class="btn btn-sm btn-outline-primary" [href]="apiBase + '/products/template/offers'" target="_blank">Descargar plantilla</a>
      </div>
      <input type="file" class="form-control mb-2" accept=".csv,.txt" (change)="onFileSelected($event)" />
      <button class="btn btn-warning" [disabled]="!selectedFile || importing" (click)="importOffers()">
        {{importing ? 'Importando...' : 'Importar ofertas'}}
      </button>
      <div *ngIf="importResult" class="mt-2 alert" [class.alert-success]="!importResult.errors?.length" [class.alert-warning]="importResult.errors?.length">
        <strong>{{importResult.updated}} tallas actualizadas</strong>
        <span *ngIf="importResult.notified"> — Clientes notificados por email</span>
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
          <input class="form-control" [(ngModel)]="search" (keyup.enter)="load()" placeholder="código o nombre" />
        </div>
        <div class="col-md-3">
          <label class="form-label">Estado</label>
          <select class="form-select" [(ngModel)]="active" (change)="load()">
            <option value="">Todos</option>
            <option value="1">Activos</option>
            <option value="0">Inactivos</option>
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
      <div *ngIf="!loading && items.length===0" class="text-muted">Sin resultados</div>
      <div class="table-responsive" *ngIf="!loading && items.length>0">
        <table class="table table-sm align-middle">
          <thead>
            <tr>
              <th class="sortable" [class.sort-asc]="sortCol==='id'&&sortDir==='asc'" [class.sort-desc]="sortCol==='id'&&sortDir==='desc'" (click)="toggleSort('id')">ID</th>
              <th class="sortable" [class.sort-asc]="sortCol==='code'&&sortDir==='asc'" [class.sort-desc]="sortCol==='code'&&sortDir==='desc'" (click)="toggleSort('code')">Código</th>
              <th class="sortable" [class.sort-asc]="sortCol==='name'&&sortDir==='asc'" [class.sort-desc]="sortCol==='name'&&sortDir==='desc'" (click)="toggleSort('name')">Nombre</th>
              <th>Marca</th>
              <th>Ofertas</th>
              <th>Stock</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let p of sortedItems">
              <td>{{p.id}}</td>
              <td>{{p.code}}</td>
              <td>{{p.name}}</td>
              <td>{{p.brand?.name || '—'}}</td>
              <td>
                <span *ngIf="hasOffers(p)" class="badge bg-warning text-dark">{{offersCount(p)}} en oferta</span>
                <span *ngIf="!hasOffers(p)" class="text-muted">—</span>
              </td>
              <td>{{stockTotal(p)}}</td>
              <td>
                <span class="badge" [class.badge-active]="p.active" [class.badge-inactive]="!p.active">{{p.active?'Activo':'Inactivo'}}</span>
              </td>
              <td class="text-end">
                <a class="btn btn-sm btn-outline-primary" [routerLink]="['/products', p.id]">Editar</a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
  `
})
export class ProductsListComponent {
  private api = inject(BackofficeApi);
  private http = inject(HttpClient);
  apiBase = environment.apiUrl;
  items: Product[] = [];
  loading = false;
  search = '';
  active: '' | '1' | '0' = '';

  // Sorting
  sortCol = '';
  sortDir: 'asc' | 'desc' = 'asc';

  // Import offers
  showImportModal = false;
  selectedFile: File | null = null;
  importing = false;
  importResult: any = null;

  // Import products
  showProductImportModal = false;
  productFile: File | null = null;
  productImporting = false;
  productImportResult: any = null;

  async ngOnInit() {
    await this.load();
  }

  get sortedItems(): Product[] {
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

  stockTotal(p: Product): number {
    return (p.sizes || []).reduce((acc, s) => acc + (s.stock ?? 0), 0);
  }

  hasOffers(p: Product): boolean {
    return (p.sizes || []).some(s => s.offer_price && s.offer_price > 0);
  }

  offersCount(p: Product): number {
    return (p.sizes || []).filter(s => s.offer_price && s.offer_price > 0).length;
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0] ?? null;
    this.importResult = null;
  }

  onProductFileSelected(event: any) {
    this.productFile = event.target.files[0] ?? null;
    this.productImportResult = null;
  }

  async importOffers() {
    if (!this.selectedFile) return;
    this.importing = true;
    this.importResult = null;
    try {
      const formData = new FormData();
      formData.append('file', this.selectedFile);
      const res = await firstValueFrom(this.api.post<any>('/products/import-offers', formData));
      this.importResult = res;
      if (res.updated > 0) await this.load();
    } catch (err: any) {
      this.importResult = { updated: 0, errors: [err?.error?.message || 'Error en importación'] };
    } finally {
      this.importing = false;
    }
  }

  async importProducts() {
    if (!this.productFile) return;
    this.productImporting = true;
    this.productImportResult = null;
    try {
      const formData = new FormData();
      formData.append('file', this.productFile);
      const res = await firstValueFrom(this.api.post<any>('/products/import', formData));
      this.productImportResult = res;
      await this.load();
    } catch (err: any) {
      this.productImportResult = { created: 0, updated: 0, errors: [err?.error?.message || 'Error en importación'] };
    } finally {
      this.productImporting = false;
    }
  }

  async load() {
    this.loading = true;
    try {
      const res: any = await firstValueFrom(this.api.get<any>('/products', {
        search: this.search,
        active: this.active,
      }));
      this.items = (res.data ?? res) as Product[];
    } finally {
      this.loading = false;
    }
  }
}
