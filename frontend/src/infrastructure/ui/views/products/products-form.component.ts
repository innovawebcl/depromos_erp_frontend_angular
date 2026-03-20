import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BackofficeApi } from '@infra-adapters/services/backoffice-api.service';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

type Brand = { id: number; name: string };

@Component({
  standalone: true,
  selector: 'app-products-form',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
  <div class="d-flex justify-content-between align-items-center mb-3">
    <h2 class="mb-0">{{isNew ? 'Nuevo producto' : 'Editar producto'}}</h2>
    <a class="btn btn-outline-secondary" [routerLink]="['/products']">Volver</a>
  </div>

  <div class="card">
    <div class="card-body">
      <form [formGroup]="form" (ngSubmit)="save()">
        <div class="row g-3">
          <div class="col-md-3" *ngIf="isNew">
            <label class="form-label">Código</label>
            <input class="form-control" formControlName="code" />
          </div>
          <div class="col-md-5">
            <label class="form-label">Nombre</label>
            <input class="form-control" formControlName="name" />
          </div>
          <div class="col-md-4">
            <label class="form-label">Marca</label>
            <select class="form-select" formControlName="brand_id">
              <option [ngValue]="null">Sin marca</option>
              <option *ngFor="let b of brands" [ngValue]="b.id">{{b.name}}</option>
            </select>
          </div>
          <div class="col-md-4">
            <label class="form-label">Precio base</label>
            <input type="number" class="form-control" formControlName="price" min="0" />
          </div>
          <div class="col-md-4">
            <label class="form-label">Activo</label>
            <select class="form-select" formControlName="active">
              <option [ngValue]="true">Sí</option>
              <option [ngValue]="false">No</option>
            </select>
          </div>
          <div class="col-md-12">
            <label class="form-label">Foto del producto</label>
            <div class="d-flex gap-2 align-items-center">
              <input type="file" class="form-control" accept="image/*" (change)="onPhotoSelected($event)" />
              <span *ngIf="uploading" class="text-muted small">Subiendo...</span>
            </div>
            <div *ngIf="photoPreview" class="mt-2">
              <img [src]="photoPreview" alt="Preview" style="max-height:80px; border-radius:4px;" />
            </div>
            <input type="hidden" formControlName="photo_url" />
          </div>
          <div class="col-md-12">
            <label class="form-label">Descripción</label>
            <textarea class="form-control" rows="3" formControlName="description"></textarea>
          </div>
        </div>

        <hr class="my-4" />

        <div class="d-flex justify-content-between align-items-center">
          <h5 class="mb-0">Tallas</h5>
          <button type="button" class="btn btn-sm btn-outline-primary" (click)="addSize()">Agregar talla</button>
        </div>

        <div class="table-responsive mt-2">
          <table class="table table-sm align-middle">
            <thead>
              <tr>
                <th>Talla</th>
                <th>Código de barras</th>
                <th>Precio</th>
                <th>Precio Oferta</th>
                <th>Stock</th>
                <th>Activa</th>
                <th></th>
              </tr>
            </thead>
            <tbody formArrayName="sizes">
              <tr *ngFor="let g of sizes.controls; let i = index" [formGroupName]="i">
                <td><input class="form-control form-control-sm" formControlName="size" /></td>
                <td><input class="form-control form-control-sm" formControlName="barcode" /></td>
                <td><input type="number" class="form-control form-control-sm" formControlName="price" min="0" /></td>
                <td><input type="number" class="form-control form-control-sm" formControlName="offer_price" min="0" placeholder="0 = sin oferta" /></td>
                <td><input type="number" class="form-control form-control-sm" formControlName="stock" min="0" /></td>
                <td>
                  <select class="form-select form-select-sm" formControlName="active">
                    <option [ngValue]="true">Sí</option>
                    <option [ngValue]="false">No</option>
                  </select>
                </td>
                <td class="text-end">
                  <button type="button" class="btn btn-sm btn-outline-danger" (click)="removeSize(i)">Quitar</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="mt-3 d-flex gap-2">
          <button class="btn btn-primary" type="submit" [disabled]="saving || form.invalid || uploading">
            {{saving ? 'Guardando...' : 'Guardar'}}
          </button>
        </div>
      </form>
    </div>
  </div>
  `
})
export class ProductsFormComponent {
  private fb = inject(FormBuilder);
  private api = inject(BackofficeApi);
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  saving = false;
  uploading = false;
  isNew = true;
  id?: number;
  brands: Brand[] = [];
  photoPreview: string | null = null;

  form = this.fb.group({
    code: ['', [Validators.required]],
    name: ['', [Validators.required]],
    description: [''],
    price: [0, [Validators.min(0)]],
    photo_url: [''],
    brand_id: [null as number | null],
    active: [true],
    sizes: this.fb.array([] as any[]),
  });

  get sizes() {
    return this.form.get('sizes') as FormArray;
  }

  async ngOnInit() {
    // Cargar marcas
    try {
      const res: any = await firstValueFrom(this.api.get<any>('/brands'));
      this.brands = (res.data ?? res) as Brand[];
    } catch {}

    const idParam = this.route.snapshot.paramMap.get('id');
    this.isNew = !idParam;
    if (!this.isNew) {
      this.id = Number(idParam);
      await this.load();
      this.form.get('code')?.disable();
    } else {
      this.addSize();
    }
  }

  addSize() {
    this.sizes.push(
      this.fb.group({
        size: ['', Validators.required],
        barcode: [''],
        price: [0, [Validators.min(0)]],
        offer_price: [null as number | null],
        stock: [0, [Validators.min(0)]],
        active: [true],
      })
    );
  }

  removeSize(i: number) {
    this.sizes.removeAt(i);
  }

  async onPhotoSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];
    this.uploading = true;
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('folder', 'products');
      const res: any = await firstValueFrom(this.api.post('/upload', fd));
      const url = res.url || res.path || '';
      this.form.patchValue({ photo_url: url });
      this.photoPreview = url;
    } catch (e) {
      alert('Error al subir la imagen');
    }
    this.uploading = false;
  }

  private async load() {
    const p: any = await firstValueFrom(this.api.get<any>(`/products/${this.id}`));
    this.form.patchValue({
      code: p.code,
      name: p.name,
      description: p.description ?? '',
      price: p.price,
      photo_url: p.photo_url ?? '',
      brand_id: p.brand_id ?? null,
      active: !!p.active,
    });
    if (p.photo_url) this.photoPreview = p.photo_url;
    this.sizes.clear();
    for (const s of (p.sizes ?? [])) {
      this.sizes.push(
        this.fb.group({
          size: [s.size, Validators.required],
          barcode: [s.barcode ?? ''],
          price: [s.price ?? 0, [Validators.min(0)]],
          offer_price: [s.offer_price ?? null],
          stock: [s.stock ?? 0, [Validators.min(0)]],
          active: [!!s.active],
        })
      );
    }
  }

  async save() {
    this.saving = true;
    try {
      const raw = this.form.getRawValue();
      const payload: any = {
        code: raw.code,
        name: raw.name,
        description: raw.description,
        price: raw.price,
        photo_url: raw.photo_url,
        brand_id: raw.brand_id,
        active: raw.active,
        sizes: (raw.sizes ?? []).map((s: any) => ({
          size: s.size,
          barcode: s.barcode || null,
          price: Number(s.price ?? 0),
          offer_price: s.offer_price && Number(s.offer_price) > 0 ? Number(s.offer_price) : null,
          stock: Number(s.stock ?? 0),
          active: !!s.active,
        })),
      };

      if (this.isNew) {
        await firstValueFrom(this.api.post('/products', payload));
      } else {
        delete payload.code;
        await firstValueFrom(this.api.put(`/products/${this.id}`, payload));
      }
      this.router.navigate(['/products']);
    } finally {
      this.saving = false;
    }
  }
}
