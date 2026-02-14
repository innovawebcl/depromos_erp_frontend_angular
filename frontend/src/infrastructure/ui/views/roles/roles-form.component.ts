import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { RolesService } from './roles.service';
import type { ModuleDef, RoleRow, RoleUpsert } from './roles.models';

@Component({
  selector: 'app-roles-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './roles-form.component.html',
})
export class RolesFormComponent implements OnInit {
  loading = false;
  isNew = true;
  id: number | null = null;

  role: RoleRow | null = null;
  modules: ModuleDef[] = [];

  form: RoleUpsert = {
    name: '',
    description: '',
  };

  // mapa editable
  moduleState: Record<string, boolean> = {};

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private rolesSvc: RolesService
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.isNew = !idParam || idParam === 'new';
    this.id = this.isNew ? null : Number(idParam);

    this.loading = true;

    if (this.isNew) {
      this.rolesSvc.modules().subscribe({
        next: (mods) => {
          this.modules = this.normalizeModules(mods);
          // por defecto todo apagado
          this.moduleState = this.modules.reduce((acc, m) => {
            acc[m.key] = false;
            return acc;
          }, {} as Record<string, boolean>);
          this.loading = false;
        },
        error: () => {
          this.modules = this.defaultModules();
          this.moduleState = this.modules.reduce((acc, m) => {
            acc[m.key] = false;
            return acc;
          }, {} as Record<string, boolean>);
          this.loading = false;
        },
      });
      return;
    }

    forkJoin({
      role: this.rolesSvc.get(this.id!),
      mods: this.rolesSvc.modules(),
    }).subscribe({
      next: ({ role, mods }) => {
        this.role = role;
        this.form = { name: role.name, description: role.description || '' };
        this.modules = this.normalizeModules(mods);
        const current = (role.modules || {}) as Record<string, boolean>;
        this.moduleState = this.modules.reduce((acc, m) => {
          acc[m.key] = !!current[m.key];
          return acc;
        }, {} as Record<string, boolean>);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  private normalizeModules(mods: ModuleDef[] | any): ModuleDef[] {
    const arr = Array.isArray(mods) ? mods : [];
    if (arr.length === 0) return this.defaultModules();
    return arr
      .filter((m) => !!m?.key)
      .map((m) => ({ key: m.key, name: m.name || this.prettyKey(m.key) }));
  }

  private defaultModules(): ModuleDef[] {
    return [
      { key: 'products', name: 'Productos' },
      { key: 'inventory', name: 'Inventario' },
      { key: 'banners', name: 'Banners' },
      { key: 'orders', name: 'Pedidos' },
      { key: 'picking', name: 'Picking' },
      { key: 'couriers', name: 'Repartidores' },
      { key: 'communes', name: 'Tarifas por comuna' },
      { key: 'customers', name: 'Clientes' },
      { key: 'users', name: 'Usuarios' },
      { key: 'roles', name: 'Roles y módulos' },
    ];
  }

  private prettyKey(key: string): string {
    return key
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }

  toggle(key: string): void {
    this.moduleState[key] = !this.moduleState[key];
  }

  save(): void {
    if (!this.form.name) return;
    this.loading = true;

    const req = this.isNew
      ? this.rolesSvc.create(this.form)
      : this.rolesSvc.update(this.id!, this.form);

    req.subscribe({
      next: (role) => {
        // luego guardar módulos
        const roleId = role.id;
        this.rolesSvc.setRoleModules(roleId, this.moduleState).subscribe({
          next: () => {
            this.loading = false;
            this.router.navigate(['/roles']);
          },
          error: () => {
            // guardamos rol aunque falle módulos
            this.loading = false;
            this.router.navigate(['/roles']);
          },
        });
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  cancel(): void {
    this.router.navigate(['/roles']);
  }
}
