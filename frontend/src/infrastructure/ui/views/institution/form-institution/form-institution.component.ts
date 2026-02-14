import { CommonModule, NgStyle } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserRole } from '@core-interfaces/global';
import type { IInstitutionFormInput } from '@core-interfaces/services/institution';
import type { IinstitutionInput } from '@core-ports/inputs/institution';

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
  AlertComponent,
} from '@coreui/angular-pro';
import { IconDirective } from '@coreui/icons-angular';
import { AuthManager } from '@infra-adapters/services/auth.service';
import { InstitutionManager } from '@infra-adapters/services/institution.service';
import { ImageInputComponent } from '@infra-ui/components/accessors/image-input/image-input.component';
import { Subject, firstValueFrom } from 'rxjs';

@Component({
  selector: 'form-institution',
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
    ButtonDirective,
    FormLabelDirective,
    FormControlDirective,
    ContainerComponent,

    CardComponent,
    CardHeaderComponent,
    CardBodyComponent,
    AlertComponent,

    ImageInputComponent

  ],
  templateUrl: './form-institution.component.html',
  styleUrl: './form-institution.component.scss',
})
export class FormInstitutionComponent implements OnInit {
  private institution_id: string | null = '';
  loading$ = new Subject<boolean>();
  logoToUpload: File | null = null;


  constructor(
    private authService: AuthManager,
    private institutionService: InstitutionManager,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.form.reset();
    this.institution_id = this.route.snapshot.queryParamMap.get('id');
    const isSimpleAdmin = this.authService.UserSessionData()!.role === UserRole.Administrator;
    if (isSimpleAdmin) {
      const userInstitutionId = this.authService.UserSessionData()!.institution_id;
      if (this.institution_id && this.institution_id !== userInstitutionId!.toString()) {
        this.router.navigate(['/']);
        return;
      } else {
        this.institution_id = userInstitutionId!.toString();
      }
    }
    if (
      typeof this.institution_id === 'string' &&
      !isNaN(Number(this.institution_id))
    ) {
      this.loadInstitutionByID(Number(this.institution_id));
    }
  }

  async onSubmit() {
    if (this.form.valid) {
      if (
        typeof this.institution_id === 'string' &&
        !isNaN(Number(this.institution_id))
      ) {
        await this.update();
      } else {
        await this.store();
      }
    }
  }

  getErrorMessage(controlName: keyof IInstitutionFormInput): string | null {
    return this.institutionService.getErrorMessage(controlName);
  }

  get isUpdateAction() {
    return this.institution_id ? true : false;
  }

  get form() {
    return this.institutionService.institutionForm;
  }

  private async loadInstitutionByID(id: number) {
    const institution = await firstValueFrom(
      await this.institutionService.loadInstitutionByID(id)
    );
    if (institution.data) {
      this.form.setValue({
        address: institution.data.address,
        amount_of_negative_annotations:
          institution.data.amount_of_negative_annotations,
        deadline_for_closing_a_complaint:
          institution.data.deadline_for_closing_a_complaint,
        name: institution.data.name,
        logo: institution.data.logo_url ?? null,
      });
    }
  }

  private async update() {
    this.loading$.next(true);
    const changedValues = this.getChangedValues(this.form);
    (
      await this.institutionService.updateInstitution(
        changedValues as IinstitutionInput,
        Number(this.institution_id)
      )
    ).subscribe({
      next: (_) => {
        this.router.navigate(['/institutions']);
      },
      error: (error) => {
        console.error('Error al actualizar:', error);
      },
      complete: () => {
        this.loading$.next(false);
      }
    });
  }

  private async store() {
    this.loading$.next(true);
    (
      await this.institutionService.storeInstitution(
        this.form.value as IinstitutionInput
      )
    ).subscribe({
      next: (_) => {
        this.router.navigate(['/institutions']);
      },
      error: (error) => {
        console.error('Error al actualizar:', error);
      },
      complete: () => {
        this.loading$.next(false);
      }
    });
  }


  private getChangedValues(formGroup: FormGroup): Partial<IinstitutionInput> {
    const changedValues: Partial<IinstitutionInput> = {};
  
    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.get(key);
      if (control?.dirty) {
        changedValues[key as keyof IinstitutionInput] = control.value;
      }
    });
  
    return changedValues;
  }
}
