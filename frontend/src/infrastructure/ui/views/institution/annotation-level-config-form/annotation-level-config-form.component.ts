import { Component, OnInit } from '@angular/core';
import {
  BadgeComponent,
  ButtonDirective,
  CardBodyComponent,
  CardComponent,
  CardGroupComponent,
  CardHeaderComponent,
  ColComponent,
  CollapseDirective,
  ContainerComponent,
  ModalComponent,
  RowComponent,
  SmartTableComponent,
  SmartTableFilterComponent,
  TemplateIdDirective,
  TextColorDirective,
  TooltipDirective,
  type IColumn,
  InputGroupComponent,
  FormModule,
  SpinnerComponent,
} from '@coreui/angular-pro';
import { InstitutionManager } from '@infra-adapters/services/institution.service';
import { Subject, firstValueFrom } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { IconComponent } from '@coreui/icons-angular';
import { CommonModule, NgStyle } from '@angular/common';
import { IAnnotationLevelFormInput } from '@core-interfaces/services/institution';
import { IInstitutionAnnotationLevelInput } from '@core-ports/inputs/annotationLevel';
import { AnnotationLevel } from '@core-interfaces/global';
import { TranslateAnnotationLevelPipe } from '@infra-adapters/pipe/TranslateAnnotationLevel.pipe';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'annotation-level-config-form',
  standalone: true,
  imports: [
    CommonModule,
    FormModule,
    ReactiveFormsModule,
    BadgeComponent,
    ButtonDirective,
    CollapseDirective,
    SmartTableComponent,
    TemplateIdDirective,
    TextColorDirective,
    InputGroupComponent,
    RowComponent,
    ColComponent,
    CardComponent,
    CardHeaderComponent,
    CardBodyComponent,
    SmartTableFilterComponent,
    ContainerComponent,
    CardGroupComponent,
    NgStyle,
    IconComponent,
    ModalComponent,
    TooltipDirective,
    TranslateAnnotationLevelPipe,
    SpinnerComponent,
  ],
  templateUrl: './annotation-level-config-form.component.html',
  styleUrl: './annotation-level-config-form.component.scss',
})
export class AnnotationLevelConfigFormComponent implements OnInit {
  annotation_level_id: number | null = null;
  loading$ = new Subject<boolean>();

  annotationLevelOptions = Object.values(AnnotationLevel);

  constructor(
    private institutionService: InstitutionManager,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  get form() {
    return this.institutionService.institutionAnnotationLevelForm;
  }

  ngOnInit(): void {
    this.form.reset();
    const annotationLevelParamId = this.route.snapshot.queryParamMap.get('id');
    if (annotationLevelParamId) {
      this.annotation_level_id = parseInt(annotationLevelParamId);
      this.form.get('annotation_level')?.disable();
      this.loadById();
    }
    else {
      this.form.get('annotation_level')?.enable();
    }
  }

  async onSubmit() {
    if (this.form.valid) {
      try {
        if (this.annotation_level_id) {
          await this.update();
        } else {
          await this.store();
        }
      } catch (error) {
        console.error(error);
        this.loading$.next(false);
      }
    }
  }

  private async loadById() {
    this.loading$.next(true);
    const response = await firstValueFrom(
      await this.institutionService.loadAnnotationLevelByID(
        this.annotation_level_id!
      )
    );
    if (response.data) {
      this.form.patchValue(response.data);
    }
    this.loading$.next(false);
  }

  private async store() {
    this.loading$.next(true);
    const response = await firstValueFrom(
      await this.institutionService.storeAnnotationLevel(
        this.form.value as IInstitutionAnnotationLevelInput
      )
    );
    if (response) {
      this.router.navigate(['/institutions/annotation-level']);
    }
    this.loading$.next(false);
  }

  private async update() {
    this.loading$.next(true);
    const response = await firstValueFrom(
      await this.institutionService.updateAnnotationLevel(
        this.form.value as IInstitutionAnnotationLevelInput,
        this.annotation_level_id!
      )
    );
    if (response) {
      this.router.navigate(['/institutions/annotation-level']);
    }
    this.loading$.next(false);
  }

  getErrorMessage(controlName: keyof IAnnotationLevelFormInput): string | null {
    return this.institutionService.getAnnotationLevelErrorMessage(controlName);
  }
}
