import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AuthManager } from '@infra-adapters/services/auth.service';
import {
  RowComponent,
  ColComponent,
  CardComponent,
  CardBodyComponent,
} from '@coreui/angular-pro';
import { IconComponent } from '@coreui/icons-angular';

@Component({
  templateUrl: 'dashboard.component.html',
  styleUrls: ['dashboard.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RowComponent,
    ColComponent,
    CardComponent,
    CardBodyComponent,
    IconComponent,
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
