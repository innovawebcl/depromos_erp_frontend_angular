import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BackofficeApi } from '@infra-adapters/services/backoffice-api.service';
import { firstValueFrom } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-discount-codes-form',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
  <div class="d-flex justify-content-between align-items-center mb-3">
    <h2 class="mb-0">{{isNew ? 'Nuevo código de descuento' : 'Editar código'}}</h2>
    <a class="btn btn-outline-secondary" [routerLink]="['/discount-codes']">Volver</a>
  </div>
  <div class="card">
    <div class="card-body">
      <form [formGroup]="form" (ngSubmit)="save()">
        <div class="row g-3">
          <div class="col-md-4">
            <label class="form-label">Código</label>
            <input class="form-control text-uppercase" formControlName="code" placeholder="VERANO2026" />
          </div>
          <div class="col-md-8">
            <label class="form-label">Nombre</label>
            <input class="form-control" formControlName="name" placeholder="Descuento de verano" />
          </div>
          <div class="col-md-4">
            <label class="form-label">Tipo</label>
            <select class="form-select" formControlName="type">
              <option value="percentage">Porcentaje (%)</option>
              <option value="fixed">Monto fijo ($)</option>
            </select>
          </div>
          <div class="col-md-4">
            <label class="form-label">Valor</label>
            <input type="number" class="form-control" formControlName="value" min="0" />
          </div>
          <div class="col-md-4">
            <label class="form-label">Límite de usos</label>
            <input type="number" class="form-control" formControlName="max_uses" min="1" placeholder="Ilimitado" />
          </div>
          <div class="col-md-4">
            <label class="form-label">Fecha inicio</label>
            <input type="date" class="form-control" formControlName="starts_at" />
          </div>
          <div class="col-md-4">
            <label class="form-label">Fecha término</label>
            <input type="date" class="form-control" formControlName="ends_at" />
          </div>
          <div class="col-md-4">
            <label class="form-label">Activo</label>
            <select class="form-select" formControlName="active">
              <option [ngValue]="true">Sí</option>
              <option [ngValue]="false">No</option>
            </select>
          </div>
        </div>
        <div class="mt-3">
          <button class="btn btn-primary" type="submit" [disabled]="saving || form.invalid">
            {{saving ? 'Guardando...' : 'Guardar'}}
          </button>
        </div>
      </form>
    </div>
  </div>
  `
})
export class DiscountCodesFormComponent {
  private fb = inject(FormBuilder);
  private api = inject(BackofficeApi);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  saving = false;
  isNew = true;
  id?: number;

  form = this.fb.group({
    code: ['', Validators.required],
    name: ['', Validators.required],
    type: ['percentage' as 'percentage' | 'fixed', Validators.required],
    value: [0, [Validators.required, Validators.min(0)]],
    starts_at: [''],
    ends_at: [''],
    max_uses: [null as number | null],
    active: [true],
  });

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.isNew = !id;
    if (!this.isNew) {
      this.id = Number(id);
      const c: any = await firstValueFrom(this.api.get<any>(`/discount-codes/${this.id}`));
      this.form.patchValue({
        code: c.code,
        name: c.name,
        type: c.type,
        value: c.value,
        starts_at: c.starts_at ? c.starts_at.substring(0, 10) : '',
        ends_at: c.ends_at ? c.ends_at.substring(0, 10) : '',
        max_uses: c.max_uses,
        active: !!c.active,
      });
    }
  }

  async save() {
    this.saving = true;
    try {
      const raw = this.form.getRawValue();
      const payload: any = {
        code: raw.code?.toUpperCase(),
        name: raw.name,
        type: raw.type,
        value: raw.value,
        starts_at: raw.starts_at || null,
        ends_at: raw.ends_at || null,
        max_uses: raw.max_uses || null,
        active: raw.active,
      };
      if (this.isNew) {
        await firstValueFrom(this.api.post('/discount-codes', payload));
      } else {
        await firstValueFrom(this.api.put(`/discount-codes/${this.id}`, payload));
      }
      this.router.navigate(['/discount-codes']);
    } finally { this.saving = false; }
  }
}
