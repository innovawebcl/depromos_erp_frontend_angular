import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BackofficeApi } from '@infra-adapters/services/backoffice-api.service';
import { firstValueFrom } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-communes-detail',
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
  <div class="d-flex justify-content-between align-items-center mb-3">
    <h2 class="mb-0">Histórico de tarifas</h2>
    <a class="btn btn-outline-secondary" [routerLink]="['/communes']">Volver</a>
  </div>

  <div class="card mb-3">
    <div class="card-body">
      <div class="row g-2 align-items-end">
        <div class="col-md-6">
          <div class="text-muted small">Comuna</div>
          <div class="h5 mb-0">{{commune?.name || '-'}}</div>
          <div class="text-muted small mt-1">Tarifa actual: <strong>\${{(commune?.current_tariff ?? 0) | number:'1.0-0'}}</strong></div>
        </div>
        <div class="col-md-3">
          <label class="form-label">Nueva tarifa ($)</label>
          <input type="number" class="form-control" [(ngModel)]="newAmount" min="0" />
        </div>
        <div class="col-md-3">
          <button class="btn btn-primary w-100" (click)="saveTariff()" [disabled]="saving">{{saving?'Guardando...':'Guardar tarifa'}}</button>
        </div>
      </div>
    </div>
  </div>

  <div class="card">
    <div class="card-body">
      <div *ngIf="loading" class="text-muted">Cargando...</div>
      <div class="table-responsive" *ngIf="!loading">
        <table class="table table-sm">
          <thead><tr><th>Monto</th><th>Vigente desde</th></tr></thead>
          <tbody>
            <tr *ngFor="let t of history">
              <td>\${{t.amount | number:'1.0-0'}}</td>
              <td>{{formatDate(t.created_at)}}</td>
            </tr>
            <tr *ngIf="history.length===0"><td colspan="2" class="text-muted text-center py-3">Sin histórico de tarifas</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
  `
})
export class CommunesDetailComponent {
  private api = inject(BackofficeApi);
  private route = inject(ActivatedRoute);

  id!: number;
  loading = false;
  saving = false;
  commune: any;
  history: any[] = [];
  newAmount = 0;

  async ngOnInit() {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    await this.load();
  }

  async load() {
    this.loading = true;
    try {
      const res: any = await firstValueFrom(this.api.get<any>(`/communes/${this.id}/tariffs`));
      this.commune = res.commune;
      this.history = res.history ?? [];
      this.newAmount = Number(this.commune?.current_tariff ?? 0);
    } finally {
      this.loading = false;
    }
  }

  async saveTariff() {
    this.saving = true;
    try {
      await firstValueFrom(this.api.post(`/communes/${this.id}/tariffs`, { amount: Number(this.newAmount) }));
      await this.load();
    } finally {
      this.saving = false;
    }
  }

  formatDate(d: string | null | undefined): string {
    if (!d) return '—';
    try {
      return new Date(d).toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch { return d; }
  }
}
