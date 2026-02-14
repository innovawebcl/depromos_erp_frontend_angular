import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BackofficeApi } from '@infra-adapters/services/backoffice-api.service';
import { firstValueFrom } from 'rxjs';

type Commune = { id: number; name: string; active: boolean; current_tariff?: number | null };

@Component({
  standalone: true,
  selector: 'app-communes-list',
  imports: [CommonModule, RouterLink],
  template: `
  <div class="d-flex justify-content-between align-items-center mb-3">
    <h2 class="mb-0">Tarifas por comuna</h2>
  </div>

  <div class="card">
    <div class="card-body">
      <div *ngIf="loading" class="text-muted">Cargando...</div>
      <div class="table-responsive" *ngIf="!loading">
        <table class="table table-sm align-middle">
          <thead><tr><th>ID</th><th>Comuna</th><th>Activa</th><th>Tarifa vigente</th><th></th></tr></thead>
          <tbody>
            <tr *ngFor="let c of items">
              <td>{{c.id}}</td>
              <td>{{c.name}}</td>
              <td><span class="badge" [class.bg-success]="c.active" [class.bg-secondary]="!c.active">{{c.active?'Sí':'No'}}</span></td>
              <td>{{(c.current_tariff ?? 0) | number:'1.0-0'}}</td>
              <td class="text-end"><a class="btn btn-sm btn-outline-primary" [routerLink]="['/communes', c.id]">Ver histórico</a></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
  `
})
export class CommunesListComponent {
  private api = inject(BackofficeApi);
  items: Commune[] = [];
  loading = false;

  async ngOnInit() { await this.load(); }

  async load() {
    this.loading = true;
    try {
      const res: any = await firstValueFrom(this.api.get<any>('/communes'));
      this.items = (res.data ?? res) as Commune[];
    } finally {
      this.loading = false;
    }
  }
}
