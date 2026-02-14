import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { ColComponent, RowComponent } from '@coreui/angular-pro';

@Component({
  selector: 'c-logo',
  standalone: true,
  imports: [RowComponent, ColComponent, CommonModule],
  templateUrl: './logo.component.html',
  styleUrl: './logo.component.scss',
})
export class LogoComponent {
  @Input() sociogram: boolean = false;
}
