import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BackofficeApi } from '@infra-adapters/services/backoffice-api.service';
import { firstValueFrom } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-push-notifications-form',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
  <div class="d-flex justify-content-between align-items-center mb-3">
    <h2 class="mb-0">{{isNew ? 'Nueva notificación' : 'Editar notificación'}}</h2>
    <a class="btn btn-outline-secondary" [routerLink]="['/push-notifications']">Volver</a>
  </div>
  <div class="card">
    <div class="card-body">
      <form [formGroup]="form" (ngSubmit)="save()">
        <div class="row g-3">
          <div class="col-md-12">
            <label class="form-label">Título</label>
            <input class="form-control" formControlName="title" placeholder="Título de la notificación" />
          </div>
          <div class="col-md-12">
            <label class="form-label">Descripción</label>
            <textarea class="form-control" rows="4" formControlName="description" placeholder="Contenido de la notificación push"></textarea>
          </div>
        </div>
        <div class="mt-3 d-flex gap-2">
          <button class="btn btn-primary" type="submit" [disabled]="saving || form.invalid">
            {{saving ? 'Guardando...' : 'Guardar borrador'}}
          </button>
          <button *ngIf="!isNew" type="button" class="btn btn-success" (click)="saveAndSend()" [disabled]="saving || form.invalid">
            Guardar y enviar
          </button>
        </div>
      </form>
    </div>
  </div>
  `
})
export class PushNotificationsFormComponent {
  private fb = inject(FormBuilder);
  private api = inject(BackofficeApi);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  saving = false;
  isNew = true;
  id?: number;

  form = this.fb.group({
    title: ['', Validators.required],
    description: ['', Validators.required],
  });

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.isNew = !id;
    if (!this.isNew) {
      this.id = Number(id);
      const n: any = await firstValueFrom(this.api.get<any>(`/push-notifications/${this.id}`));
      this.form.patchValue({ title: n.title, description: n.description });
    }
  }

  async save() {
    this.saving = true;
    try {
      const raw = this.form.getRawValue();
      if (this.isNew) {
        await firstValueFrom(this.api.post('/push-notifications', raw));
      } else {
        await firstValueFrom(this.api.put(`/push-notifications/${this.id}`, raw));
      }
      this.router.navigate(['/push-notifications']);
    } finally { this.saving = false; }
  }

  async saveAndSend() {
    this.saving = true;
    try {
      const raw = this.form.getRawValue();
      await firstValueFrom(this.api.put(`/push-notifications/${this.id}`, raw));
      if (confirm('¿Enviar esta notificación a todos los clientes ahora?')) {
        await firstValueFrom(this.api.post(`/push-notifications/${this.id}/send`, {}));
      }
      this.router.navigate(['/push-notifications']);
    } finally { this.saving = false; }
  }
}
