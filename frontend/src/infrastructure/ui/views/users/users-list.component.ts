import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { debounceTime, firstValueFrom, Subject, switchMap } from 'rxjs';
import { UsersService } from './users.service';
import { BackofficeApi } from '@infra-adapters/services/backoffice-api.service';
import type { Paginated, RoleSummary, UserRow } from './users.models';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './users-list.component.html',
})
export class UsersListComponent implements OnInit {
  private api = inject(BackofficeApi);
  loading = false;
  search = '';
  role_id: number | 'all' = 'all';
  active: boolean | 'all' = 'all';

  page = 1;
  per_page = 20;

  roles: RoleSummary[] = [];
  data: Paginated<UserRow> = { data: [] };

  // Import
  showImportModal = false;
  selectedFile: File | null = null;
  importing = false;
  importResult: any = null;

  private reload$ = new Subject<void>();

  constructor(private users: UsersService) {}

  ngOnInit(): void {
    this.users.roles().subscribe({
      next: (r) => (this.roles = r || []),
      error: () => (this.roles = []),
    });

    this.reload$
      .pipe(
        debounceTime(200),
        switchMap(() => {
          this.loading = true;
          return this.users.list({
            search: this.search,
            role_id: this.role_id,
            active: this.active,
            page: this.page,
            per_page: this.per_page,
          });
        })
      )
      .subscribe({
        next: (res) => {
          this.data = res;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        },
      });

    this.reload();
  }

  reload(): void {
    this.reload$.next();
  }

  nextPage(): void {
    if (!this.data.meta) return;
    if (this.data.meta.current_page >= this.data.meta.last_page) return;
    this.page += 1;
    this.reload();
  }

  prevPage(): void {
    if (this.page <= 1) return;
    this.page -= 1;
    this.reload();
  }

  async toggle(u: UserRow): Promise<void> {
    this.loading = true;
    this.users.toggleActive(u.id).subscribe({
      next: () => this.reload(),
      error: () => (this.loading = false),
    });
  }

  badge(active: boolean): string {
    return active ? 'success' : 'secondary';
  }

  formatDate(d: string | null | undefined): string {
    if (!d) return '—';
    try {
      return new Date(d).toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch { return d; }
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0] ?? null;
    this.importResult = null;
  }

  async importUsers() {
    if (!this.selectedFile) return;
    this.importing = true;
    this.importResult = null;
    try {
      const fd = new FormData();
      fd.append('file', this.selectedFile);
      const res = await firstValueFrom(this.api.post<any>('/users/import', fd));
      this.importResult = res;
      this.reload();
    } catch (err: any) {
      this.importResult = { created: 0, errors: [err?.error?.message || 'Error en importación'] };
    } finally {
      this.importing = false;
    }
  }
}
