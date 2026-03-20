import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BackofficeApi } from '@infra-adapters/services/backoffice-api.service';
import { firstValueFrom } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-banners-form',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
  <div class="d-flex justify-content-between align-items-center mb-3">
    <h2 class="mb-0">{{isNew ? 'Nuevo banner' : 'Editar banner'}}</h2>
    <a class="btn btn-outline-secondary" [routerLink]="['/banners']">Volver</a>
  </div>

  <div class="card">
    <div class="card-body">
      <form [formGroup]="form" (ngSubmit)="save()">
        <div class="row g-3">
          <div class="col-md-8">
            <label class="form-label">Título</label>
            <input class="form-control" formControlName="title" />
          </div>
          <div class="col-md-4">
            <label class="form-label">Activo</label>
            <select class="form-select" formControlName="active">
              <option [ngValue]="true">Sí</option>
              <option [ngValue]="false">No</option>
            </select>
          </div>
          <div class="col-md-12">
            <label class="form-label">Imagen del banner</label>
            <div class="d-flex gap-2 align-items-center">
              <input type="file" class="form-control" accept="image/*" (change)="onImageSelected($event)" />
              <span *ngIf="uploading" class="text-muted small">Subiendo...</span>
            </div>
            <div *ngIf="imagePreview" class="mt-2">
              <img [src]="imagePreview" alt="Preview" style="max-height:100px; border-radius:4px;" />
            </div>
            <input type="hidden" formControlName="image_url" />
          </div>
          <div class="col-md-12">
            <label class="form-label">URL destino</label>
            <input class="form-control" formControlName="target_url" />
          </div>
          <div class="col-md-6">
            <label class="form-label">Fecha inicio</label>
            <input type="datetime-local" class="form-control" formControlName="starts_at" />
          </div>
          <div class="col-md-6">
            <label class="form-label">Fecha término</label>
            <input type="datetime-local" class="form-control" formControlName="ends_at" />
          </div>
        </div>

        <hr class="my-3" />
        <h6>Temporizador / Countdown (opcional)</h6>
        <p class="text-muted small">Configure un reloj en cuenta regresiva para ofertas por tiempo limitado.</p>
        <div class="row g-3">
          <div class="col-md-6">
            <label class="form-label">Horas de countdown</label>
            <input type="number" class="form-control" formControlName="countdown_hours" min="1" placeholder="Ej: 24" />
            <small class="text-muted">Se calcula desde el momento de guardar</small>
          </div>
          <div class="col-md-6">
            <label class="form-label">O fecha/hora de fin del countdown</label>
            <input type="datetime-local" class="form-control" formControlName="countdown_ends_at" />
          </div>
        </div>

        <div class="mt-3">
          <button class="btn btn-primary" type="submit" [disabled]="saving || form.invalid || uploading">{{saving?'Guardando...':'Guardar'}}</button>
        </div>
      </form>
    </div>
  </div>
  `
})
export class BannersFormComponent {
  private fb = inject(FormBuilder);
  private api = inject(BackofficeApi);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  saving = false;
  uploading = false;
  isNew = true;
  id?: number;
  imagePreview: string | null = null;

  form = this.fb.group({
    title: ['', Validators.required],
    image_url: [''],
    target_url: [''],
    starts_at: [''],
    ends_at: [''],
    active: [true],
    countdown_hours: [null as number | null],
    countdown_ends_at: [''],
  });

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.isNew = !id;
    if (id) {
      this.id = Number(id);
      const b: any = await firstValueFrom(this.api.get<any>(`/banners/${this.id}`));
      this.form.patchValue({
        title: b.title,
        image_url: b.image_url ?? '',
        target_url: b.target_url ?? '',
        starts_at: b.starts_at ? b.starts_at.substring(0, 16) : '',
        ends_at: b.ends_at ? b.ends_at.substring(0, 16) : '',
        active: !!b.active,
        countdown_hours: b.countdown_hours ?? null,
        countdown_ends_at: b.countdown_ends_at ? b.countdown_ends_at.substring(0, 16) : '',
      });
      if (b.image_url) this.imagePreview = b.image_url;
    }
  }

  async onImageSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];
    this.uploading = true;
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('folder', 'banners');
      const res: any = await firstValueFrom(this.api.post('/upload', fd));
      const url = res.url || res.path || '';
      this.form.patchValue({ image_url: url });
      this.imagePreview = url;
    } catch (e) {
      alert('Error al subir la imagen');
    }
    this.uploading = false;
  }

  async save() {
    this.saving = true;
    try {
      const v = this.form.value;
      const payload: any = {
        title: v.title,
        image_url: v.image_url || null,
        target_url: v.target_url || null,
        starts_at: v.starts_at || null,
        ends_at: v.ends_at || null,
        active: !!v.active,
        countdown_hours: v.countdown_hours || null,
        countdown_ends_at: v.countdown_ends_at || null,
      };
      if (this.isNew) await firstValueFrom(this.api.post('/banners', payload));
      else await firstValueFrom(this.api.put(`/banners/${this.id}`, payload));
      this.router.navigate(['/banners']);
    } finally {
      this.saving = false;
    }
  }
}
