import { Component, HostBinding } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { NgScrollbar } from 'ngx-scrollbar';
import { IconDirective } from '@coreui/icons-angular';
import {
  BreadcrumbRouterComponent,
  ButtonCloseDirective,
  ContainerComponent,
  RowComponent,
  ShadowOnScrollDirective,
  SidebarBrandComponent,
  SidebarComponent,
  SidebarFooterComponent,
  SidebarHeaderComponent,
  SidebarNavComponent,
  SidebarToggleDirective,
  SidebarTogglerDirective
} from '@coreui/angular-pro';

import { DefaultAsideComponent, DefaultBreadcrumbComponent, DefaultFooterComponent, DefaultHeaderComponent } from '../default-layout';
import { navItems } from './_nav';

@Component({
  selector: 'app-email',
  templateUrl: './email-layout.component.html',
  styleUrls: ['./email-layout.component.scss'],
  standalone: true,
  imports: [SidebarComponent, SidebarHeaderComponent, SidebarBrandComponent, RouterLink, IconDirective, NgScrollbar, SidebarNavComponent, SidebarFooterComponent, SidebarToggleDirective, SidebarTogglerDirective, DefaultHeaderComponent, ShadowOnScrollDirective, ContainerComponent, RouterOutlet, DefaultFooterComponent, DefaultAsideComponent, BreadcrumbRouterComponent, RowComponent, DefaultBreadcrumbComponent, ButtonCloseDirective]
})
export class EmailLayoutComponent {
  @HostBinding('class.c-app') cAppClass = true;

  public navItems = navItems;

  constructor() {}
}
