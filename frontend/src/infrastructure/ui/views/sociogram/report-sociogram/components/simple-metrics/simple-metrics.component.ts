import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

import { TranslateReportPipe } from '@infra-adapters/pipe/TranslateReport.pipe';
import type { IreportSociogram } from '@core-ports/outputs/sociograms';
import {
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
  selector: 'c-simple-metrics',
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
  ],
  templateUrl: './simple-metrics.component.html',
  styleUrl: './simple-metrics.component.scss',
})
export class SimpleMetricsComponent {
  @Input() sociogram: IreportSociogram | null = null;

  getKeysByObject(metric: any) {
    return Object.keys(metric);
  }
}
