import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'c-end-description-report',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './end-description-report.component.html',
  styleUrl: './end-description-report.component.scss',
})
export class EndDescriptionReportComponent {
  @Input() sociogram: boolean = false;
}
