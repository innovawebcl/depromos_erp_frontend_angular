import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
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

import { TranslateReportPipe } from '@infra-adapters/pipe/TranslateReport.pipe';
import type { IreportSociogram } from '@core-ports/outputs/sociograms';

@Component({
  selector: 'c-leaders-metrics',
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
    AlertComponent,
    TranslateReportPipe,
  ],
  templateUrl: './leaders-metrics.component.html',
  styleUrl: './leaders-metrics.component.scss',
})
export class LeadersMetricsComponent {
  @Input() sociogram: IreportSociogram | null = null;

  getKeysByObject(metric: any) {
    return Object.keys(metric);
  }
}
