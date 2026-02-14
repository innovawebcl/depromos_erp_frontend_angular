import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BackofficeApi } from '@infra-adapters/services/backoffice-api.service';
import { firstValueFrom } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-couriers-form',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
  <div class="d-flex justify-content-between align-items-center mb-3">
    <h2 class="mb-0">{{isNew ? 'Nuevo repartidor' : 'Editar repartidor'}}</h2>
    <a class="btn btn-outline-secondary" [routerLink]="['/couriers']">Volver</a>
  </div>

  <div class="card">
    <div class="card-body">
      <form [formGroup]="form" (ngSubmit)="save()">
        <div class="row g-3">
          <div class="col-md-8">
            <label class="form-label">Nombre</label>
            <input class="form-control" formControlName="name" />
          </div>
          <div class="col-md-4">
            <label class="form-label">Activo</label>
            <select class="form-select" formControlName="active">
              <option [ngValue]="true">Sí</option>
              <option [ngValue]="false">No</option>
            </select>
          </div>
          <div class="col-md-6">
            <label class="form-label">Teléfono</label>
            <input class="form-control" formControlName="phone" />
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
export class CouriersFormComponent {
  private fb = inject(FormBuilder);
  private api = inject(BackofficeApi);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  saving = false;
  isNew = true;
  id?: number;

  form = this.fb.group({
    name: ['', Validators.required],
    phone: [''],
    active: [true],
  });

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.isNew = !id;
    if (id) {
      this.id = Number(id);
      const c: any = await firstValueFrom(this.api.get<any>(`/couriers/${this.id}`));
      this.form.patchValue({ name: c.name, phone: c.phone ?? '', active: !!c.active });
    }
  }

  async save() {
    this.saving = true;
    try {
      const v = this.form.value;
      const payload = { name: v.name, phone: v.phone || null, active: !!v.active };
      if (this.isNew) await firstValueFrom(this.api.post('/couriers', payload));
      else await firstValueFrom(this.api.put(`/couriers/${this.id}`, payload));
      this.router.navigate(['/couriers']);
    } finally {
      this.saving = false;
    }
  }
}
