import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BackofficeApi } from '@infra-adapters/services/backoffice-api.service';
import { firstValueFrom } from 'rxjs';

type PushNotification = {
  id: number; title: string; description: string; status: string;
  sent_at?: string; recipients_count?: number; created_at: string;
  creator?: { id: number; name: string };
};

@Component({
  standalone: true,
  selector: 'app-push-notifications-list',
  imports: [CommonModule, RouterLink],
  template: `
  <div class="d-flex justify-content-between align-items-center mb-3">
    <h2 class="mb-0">Notificaciones Push</h2>
    <a class="btn btn-primary" [routerLink]="['/push-notifications/new']">Nueva notificación</a>
  </div>

  <div class="card">
    <div class="card-body">
      <div *ngIf="loading" class="text-muted">Cargando...</div>
      <div *ngIf="!loading && items.length===0" class="text-muted">Sin notificaciones</div>
      <div class="table-responsive" *ngIf="!loading && items.length>0">
        <table class="table table-sm align-middle">
          <thead>
            <tr>
              <th>ID</th>
              <th>Título</th>
              <th>Estado</th>
              <th>Enviada</th>
              <th>Destinatarios</th>
              <th>Creada por</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let n of items">
              <td>{{n.id}}</td>
              <td>{{n.title}}</td>
              <td>
                <span class="badge" [class.bg-success]="n.status==='sent'" [class.bg-warning]="n.status==='draft'">
                  {{n.status === 'sent' ? 'Enviada' : 'Borrador'}}
                </span>
              </td>
              <td>{{n.sent_at ? (n.sent_at | date:'dd/MM/yy HH:mm') : '—'}}</td>
              <td>{{n.recipients_count ?? '—'}}</td>
              <td>{{n.creator?.name ?? '—'}}</td>
              <td class="text-end">
                <a *ngIf="n.status==='draft'" class="btn btn-sm btn-outline-primary me-1" [routerLink]="['/push-notifications', n.id]">Editar</a>
                <button *ngIf="n.status==='draft'" class="btn btn-sm btn-success me-1" (click)="send(n)" [disabled]="sending">Enviar</button>
                <button *ngIf="n.status==='draft'" class="btn btn-sm btn-outline-danger" (click)="remove(n)">Eliminar</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
  `
})
export class PushNotificationsListComponent {
  private api = inject(BackofficeApi);
  items: PushNotification[] = [];
  loading = false;
  sending = false;

  async ngOnInit() { await this.load(); }

  async load() {
    this.loading = true;
    try {
      const res: any = await firstValueFrom(this.api.get<any>('/push-notifications'));
      this.items = (res.data ?? res) as PushNotification[];
    } finally { this.loading = false; }
  }

  async send(n: PushNotification) {
    if (!confirm(`¿Enviar notificación "${n.title}" a todos los clientes?`)) return;
    this.sending = true;
    try {
      await firstValueFrom(this.api.post(`/push-notifications/${n.id}/send`, {}));
      await this.load();
    } finally { this.sending = false; }
  }

  async remove(n: PushNotification) {
    if (!confirm(`¿Eliminar notificación "${n.title}"?`)) return;
    await firstValueFrom(this.api.delete(`/push-notifications/${n.id}`));
    await this.load();
  }
}
