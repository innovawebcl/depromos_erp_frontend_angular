import { Component, Input } from '@angular/core';
import {
  AlertComponent,
  CardComponent,
  ColComponent,
  ListGroupDirective,
  ListGroupItemDirective,
  RowComponent,
} from '@coreui/angular-pro';

import type { IreportSociogram } from '@core-ports/outputs/sociograms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'c-reinforcement-metrics',
  standalone: true,
  imports: [
    CardComponent,
    RowComponent,
    ColComponent,
    ListGroupDirective,
    ListGroupItemDirective,
    CommonModule,
    AlertComponent,
  ],
  templateUrl: './reinforcement-metrics.component.html',
  styleUrl: './reinforcement-metrics.component.scss',
})
export class ReinforcementMetricsComponent {
  @Input() sociogram: IreportSociogram | null = null;
}
