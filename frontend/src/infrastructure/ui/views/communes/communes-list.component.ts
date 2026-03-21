import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BackofficeApi } from '@infra-adapters/services/backoffice-api.service';
import { environment } from '@infra-env/environment';
import { firstValueFrom } from 'rxjs';

type Commune = { id: number; name: string; active: boolean; current_tariff?: number | null };

@Component({
  standalone: true,
  selector: 'app-communes-list',
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
  <div class="d-flex justify-content-between align-items-center mb-3">
    <h2 class="mb-0">Tarifas por comuna</h2>
    <div class="d-flex gap-2">
      <button class="btn btn-outline-success" (click)="showImportModal=true">Carga masiva tarifas</button>
    </div>
  </div>

  <!-- Modal de importación de tarifas -->
  <div *ngIf="showImportModal" class="card mb-3 border-success">
    <div class="card-header bg-primary text-white d-flex justify-content-between">
      <strong>Carga masiva de tarifas</strong>
      <button class="btn btn-sm btn-light" (click)="showImportModal=false">&times;</button>
    </div>
    <div class="card-body">
      <p class="mb-2">Suba un archivo CSV con las columnas: <code>commune_id, price</code></p>
      <p class="text-muted small">Se creará una nueva tarifa vigente para cada comuna indicada.</p>
      <input type="file" class="form-control mb-2" accept=".csv,.txt" (change)="onFileSelected($event)" />
      <button class="btn btn-success" [disabled]="!selectedFile || importing" (click)="importTariffs()">
        {{importing ? 'Importando...' : 'Importar tarifas'}}
      </button>
      <div *ngIf="importResult" class="mt-2 alert" [class.alert-success]="!importResult.errors?.length" [class.alert-warning]="importResult.errors?.length">
        <strong>{{importResult.updated ?? 0}} tarifas actualizadas</strong>
        <div *ngIf="importResult.errors?.length">
          <small *ngFor="let e of importResult.errors" class="d-block text-danger">{{e}}</small>
        </div>
      </div>
    </div>
  </div>

  <div class="card">
    <div class="card-body">
      <div *ngIf="loading" class="text-muted">Cargando...</div>
      <div class="table-responsive" *ngIf="!loading">
        <table class="table table-sm align-middle">
          <thead><tr><th>ID</th><th>Comuna</th><th>Estado</th><th>Tarifa vigente</th><th></th></tr></thead>
          <tbody>
            <tr *ngFor="let c of items">
              <td>{{c.id}}</td>
              <td class="fw-semibold">{{c.name}}</td>
              <td>
                <button class="btn btn-sm" [class.btn-success]="c.active" [class.btn-secondary]="!c.active" (click)="toggle(c)" [disabled]="toggling">
                  {{c.active ? 'Activa' : 'Inactiva'}}
                </button>
              </td>
              <td>\${{(c.current_tariff ?? 0) | number:'1.0-0'}}</td>
              <td class="text-end"><a class="btn btn-sm btn-outline-primary" [routerLink]="['/communes', c.id]">Ver histórico</a></td>
            </tr>
            <tr *ngIf="items.length===0">
              <td colspan="5" class="text-center py-3 text-muted">Sin comunas registradas</td>
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
  apiBase = environment.apiUrl;
  items: Commune[] = [];
  loading = false;
  toggling = false;

  // Import
  showImportModal = false;
  selectedFile: File | null = null;
  importing = false;
  importResult: any = null;

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

  async toggle(c: Commune) {
    this.toggling = true;
    try {
      await firstValueFrom(this.api.patch(`/communes/${c.id}/toggle`, {}));
      c.active = !c.active;
    } finally {
      this.toggling = false;
    }
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0] ?? null;
    this.importResult = null;
  }

  async importTariffs() {
    if (!this.selectedFile) return;
    this.importing = true;
    this.importResult = null;
    try {
      const fd = new FormData();
      fd.append('file', this.selectedFile);
      const res = await firstValueFrom(this.api.post<any>('/communes/import-tariffs', fd));
      this.importResult = res;
      await this.load();
    } catch (err: any) {
      this.importResult = { updated: 0, errors: [err?.error?.message || 'Error en importación'] };
    } finally {
      this.importing = false;
    }
  }
}
