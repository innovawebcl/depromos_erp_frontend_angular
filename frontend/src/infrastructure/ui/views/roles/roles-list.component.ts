import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RolesService } from './roles.service';
import type { RoleRow } from './roles.models';

@Component({
  selector: 'app-roles-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './roles-list.component.html',
})
export class RolesListComponent implements OnInit {
  loading = false;
  roles: RoleRow[] = [];

  constructor(private rolesSvc: RolesService) {}

  ngOnInit(): void {
    this.reload();
  }

  reload(): void {
    this.loading = true;
    this.rolesSvc.list().subscribe({
      next: (r) => {
        this.roles = r || [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }
}
