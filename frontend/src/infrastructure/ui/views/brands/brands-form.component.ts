import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BackofficeApi } from '@infra-adapters/services/backoffice-api.service';
import { firstValueFrom } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-brands-form',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
  <div class="d-flex justify-content-between align-items-center mb-3">
    <h2 class="mb-0">{{isNew ? 'Nueva marca' : 'Editar marca'}}</h2>
    <a class="btn btn-outline-secondary" [routerLink]="['/brands']">Volver</a>
  </div>
  <div class="card">
    <div class="card-body">
      <form [formGroup]="form" (ngSubmit)="save()">
        <div class="row g-3">
          <div class="col-md-6">
            <label class="form-label">Nombre</label>
            <input class="form-control" formControlName="name" />
          </div>
          <div class="col-md-6">
            <label class="form-label">Estado</label>
            <select class="form-select" formControlName="active">
              <option [ngValue]="true">Activo</option>
              <option [ngValue]="false">Inactivo</option>
            </select>
          </div>
          <div class="col-12">
            <label class="form-label">Descripción</label>
            <textarea class="form-control" formControlName="description" rows="3"></textarea>
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
export class BrandsFormComponent {
  private fb = inject(FormBuilder);
  private api = inject(BackofficeApi);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  saving = false;
  isNew = true;
  id?: number;

  form = this.fb.group({
    name: ['', Validators.required],
    description: [''],
    active: [true],
  });

  ngOnInit(): void {
    const paramId = this.route.snapshot.paramMap.get('id');
    if (paramId && paramId !== 'new') {
      this.isNew = false;
      this.id = +paramId;
      this.loadBrand();
    }
  }

  async loadBrand(): Promise<void> {
    try {
      const b: any = await firstValueFrom(this.api.get('/brands/' + this.id));
      this.form.patchValue({
        name: b.name,
        description: b.description || '',
        active: !!b.active,
      });
    } catch (e) { console.error(e); }
  }

  async save(): Promise<void> {
    this.saving = true;
    try {
      const data = this.form.value;
      if (this.isNew) {
        await firstValueFrom(this.api.post('/brands', data));
      } else {
        await firstValueFrom(this.api.put('/brands/' + this.id, data));
      }
      this.router.navigate(['/brands']);
    } catch (e: any) {
      alert(e?.error?.message || 'Error al guardar');
    }
    this.saving = false;
  }
}
