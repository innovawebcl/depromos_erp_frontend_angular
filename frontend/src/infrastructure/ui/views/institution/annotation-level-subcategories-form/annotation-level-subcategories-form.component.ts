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
import { AnnotationSubcategoryService } from '@infra-adapters/services/annotationSubcategory.service';
import { Subject, firstValueFrom } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { IconComponent } from '@coreui/icons-angular';
import { CommonModule, NgStyle } from '@angular/common';
import { IAnnotationLevelFormInput } from '@core-interfaces/services/institution';
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
  templateUrl: './annotation-level-subcategories-form.component.html',
  styleUrl: './annotation-level-subcategories-form.component.scss',
})
export class AnnotationLevelCategoriesFormComponent implements OnInit {
  annotation_level_id: number | null = null;
  subcategoryToDelete: number | null = null;
  custom_label: string = '';
  deleteModalVisible: boolean = false;
  loading$ = new Subject<boolean>();
  subcategories: any[] = [];

  annotationLevelOptions = Object.values(AnnotationLevel);

  constructor(
    private institutionService: InstitutionManager,
    private annotationSubcategoryService: AnnotationSubcategoryService,
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
  }

  async onSubmit() {
    if (this.form.valid) {
      try {
        if (this.annotation_level_id) {
          await this.createSubcategory();
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
    this.custom_label = response.data?.custom_label || '';

    if (response.data) {
      this.form.patchValue(response.data);
    }
    this.form.get('custom_label')?.reset();
    const responseSubcategorias = await firstValueFrom(
      this.annotationSubcategoryService.getSubcategoriesByInstitutionAnnotationLevel(
        this.annotation_level_id!
      )
    );

    this.subcategories = responseSubcategorias.data;

    this.loading$.next(false);
  }

  private async createSubcategory() {
    this.loading$.next(true);
    const subcategoryData = {
      institution_annotation_level_id: this.annotation_level_id!,
      subcategory: this.form.value.custom_label ?? '',
    };

    try {
      const response = await firstValueFrom(
        this.annotationSubcategoryService.createSubcategory(subcategoryData)
      );

      if (response.data) {
        this.subcategories = [...this.subcategories, response.data]; 
        this.form.get('custom_label')?.reset(); 
      }
    } catch (error) {
      console.error('Error creando la subcategoría:', error);
    }
    this.loading$.next(false);
  }

  openDeleteModal(id: number): void {
    this.subcategoryToDelete = id;
    this.deleteModalVisible = true;
  }

  deleteSubcategory(id: number): void {
    if (confirm('¿Estás seguro de eliminar esta subcategoría?')) {
      this.annotationSubcategoryService.deleteSubcategory(id).subscribe({
        next: () => {
          this.subcategories = this.subcategories.filter(
            (sub) => sub.id !== id
          );
        },
        error: (error) => {
          console.error('Error eliminando la subcategoría:', error);
        },
      });
    }
  }
  onConfirmDelete(): void {
    if (this.subcategoryToDelete !== null) {
      this.annotationSubcategoryService.deleteSubcategory(this.subcategoryToDelete).subscribe({
        next: () => {
          this.subcategories = this.subcategories.filter(sub => sub.id !== this.subcategoryToDelete);
          this.resetModal();
        },
        error: (error) => {
          console.error('Error eliminando la subcategoría:', error);
          this.resetModal();
        },
      });
    }
  }

  resetModal(): void {
    this.subcategoryToDelete = null;
    this.deleteModalVisible = false;
  }


  getErrorMessage(controlName: keyof IAnnotationLevelFormInput): string | null {
    return this.institutionService.getAnnotationLevelErrorMessage(controlName);
  }
}
