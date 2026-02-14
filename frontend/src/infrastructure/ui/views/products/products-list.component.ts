import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BackofficeApi } from '@infra-adapters/services/backoffice-api.service';
import { firstValueFrom } from 'rxjs';

type ProductSize = { size: string; barcode?: string | null; stock: number; active: boolean };
type Product = { id: number; code: string; name: string; price: number; active: boolean; sizes: ProductSize[] };

@Component({
  standalone: true,
  selector: 'app-products-list',
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
  <div class="d-flex justify-content-between align-items-center mb-3">
    <h2 class="mb-0">Productos</h2>
    <a class="btn btn-primary" [routerLink]="['/products/new']">Crear producto</a>
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
              <th>ID</th>
              <th>Código</th>
              <th>Nombre</th>
              <th>Precio</th>
              <th>Stock</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let p of items">
              <td>{{p.id}}</td>
              <td>{{p.code}}</td>
              <td>{{p.name}}</td>
              <td>{{p.price | number:'1.0-0'}}</td>
              <td>{{stockTotal(p)}}</td>
              <td>
                <span class="badge" [class.bg-success]="p.active" [class.bg-secondary]="!p.active">{{p.active?'Activo':'Inactivo'}}</span>
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

  items: Product[] = [];
  loading = false;
  search = '';
  active: '' | '1' | '0' = '';

  async ngOnInit() {
    await this.load();
  }

  stockTotal(p: Product): number {
    return (p.sizes || []).reduce((acc, s) => acc + (s.stock ?? 0), 0);
  }

  async load() {
    this.loading = true;
    try {
      const res: any = await firstValueFrom(this.api.get<any>('/products', {
        search: this.search,
        active: this.active,
      }));
      // backend usa paginate => {data:[], ...}
      this.items = (res.data ?? res) as Product[];
    } finally {
      this.loading = false;
    }
  }
}
