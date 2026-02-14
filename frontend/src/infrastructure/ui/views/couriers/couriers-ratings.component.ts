import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { BackofficeApi } from '@infra-adapters/services/backoffice-api.service';
import { firstValueFrom } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-couriers-ratings',
  imports: [CommonModule, RouterLink],
  template: `
  <div class="d-flex justify-content-between align-items-center mb-3">
    <h2 class="mb-0">Calificaciones repartidor</h2>
    <a class="btn btn-outline-secondary" [routerLink]="['/couriers']">Volver</a>
  </div>

  <div class="card">
    <div class="card-body">
      <div *ngIf="loading" class="text-muted">Cargando...</div>
      <ng-container *ngIf="!loading">
        <div class="mb-2"><b>{{courier?.name}}</b> — Promedio: {{avg | number:'1.1-1'}}</div>
        <div class="table-responsive">
          <table class="table table-sm">
            <thead><tr><th>Rating</th><th>Comentario</th><th>Fecha</th></tr></thead>
            <tbody>
              <tr *ngFor="let r of ratings">
                <td>{{r.rating}}</td>
                <td>{{r.comment || '-'}}</td>
                <td>{{r.created_at | date:'short'}}</td>
              </tr>
              <tr *ngIf="ratings.length===0"><td colspan="3" class="text-muted">Sin calificaciones</td></tr>
            </tbody>
          </table>
        </div>
      </ng-container>
    </div>
  </div>
  `
})
export class CouriersRatingsComponent {
  private api = inject(BackofficeApi);
  private route = inject(ActivatedRoute);

  loading = false;
  courier: any;
  ratings: any[] = [];
  avg = 0;

  async ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loading = true;
    try {
      const c: any = await firstValueFrom(this.api.get<any>(`/couriers/${id}`));
      this.courier = c;
      this.ratings = c.ratings ?? [];
      this.avg = Number(c.ratings_avg_rating ?? 0);
    } finally {
      this.loading = false;
    }
  }
}
