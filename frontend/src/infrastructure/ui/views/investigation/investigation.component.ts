import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
@Component({
  selector: 'investigation',
  template: ` <router-outlet></router-outlet> `,
  standalone: true,
  imports: [RouterOutlet],
})
export class InvestigationComponent {}
