import { CommonModule, NgStyle } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AdministratorRole, UserRole } from '@core-interfaces/global';
import type { IUserAdministrator } from '@core-ports/outputs/user';
import {
  type IColumn,
  BadgeComponent,
  ButtonDirective,
  CardBodyComponent,
  CardComponent,
  CardGroupComponent,
  CardHeaderComponent,
  ColComponent,
  CollapseDirective,
  ContainerComponent,
  ModalComponent,
  RowComponent,
  SmartTableComponent,
  SmartTableFilterComponent,
  TemplateIdDirective,
  TextColorDirective,
  TooltipDirective,
} from '@coreui/angular-pro';
import { IconComponent } from '@coreui/icons-angular';
import { TranslateTeacherRolePipe } from '@infra-adapters/pipe/TranslateTeacher.pipe';
import { administratorManager } from '@infra-adapters/services/administrator.service';
import { AuthManager } from '@infra-adapters/services/auth.service';
import { firstValueFrom } from 'rxjs';

interface IAdministratorSerialize {
  full_name: string;
  email: string;
  rut: string;
  admin_role: string; // Puede ser rol de usuario o rol de administrador
  id: number;
  last_login?: string;
}

@Component({
  selector: 'user-list',
  standalone: true,
  imports: [
    CommonModule,
    BadgeComponent,
    ButtonDirective,
    CollapseDirective,
    SmartTableComponent,
    TemplateIdDirective,
    TextColorDirective,
    RowComponent,
    ColComponent,
    CardComponent,
    CardHeaderComponent,
    CardBodyComponent,
    SmartTableFilterComponent,
    CardGroupComponent,
    NgStyle,
    IconComponent,
    ModalComponent,
    TranslateTeacherRolePipe,
    ContainerComponent,
    TooltipDirective,
  ],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.scss',
})
export class UserListComponent {
  administrators: IAdministratorSerialize[] = [];
  isLoading: boolean = false;

  // TODO mapping de columnas para tablas
  columns: IColumn[] = [
    {
      key: 'full_name',
      label: 'Nombre',
    },
    {
      key: 'email',
      label: 'Correo',
    },
    {
      key: 'rut',
      label: 'RUT',
    },
    {
      key: 'admin_role',
      label: 'Rol',
    },
    {
      key: 'institution',
      label: 'Institución',
    },
    {
    key: 'last_login', // NUEVO
    label: 'Último acceso',
    _style: { width: '15%' },
  },
    {
      key: 'actions',
      label: '',
      _style: { width: '5%' },
      filter: false,
      sorter: false,
    },
  ];

  details_visible = Object.create({});

  selectedAdminId: number | null = null;
  selectedAdminName: string | null = null;
  deleteModalVisible = false;

  constructor(
    private administratorService: administratorManager,
    private router: Router,
    private authService: AuthManager
  ) {}

  get isSuperAdmin() {
    return (
      this.authService.UserSessionData()?.role === UserRole.SuperAdministrator
    );
  }

  get isAdmin() {
    return this.authService.UserSessionData()?.role === UserRole.Administrator;
  }

  get isInstitutionSelected() {
    return this.authService.InstitutionSelected() !== 0;
  }

  ngOnInit(): void {
    this.loadData();
  }

  toggleDetails(item: any) {
    this.details_visible[item] = !this.details_visible[item];
  }

  onCreate() {
    this.router.navigate(['/admins/store']);
  }

  onUpdate(id: number) {
    this.router.navigate(['/admins/update'], {
      queryParams: {
        id,
      },
    });
  }

  openDeleteModal(id: number, name: string) {
    this.selectedAdminId = id;
    this.selectedAdminName = name;
    this.deleteModalVisible = true;
  }

  resetModal() {
    this.selectedAdminId = null;
    this.selectedAdminName = null;
    this.deleteModalVisible = false;
  }

  async onConfirmDelete() {
    if (this.selectedAdminId !== null) {
      (
        await this.administratorService.deleteAdmin(this.selectedAdminId)
      ).subscribe({
        next: (_) => {
          this.loadData();
          this.resetModal();
        },
        error: (error) => {
          console.error('Error al actualizar:', error);
        },
      });
    }
  }

  private loadData() {
    this.loadAdmins();
  }
  private async loadAdmins() {
    try {
      this.isLoading = true;
      const response = await firstValueFrom(
        await this.administratorService.loadAdministrators()
      );
      this.administrators = this.serializeAdmins(response.data ?? []);
      this.isLoading = false;
    } catch (error) {
      this.isLoading = false;
    }
  }

  private serializeAdmins(
  admins: IUserAdministrator[]
): IAdministratorSerialize[] {
  return admins
    .map((admin) => {
      return {
        email: admin.detail?.email ?? '-',
        full_name: admin.detail
          ? `${admin.detail.first_name} ${admin.detail.last_name}`
          : admin.username,
        id: admin.id,
        admin_role: this.translateAdminRole(admin.administrator?.admin_role),
        rut: admin.detail?.rut ?? '-',
        institution: admin.administrator?.institution.name ?? '',
        role: admin.administrator?.admin_role,
        last_login: this.getLastLogin(admin.loginLogs),
      };
    })
    .filter((admin) => admin.id !== this.authService.UserSessionData()?.id);
}

  isInspector(role: string) {
    return role === AdministratorRole.SchoolSupervisor;
  }

  // TODO migrar a un pipe
  private translateAdminRole(role?: string) {
    if (role === AdministratorRole.SchoolAdmin) {
      return 'Administrador de institución';
    }
    if (role === AdministratorRole.SchoolSupervisor) {
      return 'Inspector de institución';
    }
    return '-';
  }
  private translateRole(role?: string) {
    if (role === UserRole.Administrator) {
      return 'Administrador';
    }
    if (role === UserRole.SuperAdministrator) {
      return 'Super Administrador';
    }
    return '-';
  }

  private getLastLogin(logs?: any[]): string {
  if (!logs || logs.length === 0) {
    return 'Sin registros';
  }

  const lastLog = logs[logs.length - 1];

  return lastLog?.created_at
    ? this.formatDate(lastLog.created_at)
    : 'Sin registros';
}


private formatDate(dateString: string): string {
  const date = new Date(dateString);
  
  if (isNaN(date.getTime())) {
    return 'Fecha inválida';
  }

  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}
}
