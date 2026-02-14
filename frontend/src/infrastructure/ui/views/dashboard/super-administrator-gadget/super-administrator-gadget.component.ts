import { Component, OnInit } from '@angular/core';
import { CommonModule, NgStyle } from '@angular/common';
import {
  AvatarComponent,
  ButtonDirective,
  CardBodyComponent,
  CardComponent,
  CardFooterComponent,
  CardHeaderComponent,
  CardSubtitleDirective,
  CardTitleDirective,
  ColComponent,
  ProgressComponent,
  RowComponent,
  TableDirective,
} from '@coreui/angular-pro';
import { ChartjsComponent } from '@coreui/angular-chartjs';
import { IconDirective } from '@coreui/icons-angular';
import { WidgetsDropdownVerticalComponent } from '@infra-ui/views/widgets/widgets-dropdown-vertical/widgets-dropdown-vertical.component';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { IsuperAdminDashboard } from '@core-ports/outputs/user';
import { administratorManager } from '@infra-adapters/services/administrator.service';
import { AuthManager } from '@infra-adapters/services/auth.service';
import { Router } from '@angular/router';
import { TranslateRolePipe } from '@infra-adapters/pipe/TranslateRole.pipe';
import { AnnotationLevel, UserRole } from '@core-interfaces/global';
import { TranslateAnnotationLevelPipe } from '@infra-adapters/pipe/TranslateAnnotationLevel.pipe';

@Component({
  selector: 'super-administrator-gadget',
  standalone: true,
  imports: [
    NgStyle,
    CommonModule,
    AvatarComponent,
    ButtonDirective,
    CardComponent,
    CardBodyComponent,
    CardFooterComponent,
    CardHeaderComponent,
    CardSubtitleDirective,
    CardTitleDirective,
    ChartjsComponent,
    ColComponent,
    IconDirective,
    ProgressComponent,
    RowComponent,
    TableDirective,
    WidgetsDropdownVerticalComponent,

    TranslateRolePipe,
    TranslateAnnotationLevelPipe
  ],
  templateUrl: './super-administrator-gadget.component.html',
  styleUrl: './super-administrator-gadget.component.scss',
})
export class SuperAdministratorGadgetComponent implements OnInit {
  private dashboardResponseSubject: BehaviorSubject<IsuperAdminDashboard | null> = new BehaviorSubject<IsuperAdminDashboard | null>(null);
  dashboardResponse$ = this.dashboardResponseSubject.asObservable();

  userRoles = Object.values(UserRole).filter((value) => value !== UserRole.SuperAdministrator);
  annotationLevels = Object.values(AnnotationLevel);

  constructor(
    private adminService: administratorManager,
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  private async loadData() {
    const response = await firstValueFrom(
      await this.adminService.loadSuperAdminDashBoard()
    );
    if (response.data) {
      this.dashboardResponseSubject.next(response.data);
    }
  }
}
