import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

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
  selector: 'c-lonely-metrics',
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
  ],
  templateUrl: './lonely-metrics.component.html',
  styleUrl: './lonely-metrics.component.scss',
})
export class LonelyMetricsComponent {
  @Input() sociogram: IreportSociogram | null = null;
}
