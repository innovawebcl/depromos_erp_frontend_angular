import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { UserRole } from '@core-interfaces/global';
import { RowComponent } from '@coreui/angular-pro';
import { AuthManager } from '@infra-adapters/services/auth.service';
import { StudentProfileComponent } from '@infra-ui/views/student/student-profile/student-profile.component';
import { TeacherProfileComponent } from '@infra-ui/views/teacher/teacher-profile/teacher-profile.component';

@Component({
  selector: 'profile',
  standalone: true,
  imports: [
    CommonModule,
    RowComponent,
    StudentProfileComponent,
    TeacherProfileComponent,
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
  currentUserRole: UserRole | null = null;

  constructor(
    private authManager: AuthManager
  ) {}

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
}
