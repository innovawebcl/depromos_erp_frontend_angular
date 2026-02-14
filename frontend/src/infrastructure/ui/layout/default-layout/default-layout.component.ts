import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { NgScrollbar } from 'ngx-scrollbar';

import { IconDirective } from '@coreui/icons-angular';
import {
  type INavData,
  ButtonCloseDirective,
  ContainerComponent,
  ShadowOnScrollDirective,
  SidebarBrandComponent,
  SidebarComponent,
  SidebarFooterComponent,
  SidebarHeaderComponent,
  SidebarNavComponent,
  SidebarToggleDirective,
  SidebarTogglerDirective,
} from '@coreui/angular-pro';

import {
  DefaultAsideComponent,
  DefaultBreadcrumbComponent,
  DefaultFooterComponent,
  DefaultHeaderComponent,
} from '.';
import {
  navAdministrator,
  navInspectors,
  navStudents,
  navSuperAdministrator,
  navTeachers,
  buildBackofficeNav,
} from './_nav';
import { AdministratorRole, UserRole } from '@core-interfaces/global';
import { AuthManager } from '@infra-adapters/services/auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './default-layout.component.html',
  styleUrls: ['./default-layout.component.scss'],
  standalone: true,
  imports: [
    SidebarComponent,
    SidebarHeaderComponent,
    SidebarBrandComponent,
    RouterLink,
    IconDirective,
    NgScrollbar,
    SidebarNavComponent,
    SidebarFooterComponent,
    SidebarToggleDirective,
    SidebarTogglerDirective,
    DefaultAsideComponent,
    DefaultHeaderComponent,
    ShadowOnScrollDirective,
    ContainerComponent,
    RouterOutlet,
    DefaultFooterComponent,
    ButtonCloseDirective,
    DefaultBreadcrumbComponent,
  ],
})
export class DefaultLayoutComponent {
  navigation: { [key: string]: INavData[] } = {
    [UserRole.Administrator]: navAdministrator,
    [UserRole.Student]: navStudents,
    [UserRole.SuperAdministrator]: navSuperAdministrator,
    [UserRole.Teacher]: navTeachers,
    [AdministratorRole.SchoolSupervisor]: navInspectors,
  };

  constructor(private authService: AuthManager) {}

  get navItems() {
    const user = this.authService.UserSessionData();

    // Backoffice: si el JWT trae modules{}, construimos menú dinámico
    const modules = (user as any)?.modules as Record<string, boolean> | undefined;
    if (modules) {
      return buildBackofficeNav(modules);
    }

    // Navegación antigua (ConvivePro) por roles
    if (
      user &&
      user.role === UserRole.Administrator &&
      user.admin_role === AdministratorRole.SchoolSupervisor
    ) {
      return this.navigation[user.admin_role];
    }
    return this.navigation[user!.role];
  }

  onScrollbarUpdate($event: any) {}
}
