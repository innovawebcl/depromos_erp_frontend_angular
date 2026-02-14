import { CommonModule, NgStyle, NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  inject,
  Input,
  OnInit,
} from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import {
  AlertComponent,
  AvatarComponent,
  BadgeComponent,
  BreadcrumbRouterComponent,
  ButtonDirective,
  ColorModeService,
  ContainerComponent,
  DropdownComponent,
  DropdownDividerDirective,
  DropdownHeaderDirective,
  DropdownItemDirective,
  DropdownMenuDirective,
  DropdownToggleDirective,
  FormControlDirective,
  FormDirective,
  HeaderComponent,
  HeaderNavComponent,
  HeaderTogglerDirective,
  InputGroupComponent,
  InputGroupTextDirective,
  NavItemComponent,
  NavLinkDirective,
  ProgressBarDirective,
  ProgressComponent,
  SidebarToggleDirective,
  TextColorDirective,
  ThemeDirective,
} from '@coreui/angular-pro';

import { IconDirective } from '@coreui/icons-angular';
import { AuthManager } from '@infra-adapters/services/auth.service';
import { InitialsPipe } from '@infra-adapters/pipe/Initials.pipe';
import { SelectorInstitutionComponent } from '@infra-ui/components/selector-institution/selector-institution.component';
import { UserRole } from '@core-interfaces/global';
import { BehaviorSubject } from 'rxjs';
import { Iinstitution } from '@core-ports/outputs/institution';

@Component({
  selector: 'app-default-header',
  templateUrl: './default-header.component.html',
  styleUrls: ['./default-header.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ContainerComponent,
    HeaderTogglerDirective,
    SidebarToggleDirective,
    IconDirective,
    HeaderNavComponent,
    NavItemComponent,
    NavLinkDirective,
    RouterLink,
    RouterLinkActive,
    NgTemplateOutlet,
    BreadcrumbRouterComponent,
    ThemeDirective,
    DropdownComponent,
    DropdownToggleDirective,
    TextColorDirective,
    AvatarComponent,
    DropdownMenuDirective,
    DropdownHeaderDirective,
    DropdownItemDirective,
    BadgeComponent,
    DropdownDividerDirective,
    ProgressBarDirective,
    ProgressComponent,
    InputGroupComponent,
    InputGroupTextDirective,
    FormControlDirective,
    ButtonDirective,
    NgStyle,
    FormDirective,
    InitialsPipe,
    SelectorInstitutionComponent,
    AlertComponent,
    HeaderComponent,
  ],
})
export class DefaultHeaderComponent extends HeaderComponent implements OnInit {
  readonly #colorModeService = inject(ColorModeService);
  readonly colorMode = this.#colorModeService.colorMode;

  name: string = '';
  institution: Iinstitution | null = null;

  isUserAllowedToEditProfile = false;

  constructor(
    private cd: ChangeDetectorRef,
    private authService: AuthManager,
    private router: Router
  ) {
    super();
    this.#colorModeService.localStorageItemName.set(
      'coreui-pro-angular-admin-template-theme-modern'
    );
    this.#colorModeService.eventName.set('ColorSchemeChange');
  }

  ngOnInit(): void {
    const info = this.authService.UserSessionData();

    if (info) {
      this.name = `${info.first_name ?? 'N'} ${info.last_name ?? 'N'}`;
    }
    this.isUserAllowedToEditProfile = this.getIfUserAllowedToEditProfile();
  }

  @Input() sidebarId: string = 'sidebar1';

  logout() {
    this.authService.cleanSession();
    this.router.navigate(['/login']);
  }

  setInstitution(institution: Iinstitution) {
    this.institution = institution;
    this.cd.detectChanges();
  }

  private getIfUserAllowedToEditProfile() {
    const role = this.authService.UserSessionData()?.role;
    return role === UserRole.Student || role === UserRole.Teacher;
  }
}
