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
            <label class="form-label">Imagen (URL)</label>
            <input class="form-control" formControlName="image_url" />
          </div>
          <div class="col-md-12">
            <label class="form-label">URL destino</label>
            <input class="form-control" formControlName="target_url" />
          </div>
          <div class="col-md-6">
            <label class="form-label">Inicio</label>
            <input type="date" class="form-control" formControlName="starts_at" />
          </div>
          <div class="col-md-6">
            <label class="form-label">Término</label>
            <input type="date" class="form-control" formControlName="ends_at" />
          </div>
        </div>

        <div class="mt-3">
          <button class="btn btn-primary" type="submit" [disabled]="saving || form.invalid">{{saving?'Guardando...':'Guardar'}}</button>
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
  isNew = true;
  id?: number;

  form = this.fb.group({
    title: ['', Validators.required],
    image_url: ['', Validators.required],
    target_url: [''],
    starts_at: [''],
    ends_at: [''],
    active: [true],
  });

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.isNew = !id;
    if (id) {
      this.id = Number(id);
      const b: any = await firstValueFrom(this.api.get<any>(`/banners/${this.id}`));
      this.form.patchValue({
        title: b.title,
        image_url: b.image_url,
        target_url: b.target_url ?? '',
        starts_at: (b.starts_at ?? '').substring(0, 10),
        ends_at: (b.ends_at ?? '').substring(0, 10),
        active: !!b.active,
      });
    }
  }

  async save() {
    this.saving = true;
    try {
      const v = this.form.value;
      const payload: any = {
        title: v.title,
        image_url: v.image_url,
        target_url: v.target_url || null,
        starts_at: v.starts_at || null,
        ends_at: v.ends_at || null,
        active: !!v.active,
      };
      if (this.isNew) await firstValueFrom(this.api.post('/banners', payload));
      else await firstValueFrom(this.api.put(`/banners/${this.id}`, payload));
      this.router.navigate(['/banners']);
    } finally {
      this.saving = false;
    }
  }
}
