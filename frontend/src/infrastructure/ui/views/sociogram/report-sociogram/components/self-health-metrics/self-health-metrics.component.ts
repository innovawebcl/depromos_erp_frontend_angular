import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

import { TranslateReportPipe } from '@infra-adapters/pipe/TranslateReport.pipe';
import type { IreportSociogram } from '@core-ports/outputs/sociograms';
import {
  AlertComponent,
  CardComponent,
  ColComponent,
  ListGroupDirective,
  ListGroupItemDirective,
  ProgressBarComponent,
  ProgressBarDirective,
  ProgressComponent,
  RowComponent,
} from '@coreui/angular-pro';

@Component({
  selector: 'c-self-health-metrics',
  standalone: true,
  imports: [
    RowComponent,
    ColComponent,
    CardComponent,
    CommonModule,
    ProgressBarDirective,
    ProgressBarComponent,
    ProgressComponent,
    ListGroupDirective,
    ListGroupItemDirective,
    TranslateReportPipe,
    AlertComponent,
  ],
  templateUrl: './self-health-metrics.component.html',
  styleUrl: './self-health-metrics.component.scss',
})
export class SelfHealthMetricsComponent {
  @Input() sociogram: IreportSociogram | null = null;

  getKeysByObject(metric: any) {
    return Object.keys(metric);
  }
}
