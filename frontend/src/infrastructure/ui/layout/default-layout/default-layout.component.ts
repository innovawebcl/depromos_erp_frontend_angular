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
import { buildBackofficeNav } from './_nav';
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
  constructor(private authService: AuthManager) {}

  get navItems(): INavData[] {
    const user = this.authService.UserSessionData();
    const modules = (user as any)?.modules as Record<string, boolean> | undefined;
    return buildBackofficeNav(modules);
  }

  onScrollbarUpdate($event: any) {}
}
