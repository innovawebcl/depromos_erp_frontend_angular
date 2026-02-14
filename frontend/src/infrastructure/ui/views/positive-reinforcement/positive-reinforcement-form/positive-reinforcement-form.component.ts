import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { Router } from '@angular/router';
import { Ioption } from '@core-interfaces/global';
import { positiveReinforcementOptions } from '@core-interfaces/global/positiveReinforcementOptions';

import type { IAdministratorFormInput } from '@core-interfaces/services/administrator';
import { IpositiveReinforcementInput } from '@core-ports/inputs/positiveReinforcement';
import type { IuserInput } from '@core-ports/inputs/user';

import {
  ButtonDirective,
  ColComponent,
  FormDirective,
  FormFeedbackComponent,
  FormLabelDirective,
  InputGroupComponent,
  InputGroupTextDirective,
  RowComponent,
  SpinnerComponent,
  TextColorDirective,
  FormControlDirective,
  ContainerComponent,
  CardComponent,
  CardHeaderComponent,
  CardBodyComponent,
  FormCheckComponent,
  FormCheckInputDirective,
  FormCheckLabelDirective,
  FormSelectDirective,
  FormModule,
  MultiSelectComponent,
  MultiSelectOptionComponent,
} from '@coreui/angular-pro';
import { AuthManager } from '@infra-adapters/services/auth.service';

import {
  IpositiveReinforcementForm,
  positiveReinforcementManager,
} from '@infra-adapters/services/positiveReinforcement.service';
import { studentManager } from '@infra-adapters/services/student.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'positive-reinforcement-form',
  standalone: true,
  imports: [
    ButtonDirective,
    ColComponent,
    FormDirective,
    FormFeedbackComponent,
    FormLabelDirective,
    InputGroupComponent,
    InputGroupTextDirective,
    RowComponent,
    SpinnerComponent,
    TextColorDirective,
    FormControlDirective,
    ContainerComponent,
    CardComponent,
    CardHeaderComponent,
    CardBodyComponent,
    FormCheckComponent,
    FormCheckInputDirective,
    FormCheckLabelDirective,
    FormSelectDirective,
    ReactiveFormsModule,
    FormModule,
    CommonModule,
    MultiSelectComponent,
    MultiSelectOptionComponent,
  ],
  templateUrl: './positive-reinforcement-form.component.html',
  styleUrl: './positive-reinforcement-form.component.scss',
})
export class PositiveReinforcementFormComponent {
  isLoading: boolean = false;

  messageOptions = positiveReinforcementOptions;
  classmateList: Ioption[] | null = null;

  constructor(
    private positiveService: positiveReinforcementManager,
    private router: Router,
    private studentService: studentManager,
    private authService: AuthManager
  ) {}

  get form() {
    return this.positiveService.positiveReinforcementForm;
  }

  ngOnInit(): void {
    this.form.reset();
    this.loadResources();
  }

  async onSubmit() {
    try {
      this.isLoading = true;
      if (this.form.valid) {
        await this.store();
        this.isLoading = false;
      }
    } catch (error) {
      this.isLoading = false;
    }
  }

  getErrorMessage(
    controlName: keyof IpositiveReinforcementForm
  ): string | null {
    return this.positiveService.getErrorMessage(controlName);
  }

  private async store() {
    (
      await this.positiveService.storePositiveReinforcement(
        this.form.value as IpositiveReinforcementInput
      )
    ).subscribe({
      next: (_) => {
        this.router.navigate(['/positivereinforcement']);
      },
      error: (error) => {
        console.error('Error al crear:', error);
        this.setFormError();
      },
    });
  }

  private setFormError() {
    const usernameControl = this.form.get('message');
    const usernameCurrentErrors = usernameControl?.errors || {};
    usernameControl?.setErrors({
      ...usernameCurrentErrors,
      serverError: true,
    });

    const passwordControl = this.form.get('receiver_student_id');
    const passwordCurrentErrors = passwordControl?.errors || {};
    passwordControl?.setErrors({
      ...passwordCurrentErrors,
      serverError: true,
    });
  }

  private async loadResources() {
    const sessionData = this.authService.UserSessionData();
    if (sessionData && sessionData.course_id) {
      const classmateOptions = await firstValueFrom(
        await this.studentService.getClassmate(Number(sessionData.course_id))
      );

      const serializeClassmate = classmateOptions.data?.map((classmate) => ({
        value: `${classmate.id}`,
        label: `${classmate.user.detail?.first_name ?? '-'} ${
          classmate.user.detail?.last_name ?? '-'
        }`,
      }));
      this.classmateList = serializeClassmate ?? ([] as Ioption[]);
    }
  }
}
