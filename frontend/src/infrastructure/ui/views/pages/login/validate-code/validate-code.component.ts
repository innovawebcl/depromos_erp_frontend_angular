import { CommonModule, NgStyle } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { IForgotPasswordInput } from '@core-ports/inputs/login';
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
import { CodeInputComponent } from '@infra-ui/components/accessors/code-input/code-input.component';
import { Observable } from 'rxjs';
@Component({
  selector: 'validate-code',
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

    CodeInputComponent,
  ],
  templateUrl: './validate-code.component.html',
  styleUrl: './validate-code.component.scss'
})
export class ValidateCodeComponent implements OnInit {
  @Input() isLoading: Observable<boolean> = new Observable();
  @Output() formSubmit = new EventEmitter<string>();

  codeForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
  ) { }

  ngOnInit(): void {
    this.codeForm = this.fb.group({
      verificationCode: ['', [Validators.required, Validators.minLength(6)]],
    });
  }


  onSubmit() {
    if (this.codeForm.valid) {
      this.formSubmit.emit(this.codeForm.get('verificationCode')?.value);
    }
  }

}
