import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { BackofficeApi } from '@infra-adapters/services/backoffice-api.service';
import { firstValueFrom } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-brands-list',
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
  <div class="d-flex justify-content-between align-items-center mb-3">
    <h2 class="mb-0">Marcas</h2>
    <a class="btn btn-primary" [routerLink]="['/brands/new']">Crear marca</a>
  </div>
  <div class="card">
    <div class="card-body p-0">
      <div *ngIf="loading" class="p-3 text-muted">Cargando...</div>
      <div class="table-responsive" *ngIf="!loading">
        <table class="table table-hover mb-0 align-middle">
          <thead>
            <tr>
              <th style="width:80px">ID</th>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Estado</th>
              <th style="width:160px"></th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let b of items">
              <td>#{{b.id}}</td>
              <td class="fw-semibold">{{b.name}}</td>
              <td class="text-medium-emphasis">{{b.description || '—'}}</td>
              <td>
                <span class="badge" [class.badge-active]="b.active" [class.badge-inactive]="!b.active">
                  {{b.active ? 'Activo' : 'Inactivo'}}
                </span>
              </td>
              <td class="text-end">
                <a class="btn btn-sm btn-outline-primary me-1" [routerLink]="['/brands', b.id]">Editar</a>
                <button class="btn btn-sm btn-outline-danger" (click)="remove(b)" [disabled]="deleting">Eliminar</button>
              </td>
            </tr>
            <tr *ngIf="items.length===0">
              <td colspan="5" class="text-center py-4 text-medium-emphasis">Sin marcas registradas</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div class="card-footer d-flex justify-content-between align-items-center" *ngIf="meta">
      <div class="text-medium-emphasis small">Página {{meta.current_page}} de {{meta.last_page}} — Total {{meta.total}}</div>
      <div class="btn-group">
        <button class="btn btn-outline-secondary" (click)="goPage(page-1)" [disabled]="page<=1">Anterior</button>
        <button class="btn btn-outline-secondary" (click)="goPage(page+1)" [disabled]="page>=meta.last_page">Siguiente</button>
      </div>
    </div>
  </div>
  `
})
export class BrandsListComponent implements OnInit {
  private api = inject(BackofficeApi);
  loading = false;
  deleting = false;
  items: any[] = [];
  meta: any;
  page = 1;

  ngOnInit(): void { this.load(); }

  async load(): Promise<void> {
    this.loading = true;
    try {
      const res: any = await firstValueFrom(this.api.get('/brands?page=' + this.page));
      this.items = res.data || res;
      this.meta = res.meta;
    } catch (e) { console.error(e); }
    this.loading = false;
  }

  goPage(p: number): void { this.page = p; this.load(); }

  async remove(b: any): Promise<void> {
    if (!confirm('¿Eliminar marca "' + b.name + '"?')) return;
    this.deleting = true;
    try {
      await firstValueFrom(this.api.delete('/brands/' + b.id));
      this.items = this.items.filter(x => x.id !== b.id);
    } catch (e) { alert('Error al eliminar'); }
    this.deleting = false;
  }
}
