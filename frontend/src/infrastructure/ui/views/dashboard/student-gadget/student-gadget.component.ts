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
  TemplateIdDirective,
  WidgetStatCComponent,
} from '@coreui/angular-pro';
import { ChartjsComponent } from '@coreui/angular-chartjs';
import { IconDirective } from '@coreui/icons-angular';
import { WidgetsDropdownVerticalComponent } from '@infra-ui/views/widgets/widgets-dropdown-vertical/widgets-dropdown-vertical.component';
import { studentManager } from '@infra-adapters/services/student.service';
import { IstudentDashboard } from '@core-ports/outputs/student';
import { firstValueFrom } from 'rxjs';
import { TranslateAnnotationLevelPipe } from '@infra-adapters/pipe/TranslateAnnotationLevel.pipe';
import { Router } from '@angular/router';
@Component({
  selector: 'student-gadget',
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
    CommonModule,
    TranslateAnnotationLevelPipe,
    ProgressComponent,
    WidgetStatCComponent,
    TemplateIdDirective,
  ],
  templateUrl: './student-gadget.component.html',
  styleUrl: './student-gadget.component.scss',
})
export class StudentGadgetComponent implements OnInit {
  dashboard: IstudentDashboard | null = null;

  constructor(private studentService: studentManager, private router: Router) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  private async loadDashboard() {
    const response = await firstValueFrom(
      await this.studentService.loadDashboard()
    );
    this.dashboard = response.data;
  }

  navigateToPositiveReinforcements() {
    this.router.navigate(['/positivereinforcement']);
  }

  navigateToComplaints() {
    this.router.navigate(['/complaints']);
  }

  navigateToProfile() {
    this.router.navigate(['/profile'], {
      queryParams: { goToAnnotations: true },
    });
  }
}
