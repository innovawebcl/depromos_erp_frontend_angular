import {
  Component,
  DestroyRef,
  effect,
  inject,
  OnInit,
  Renderer2,
  signal,
  WritableSignal,
} from '@angular/core';
import { DashboardChartsData, IChartProps } from '../dashboard-charts-data';
import { CommonModule, DOCUMENT, NgStyle } from '@angular/common';
import { getStyle } from '@coreui/utils';
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
  ContainerComponent,
  ProgressComponent,
  RowComponent,
  TableDirective,
  TemplateIdDirective,
  WidgetStatCComponent,
} from '@coreui/angular-pro';
import { ChartjsComponent } from '@coreui/angular-chartjs';
import { IconDirective } from '@coreui/icons-angular';
import { WidgetsDropdownVerticalComponent } from '@infra-ui/views/widgets/widgets-dropdown-vertical/widgets-dropdown-vertical.component';
import { administratorManager } from '@infra-adapters/services/administrator.service';
import { firstValueFrom } from 'rxjs';
import { IuserDashboard } from '@core-ports/outputs/user';
import { AuthManager } from '@infra-adapters/services/auth.service';
import { AdministratorRole, UserRole } from '@core-interfaces/global';
import { Router } from '@angular/router';

@Component({
  selector: 'administrator-gadget',
  standalone: true,
  imports: [
    NgStyle,
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
    ContainerComponent,
    CommonModule,
    WidgetStatCComponent,
    TemplateIdDirective,
  ],
  templateUrl: './administrator-gadget.component.html',
  styleUrl: './administrator-gadget.component.scss',
})
export class AdministratorGadgetComponent implements OnInit {
  sociogramCharts: Array<{ label: string; data: any }> = [];
  studentsChartData: any;
  complaints: number = 0;
  investigation: number = 0;

  chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
  };

  /**
   *
   */
  constructor(
    private adminService: administratorManager,
    private authService: AuthManager,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  private async loadData() {
    const response = await firstValueFrom(
      await this.adminService.loadDashboard()
    );
    if (response.data) {
      this.buildSociogramCharts(response.data);
      this.buildStudentsChart(response.data);
      this.complaints = response.data.complaints;
      this.investigation = response.data.investigation;
    }
  }

  buildSociogramCharts(dashboardData: IuserDashboard) {
    this.sociogramCharts = dashboardData.sociogram.map((sociogram) => {
      const labels = sociogram.courses.map((course) => course.course_name);
      const data = sociogram.courses.map(
        (course) => course.percentage_responded
      );

      return {
        label: sociogram.sociogram_title,
        data: {
          labels,
          datasets: [
            {
              label: 'Porcentaje de Respuesta',
              backgroundColor: '#f87979',
              data,
            },
          ],
        },
      };
    });
  }

  buildStudentsChart(dashboardData: IuserDashboard) {
    const labels = dashboardData.students.map((student) => student.course_name);
    const data = dashboardData.students.map(
      (student) => student.total_students
    );

    this.studentsChartData = {
      labels,
      datasets: [
        {
          label: 'Total de Estudiantes',
          backgroundColor: '#36A2EB',
          data,
        },
      ],
    };
  }

  get isInspectorOrTeacher() {
    return (
      this.authService.UserSessionData()!.admin_role ===
        AdministratorRole.SchoolSupervisor ||
      this.authService.UserSessionData()!.role === UserRole.Teacher
    );
  }

  navigateToComplaints() {
    this.router.navigate(['/complaints']);
  }
  navigateToInvestigation() {
    this.router.navigate(['/investigation']);
  }
}
