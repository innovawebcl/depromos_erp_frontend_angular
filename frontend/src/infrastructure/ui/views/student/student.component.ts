import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'student',
  standalone: true,
  template: `<router-outlet></router-outlet> `,
  imports: [RouterOutlet],
})
export class StudentComponent {}
