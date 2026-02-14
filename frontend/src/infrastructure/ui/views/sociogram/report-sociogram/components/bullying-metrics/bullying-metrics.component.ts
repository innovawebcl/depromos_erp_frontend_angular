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
  selector: 'c-bullying-metrics',
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
  templateUrl: './bullying-metrics.component.html',
  styleUrl: './bullying-metrics.component.scss',
})
export class BullyingMetricsComponent {
  @Input() sociogram: IreportSociogram | null = null;

  getKeysByObject(metric: any) {
    return Object.keys(metric);
  }
}
