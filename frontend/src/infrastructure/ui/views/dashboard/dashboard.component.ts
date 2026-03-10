import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AuthManager } from '@infra-adapters/services/auth.service';
import { RowComponent } from '@coreui/angular-pro';

@Component({
  templateUrl: 'dashboard.component.html',
  styleUrls: ['dashboard.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RowComponent,
  ],
})
export class DashboardComponent implements OnInit {
  public userName: string = '';

  constructor(private authManager: AuthManager) {}

  ngOnInit(): void {
    const userSession = this.authManager.UserSessionData();
    if (userSession) {
      this.userName = `${userSession.first_name ?? ''} ${userSession.last_name ?? ''}`.trim();
    }
  }
}
