import { CommonModule, NgStyle } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IForgotPasswordInput, ILoginInput } from '@core-ports/inputs/login';
import {
  ButtonDirective,
  ColComponent,
  FormDirective,
  FormFeedbackComponent,
  FormLabelDirective,
  InputGroupComponent,
  InputGroupTextDirective,
  RowComponent,
  TextColorDirective,
  FormControlDirective,
  SpinnerComponent,
} from '@coreui/angular-pro';
import { IconDirective } from '@coreui/icons-angular';
import { Observable } from 'rxjs';


@Component({
  selector: 'forgot-password',
  standalone: true,
  imports: [
    NgStyle,
    ReactiveFormsModule,
    FormsModule,
    CommonModule,

    RowComponent,
    ColComponent,
    InputGroupComponent,
    FormFeedbackComponent,
    SpinnerComponent,

    FormDirective,
    TextColorDirective,
    InputGroupTextDirective,
    IconDirective,
    FormControlDirective,
    ButtonDirective,
    FormLabelDirective,
  ],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss'
})
export class ForgotPasswordComponent {
  @Input() isLoading: Observable<boolean> = new Observable();
  @Output() formSubmit = new EventEmitter<IForgotPasswordInput>();

  email: string = '';


  onSubmit() {
    if (this.email) {
      this.formSubmit.emit({ email: this.email });
    }
  }
}
