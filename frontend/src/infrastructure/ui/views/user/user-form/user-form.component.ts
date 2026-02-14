import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, } from '@angular/forms';

import { ActivatedRoute, Router } from '@angular/router';

import { AdministratorRole, UserRole } from '@core-interfaces/global';

import type { IAdministratorFormInput } from '@core-interfaces/services/administrator';
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
} from '@coreui/angular-pro';
import { RutDirective } from '@infra-adapters/directives/rut.directive';
import { RutPipe } from '@infra-adapters/pipe/Rut.pipe';

import { administratorManager } from '@infra-adapters/services/administrator.service';
import { AuthManager } from '@infra-adapters/services/auth.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'user-form',
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
    RutDirective,
    RutPipe,
  ],
  templateUrl: './user-form.component.html',
  styleUrl: './user-form.component.scss',
    providers: [RutPipe],
})
export class UserFormComponent implements OnInit {
  private admin_id: string | null = '';

  isLoading: boolean = false;
  maxDate: string = '';

  constructor(
    private adminService: administratorManager,
    private authService: AuthManager,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.setMaxDate();
  }

  get form() {
    return this.adminService.adminForm;
  }

  get isSuperAdmin() {
    return (
      this.authService.UserSessionData()?.role === UserRole.SuperAdministrator
    );
  }

  get isSelectedSuperAdmin() {
    return this.form.get('role')?.value === UserRole.SuperAdministrator;
  }

  get isUpdateAction() {
    return this.admin_id ? true : false;
  }


  ngOnInit(): void {
    this.form.reset();
    this.admin_id = this.route.snapshot.queryParamMap.get('id');
    if (typeof this.admin_id === 'string' && !isNaN(Number(this.admin_id))) {
      this.loadAdminByID(Number(this.admin_id));
    }
    if (
      this.authService.UserSessionData()?.role !== UserRole.SuperAdministrator
    ) {
      this.form.get('role')?.setValue(UserRole.Administrator);
    }
  }

  onChange() {
    if (this.form.get('role')?.value === UserRole.SuperAdministrator) {
      this.form.get('admin_role')?.setValue(AdministratorRole.SchoolAdmin);
    } else {
      this.form.get('admin_role')?.setValue(null);
    }
  }


  async onSubmit() {
    try {
      this.isLoading = true;

      if (this.form.valid) {
        if (
          typeof this.admin_id === 'string' &&
          !isNaN(Number(this.admin_id))
        ) {
          await this.update();
        } else {
          await this.store();
        }
      }
      this.isLoading = false;
    } catch (error) {
      this.isLoading = false;
    }
  }

  getErrorMessage(controlName: keyof IAdministratorFormInput): string | null {
    return this.adminService.getErrorMessage(controlName);
  }

  private async loadAdminByID(id: number) {
    const admin = await firstValueFrom(
      await this.adminService.loadAdministratorByID(id)
    );

    if (admin.data) {
      this.form.get('password')?.clearValidators();
      this.form.patchValue({
        username: admin.data.username,
        password: '',
        first_name: admin.data.detail?.first_name,
        last_name: admin.data.detail?.last_name,
        email: admin.data.detail?.email,
        birth_date: admin.data.detail?.birth_date,
        rut: admin.data.detail?.rut,
        role: admin.data.role,
        admin_role: admin.data.administrator?.admin_role,
      });
      this.form.get('password')?.updateValueAndValidity();
    }
  }

  private async update() {
    (
      await this.adminService.updateAdmin(
        this.form.value as IuserInput,
        Number(this.admin_id)
      )
    ).subscribe({
      next: (_) => {
        this.router.navigate(['/admins']);
      },
      error: (error) => {
        console.error('Error al actualizar:', error);
      },
    });
  }

  private async store() {
    (
      await this.adminService.storeAdmin(this.form.value as IuserInput)
    ).subscribe({
      next: (_) => {
        this.router.navigate(['/admins']);
      },
      error: (error) => {
        console.error('Error al crear:', error);
        this.setFormError(error.error); //o error.json
      },
    });
  }

  private setFormError(errorResponse: any) {
    const errors = errorResponse.data;
    Object.keys(errors).forEach((field) => {
      const control = this.form.get(field);
      if (control) {
        control.setErrors({
          ...control.errors,
          serverError: errors[field][0],
        });
      }
    });
  }  

  private setMaxDate() {
    const today = new Date();
    const maxYear = today.getFullYear() - 18;
    const maxMonth = today.getMonth();
    const maxDay = today.getDate();

    const maxDate = new Date(maxYear, maxMonth, maxDay);
    this.maxDate = maxDate.toISOString().split('T')[0]; // Formato YYYY-MM-DD
  }
}
