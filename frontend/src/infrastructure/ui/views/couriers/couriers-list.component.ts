import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BackofficeApi } from '@infra-adapters/services/backoffice-api.service';
import { firstValueFrom } from 'rxjs';

type Courier = { id: number; name: string; phone?: string | null; active: boolean; ratings_avg_rating?: number | null };

@Component({
  standalone: true,
  selector: 'app-couriers-list',
  imports: [CommonModule, RouterLink],
  template: `
  <div class="d-flex justify-content-between align-items-center mb-3">
    <h2 class="mb-0">Repartidores</h2>
    <a class="btn btn-primary" [routerLink]="['/couriers/new']">Crear repartidor</a>
  </div>

  <div class="card">
    <div class="card-body">
      <div *ngIf="loading" class="text-muted">Cargando...</div>
      <div class="table-responsive" *ngIf="!loading">
        <table class="table table-sm align-middle">
          <thead>
            <tr><th>ID</th><th>Nombre</th><th>Teléfono</th><th>Activo</th><th>Rating</th><th></th></tr>
          </thead>
          <tbody>
            <tr *ngFor="let c of items">
              <td>{{c.id}}</td>
              <td>{{c.name}}</td>
              <td>{{c.phone || '-'}}</td>
              <td><span class="badge" [class.bg-success]="c.active" [class.bg-secondary]="!c.active">{{c.active?'Sí':'No'}}</span></td>
              <td>{{(c.ratings_avg_rating ?? 0) | number:'1.1-1'}}</td>
              <td class="text-end">
                <a class="btn btn-sm btn-outline-secondary me-2" [routerLink]="['/couriers', c.id, 'ratings']">Ratings</a>
                <a class="btn btn-sm btn-outline-primary" [routerLink]="['/couriers', c.id]">Editar</a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
  `
})
export class CouriersListComponent {
  private api = inject(BackofficeApi);
  items: Courier[] = [];
  loading = false;

  async ngOnInit() { await this.load(); }

  async load() {
    this.loading = true;
    try {
      const res: any = await firstValueFrom(this.api.get<any>('/couriers'));
      this.items = (res.data ?? res) as Courier[];
    } finally {
      this.loading = false;
    }
  }
}
