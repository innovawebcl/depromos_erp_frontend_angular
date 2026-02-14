import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import {
  AlertComponent,
  ColComponent,
  ListGroupDirective,
  ListGroupItemDirective,
  RowComponent,
} from '@coreui/angular-pro';
import type { IreportSociogram } from '@core-ports/outputs/sociograms';

@Component({
  selector: 'c-overview-information',
  standalone: true,
  imports: [
    RowComponent,
    ColComponent,
    CommonModule,
    ListGroupDirective,
    ListGroupItemDirective,
    AlertComponent,
  ],
  templateUrl: './overview-information.component.html',
  styleUrl: './overview-information.component.scss',
})
export class OverviewInformationComponent {
  @Input() sociogram: IreportSociogram | null = null;
}
