import { CommonModule, NgStyle } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import type { Iinstitution } from '@core-ports/outputs/institution';
import type { IinstitutionsToSociogramResponse } from '@core-ports/outputs/sociograms';
import {
  ButtonDirective,
  CardBodyComponent,
  CardComponent,
  CardHeaderComponent,
  ColComponent,
  ContainerComponent,
  FormCheckComponent,
  FormCheckInputDirective,
  FormCheckLabelDirective,
  FormDirective,
  FormFeedbackComponent,
  FormLabelDirective,
  FormSelectDirective,
  InputGroupComponent,
  InputGroupTextDirective,
  RowComponent,
  SpinnerComponent,
  TextColorDirective,
  FormControlDirective,
  TooltipDirective,
} from '@coreui/angular-pro';
import { IconComponent, IconDirective } from '@coreui/icons-angular';
import { FilterCoursesPipe } from '@infra-adapters/pipe/FilteredCourses.pipe';
import { InstitutionManager } from '@infra-adapters/services/institution.service';
import { sociogramManager } from '@infra-adapters/services/sociogram.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'institutions-sociograms',
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

    FormControlDirective,
    FormDirective,
    TextColorDirective,
    InputGroupTextDirective,
    IconDirective,
    ButtonDirective,
    FormLabelDirective,
    FormControlDirective,
    ContainerComponent,
    IconComponent,
    CardComponent,
    CardHeaderComponent,
    CardBodyComponent,
    FormCheckComponent,
    FormCheckInputDirective,
    FormCheckLabelDirective,
    FormSelectDirective,
    FilterCoursesPipe,
    TooltipDirective,
  ],
  templateUrl: './institutions-sociograms.component.html',
  styleUrl: './institutions-sociograms.component.scss',
})
export class InstitutionsSociogramsComponent implements OnInit {
  sociogram_id: string | null = null;

  listInstitutions: Iinstitution[] = [];

  filterGroup: FormGroup = new FormGroup({ search: new FormControl('') });

  constructor(
    private fb: FormBuilder,
    private sociogramService: sociogramManager,
    private institutionService: InstitutionManager,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.sociogram_id = this.route.snapshot.queryParamMap.get('sociogram');
    if (this.sociogram_id) {
      this.loadInstitutions();
      this.loadInstitutionsToSociogram();
    }
  }

  resetFilter() {
    this.filterGroup.reset();
  }

  get form(): FormGroup {
    return this.sociogramService.institutionsToSociogramForm;
  }

  get institutions(): FormArray {
    return this.form.get('institutions') as FormArray;
  }

  addInstitutions() {
    this.institutions.push(
      this.fb.group({
        institution_id: [null, Validators.required],
        Title: ['new-item', Validators.required],
      })
    );
  }

  removeInstitution(index: number) {
    this.institutions.removeAt(index);
  }

  getInstitutionName(institution_id: number | null): string {
    if (!institution_id) {
      return 'Institución no encontrada';
    }

    const institution = this.listInstitutions.find(
      (option) => Number(option.id) === Number(institution_id)
    );
    return institution?.name || 'Institución no encontrado';
  }

  getFilteredInstitutions(): { id: number; name: string }[] {
    const selected_institution_ids = this.institutions.controls.map((control) =>
      Number(control.get('institution_id')?.value)
    );

    return this.listInstitutions.filter(
      (institution) =>
        !selected_institution_ids.includes(Number(institution.id))
    );
  }

  addAllInstitutions(): void {
    const current_institution_ids = this.institutions.controls.map(
      (control) => control.get('institution_id')?.value
    );

    const institutionsToAdd = this.getFilteredInstitutions().filter(
      (institution) => !current_institution_ids.includes(institution.id)
    );

    institutionsToAdd.forEach((institution) => {
      this.institutions.push(
        this.fb.group({
          institution_id: [institution.id, Validators.required],
          title: [institution.name, Validators.required],
        })
      );
    });
  }

  areAllInstitutionsAdded(): boolean {
    return this.getFilteredInstitutions().length === 0;
  }

  async onSubmit(event: Event) {
    event.preventDefault();
    event.stopImmediatePropagation();

    if (!this.form.valid || !this.institutions.valid) {
      return;
    }

    try {
      const sociogram_id = this.form.get('sociogram_id')?.value;

      const current_institution_ids = this.institutions.controls.map(
        (control) => control.get('institution_id')?.value
      );
      const response = await firstValueFrom(
        this.sociogramService.registerOrUpdateInstitutionsToSociogram({
          sociogram_id,
          institutions: current_institution_ids,
        })
      );

      if (response?.status === 200 || response?.data) {
        this.router.navigate(['/sociograms']);
      }
    } catch (error) {
      console.error('Error al actualizar instituciones del sociograma:', error);
    }
  }

  private async loadInstitutionsToSociogram() {
    const response = await firstValueFrom(
      this.sociogramService.getInstitutionsToSociogram(
        Number(this.sociogram_id)
      )
    );
    this.loadDataToForm(response);
  }

  private loadDataToForm(response: IinstitutionsToSociogramResponse) {
    if (response.data) {
      this.institutions.clear();

      const institutions = response.data.institutions ?? [];

      institutions.forEach((institution) => {
        this.institutions.push(
          this.fb.group({
            institution_id: [institution.id, Validators.required],
            title: [institution.name, Validators.required],
          })
        );
      });

      this.form.patchValue({
        sociogram_id: response.data.id,
        title: response.data.title,
      });
    }
  }

  private async loadInstitutions() {
    const response = await firstValueFrom(
      await this.institutionService.loadInstitutions()
    );
    this.listInstitutions = response.data ?? [];
  }
}
