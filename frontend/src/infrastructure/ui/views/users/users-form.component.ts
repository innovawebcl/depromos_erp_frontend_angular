import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UsersService } from './users.service';
import type { RoleSummary, UserDetail, UserUpsert } from './users.models';

@Component({
  selector: 'app-users-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users-form.component.html',
})
export class UsersFormComponent implements OnInit {
  loading = false;
  isNew = true;
  id: number | null = null;

  roles: RoleSummary[] = [];

  form: UserUpsert = {
    name: '',
    email: '',
    password: '',
    role_id: null,
    active: true,
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private users: UsersService
  ) {}

  ngOnInit(): void {
    this.users.roles().subscribe({
      next: (r) => (this.roles = r || []),
      error: () => (this.roles = []),
    });

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam && idParam !== 'new') {
      this.isNew = false;
      this.id = Number(idParam);
      this.loading = true;
      this.users.get(this.id).subscribe({
        next: (u: UserDetail) => {
          this.form = {
            name: u.name,
            email: u.email,
            role_id: u.role_id ?? null,
            active: u.active,
            password: '',
          };
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        },
      });
    }
  }

  save(): void {
    if (!this.form.name || !this.form.email) return;

    const payload: UserUpsert = {
      name: this.form.name,
      email: this.form.email,
      role_id: this.form.role_id,
      active: this.form.active,
    };

    // password opcional en edición
    if (this.isNew) {
      payload.password = this.form.password || '';
    } else if (this.form.password) {
      payload.password = this.form.password;
    }

    this.loading = true;

    const req = this.isNew
      ? this.users.create(payload)
      : this.users.update(this.id!, payload);

    req.subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/users']);
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  cancel(): void {
    this.router.navigate(['/users']);
  }
}
