import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BackofficeApi } from '@infra-adapters/services/backoffice-api.service';
import { firstValueFrom } from 'rxjs';

type Banner = { id: number; title: string; image_url: string; target_url?: string | null; active: boolean; starts_at?: string | null; ends_at?: string | null; countdown_hours?: number | null; countdown_ends_at?: string | null };

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
              <th>ID</th>
              <th>Título</th>
              <th>Estado</th>
              <th>Vigencia</th>
              <th>Countdown</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let b of items">
              <td>{{b.id}}</td>
              <td class="fw-semibold">{{b.title}}</td>
              <td>
                <span class="badge" [class.badge-active]="b.active" [class.badge-inactive]="!b.active">{{b.active?'Activo':'Inactivo'}}</span>
              </td>
              <td class="small">
                {{formatDate(b.starts_at)}} → {{formatDate(b.ends_at)}}
              </td>
              <td>
                <span *ngIf="b.countdown_hours" class="badge bg-warning text-dark">{{b.countdown_hours}}h</span>
                <span *ngIf="b.countdown_ends_at && !b.countdown_hours" class="badge bg-info text-white">Hasta {{formatDate(b.countdown_ends_at)}}</span>
                <span *ngIf="!b.countdown_hours && !b.countdown_ends_at" class="text-muted">—</span>
              </td>
              <td class="text-end">
                <a class="btn btn-sm btn-outline-primary me-1" [routerLink]="['/banners', b.id]">Editar</a>
                <button class="btn btn-sm btn-outline-danger" (click)="remove(b)">Eliminar</button>
              </td>
            </tr>
            <tr *ngIf="items.length===0">
              <td colspan="6" class="text-center py-3 text-muted">Sin banners registrados</td>
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

  formatDate(d: string | null | undefined): string {
    if (!d) return '—';
    try {
      const dt = new Date(d);
      return dt.toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch { return d; }
  }

  async remove(b: Banner): Promise<void> {
    if (!confirm('¿Eliminar banner "' + b.title + '"?')) return;
    try {
      await firstValueFrom(this.api.delete('/banners/' + b.id));
      this.items = this.items.filter(x => x.id !== b.id);
    } catch { alert('Error al eliminar'); }
  }
}
