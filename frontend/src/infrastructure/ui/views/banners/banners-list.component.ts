import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BackofficeApi } from '@infra-adapters/services/backoffice-api.service';
import { firstValueFrom } from 'rxjs';

type Banner = { id: number; title: string; image_url: string; target_url?: string | null; active: boolean; starts_at?: string | null; ends_at?: string | null };

@Component({
  standalone: true,
  selector: 'app-banners-list',
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
  <div class="d-flex justify-content-between align-items-center mb-3">
    <h2 class="mb-0">Banners</h2>
    <a class="btn btn-primary" [routerLink]="['/banners/new']">Crear banner</a>
  </div>

  <div class="card">
    <div class="card-body">
      <div *ngIf="loading" class="text-muted">Cargando...</div>
      <div class="table-responsive" *ngIf="!loading">
        <table class="table table-sm align-middle">
          <thead>
            <tr>
              <th>ID</th><th>Título</th><th>Activo</th><th>Vigencia</th><th></th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let b of items">
              <td>{{b.id}}</td>
              <td>{{b.title}}</td>
              <td><span class="badge" [class.bg-success]="b.active" [class.bg-secondary]="!b.active">{{b.active?'Sí':'No'}}</span></td>
              <td>{{b.starts_at || '-'}} → {{b.ends_at || '-'}}</td>
              <td class="text-end"><a class="btn btn-sm btn-outline-primary" [routerLink]="['/banners', b.id]">Editar</a></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
  `
})
export class BannersListComponent {
  private api = inject(BackofficeApi);
  items: Banner[] = [];
  loading = false;

  async ngOnInit() { await this.load(); }

  async load() {
    this.loading = true;
    try {
      const res: any = await firstValueFrom(this.api.get<any>('/banners'));
      this.items = (res.data ?? res) as Banner[];
    } finally {
      this.loading = false;
    }
  }
}
