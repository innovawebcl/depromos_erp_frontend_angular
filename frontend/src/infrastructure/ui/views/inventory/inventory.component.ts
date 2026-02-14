import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { BackofficeApi } from '@infra-adapters/services/backoffice-api.service';
import { firstValueFrom } from 'rxjs';

type Row = { productId: number; code: string; name: string; size: string; stock: number; barcode?: string | null; active: boolean };

@Component({
  standalone: true,
  selector: 'app-inventory',
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
  <div class="d-flex justify-content-between align-items-center mb-3">
    <h2 class="mb-0">Inventario</h2>
    <a class="btn btn-outline-primary" [routerLink]="['/products']">Ir a Productos</a>
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
      <div class="small text-muted mt-2">
        * El stock se edita desde <b>Productos</b> (por talla). Aquí se muestran alertas de quiebre/sobreventa en tiempo real según datos del backend.
      </div>
    </div>
  </div>

  <div class="card">
    <div class="card-body">
      <div *ngIf="loading" class="text-muted">Cargando...</div>
      <div class="table-responsive" *ngIf="!loading">
        <table class="table table-sm align-middle">
          <thead><tr><th>Producto</th><th>Talla</th><th>Barcode</th><th>Stock</th><th>Estado</th><th></th></tr></thead>
          <tbody>
            <tr *ngFor="let r of filtered">
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
              <td><span class="badge" [class.bg-success]="r.active" [class.bg-secondary]="!r.active">{{r.active?'Activa':'Inactiva'}}</span></td>
              <td class="text-end"><a class="btn btn-sm btn-outline-primary" [routerLink]="['/products', r.productId]">Editar</a></td>
            </tr>
            <tr *ngIf="filtered.length===0"><td colspan="6" class="text-muted">Sin resultados</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
  `
})
export class InventoryComponent {
  private api = inject(BackofficeApi);

  loading = false;
  rows: Row[] = [];
  filtered: Row[] = [];
  search = '';
  lowStock = 3;

  async ngOnInit() {
    await this.load();
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
