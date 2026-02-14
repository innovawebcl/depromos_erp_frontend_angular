import { CommonModule, NgStyle } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserRole } from '@core-interfaces/global';
import { IpositiveReinforcement } from '@core-ports/outputs/positiveReinforcement';
import {
  ButtonDirective,
  CardBodyComponent,
  CardComponent,
  CardGroupComponent,
  CardHeaderComponent,
  ColComponent,
  ContainerComponent,
  IColumn,
  RowComponent,
  SmartTableComponent,
  SmartTableFilterComponent,
  TemplateIdDirective,
  TextColorDirective,
} from '@coreui/angular-pro';
import { IconComponent } from '@coreui/icons-angular';
import { AuthManager } from '@infra-adapters/services/auth.service';
import { positiveReinforcementManager } from '@infra-adapters/services/positiveReinforcement.service';

@Component({
  selector: 'positive-reinforcement-list',
  standalone: true,
  imports: [
    CommonModule,
    ButtonDirective,
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
    ContainerComponent,
  ],
  templateUrl: './positive-reinforcement-list.component.html',
  styleUrl: './positive-reinforcement-list.component.scss',
})
export class PositiveReinforcementListComponent implements OnInit {
  positiveReinforcements: { message: string; sender: string }[] = [];
  isLoading: boolean = false;

  allowedToCreate: boolean = false;

  // TODO mapping de columnas para tablas
  columns: IColumn[] = [
    {
      key: 'message',
      label: 'Refuerzo Positivo',
    },
    {
      key: 'sender',
      label: 'Enviado por',
    },
  ];

  constructor(
    private positiveReinforcementService: positiveReinforcementManager,
    private authService: AuthManager,
    private router: Router
  ) {}

  ngOnInit(): void {
    const role = this.authService.UserSessionData()?.role;
    this.allowedToCreate = role === UserRole.Student;
    if (role === UserRole.Student) {
      this.loadData();
    } else {
      this.loadInstitutionData();
      this.columns = [
        ...this.columns,
        {
          key: 'receiver',
          label: 'Recibido por',
        },
      ];
    }
  }

  onCreate() {
    this.router.navigate(['/positivereinforcement/store']);
  }

  private loadData() {
    this.isLoading = true;
    this.positiveReinforcementService
      .loadPositiveReinforcements()
      .then((item) => {
        item.subscribe((response) => {
          this.isLoading = false;
          this.positiveReinforcements = this.serializePositiveReinforcement(
            response.data ?? []
          );
        });
      })
      .catch((err) => {
        this.isLoading = false;
      });
  }

  private loadInstitutionData() {
    this.isLoading = true;
    this.positiveReinforcementService
      .loadInstitutionPositiveReinforcements()
      .then((item) => {
        item.subscribe((response) => {
          this.isLoading = false;
          this.positiveReinforcements = this.serializePositiveReinforcement(
            response.data ?? []
          );
        });
      })
      .catch((err) => {
        this.isLoading = false;
      });
  }

  private serializePositiveReinforcement(data: IpositiveReinforcement[]) {
    return data.map((item) => ({
      message: item.message ?? '',
      sender:
        item.senders?.user?.detail?.first_name ||
        item.senders?.user?.detail?.last_name
          ? `${item.senders?.user?.detail?.first_name ?? ''} ${
              item.senders?.user?.detail?.last_name ?? ''
            }`.trim()
          : 'Sin registro',
      sender_active_course: item.senders?.active_course?.name ?? 'Sin registro',
      receiver:
        item.receivers?.user?.detail?.first_name ||
        item.receivers?.user?.detail?.last_name
          ? `${item.receivers?.user?.detail?.first_name ?? ''} ${
              item.receivers?.user?.detail?.last_name ?? ''
            }`.trim()
          : 'Sin registro',
      receiver_active_course:
        item.receivers?.active_course?.name ?? 'Sin registro',
    }));
  }
}
