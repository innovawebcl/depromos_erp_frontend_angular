import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';

import { AdministratorGadgetComponent } from './administrator-gadget/administrator-gadget.component';
import { TeacherGadgetComponent } from './teacher-gadget/teacher-gadget.component';
import { StudentGadgetComponent } from './student-gadget/student-gadget.component';
import { SuperAdministratorGadgetComponent } from './super-administrator-gadget/super-administrator-gadget.component';
import { UserRole } from '@core-interfaces/global';
import { AuthManager } from '@infra-adapters/services/auth.service';
import { RowComponent } from '@coreui/angular-pro';

@Component({
  templateUrl: 'dashboard.component.html',
  styleUrls: ['dashboard.component.scss'],
  standalone: true,
  imports: [
    AdministratorGadgetComponent,
    TeacherGadgetComponent,
    StudentGadgetComponent,
    SuperAdministratorGadgetComponent,
    CommonModule,
    RowComponent,
  ],
})
export class DashboardComponent implements OnInit {
  public currentUserRole: UserRole | null = null;

  constructor(private authManager: AuthManager) {}

  ngOnInit(): void {
    this.getCurrentUserRole();
  }

  private getCurrentUserRole(): void {
    const userSession = this.authManager.UserSessionData();
    if (userSession && userSession.role) {
      this.currentUserRole = userSession.role as UserRole;
    } else {
      this.currentUserRole = null;
    }
  }

  get name() {
    return `${this.authManager.UserSessionData()?.first_name} ${
      this.authManager.UserSessionData()?.last_name
    }`;
  }
}
