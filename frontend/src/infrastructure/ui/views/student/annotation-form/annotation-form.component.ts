import { CommonModule, NgStyle } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
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
  FormSelectDirective,
} from '@coreui/angular-pro';
import { IconDirective } from '@coreui/icons-angular';
import { studentManager } from '@infra-adapters/services/student.service';
import { AnnotationLevel } from '@core-interfaces/global';
import { TranslateAnnotationLevelPipe } from '@infra-adapters/pipe/TranslateAnnotationLevel.pipe';
import { BehaviorSubject, Subject, firstValueFrom } from 'rxjs';
import { IannotationInput } from '@core-ports/inputs/annotation';
import { InstitutionManager } from '@infra-adapters/services/institution.service';
import { IInstitutionAnnotationLevel } from '@core-ports/outputs/annotationLevel';
import { mapAnnotationLevel } from '@utils/AnnotationLevel';
import { CourseManager } from '@infra-adapters/services/course.service';
import { AnnotationSubcategoryService } from '@infra-adapters/services/annotationSubcategory.service';

@Component({
  selector: 'annotation-form',
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
    FormSelectDirective,
    TranslateAnnotationLevelPipe,
  ],
  providers: [TranslateAnnotationLevelPipe],
  templateUrl: './annotation-form.component.html',
  styleUrl: './annotation-form.component.scss',
})
export class AnnotationFormComponent implements OnInit {
  private entity_id: number | null = null;
  subcategories: any[] = [];
  isGeneral = false;
  studentName: string | null = '';
  courseName: string | null = '';
  generalLevelOptions = Object.values(AnnotationLevel)
    .map((level) => level)
    .filter((level) => level.includes('general'));
  individualLevelOptions = Object.values(AnnotationLevel)
    .map((level) => level)
    .filter((level) => !level.includes('general'));
  annotationLevelOptions: string[] = [];

  isLoading$: Subject<boolean> = new Subject();

  private annotationLevelSubject = new BehaviorSubject<
    IInstitutionAnnotationLevel[]
  >([]);
  annotationLevels$ = this.annotationLevelSubject.asObservable();

  constructor(
    private institutionService: InstitutionManager,
    private studentService: studentManager,
    private courseService: CourseManager,
    private activeRoute: ActivatedRoute,
    private router: Router,
    private annotationSubcategoryService: AnnotationSubcategoryService
  ) {}

  ngOnInit(): void {
    this.form.reset();
    this.entity_id = this.activeRoute.snapshot.params['id'];
    const fullPath = this.router.url;
    if (fullPath.includes('courses')) {
      this.isGeneral = true;
      this.courseName = this.activeRoute.snapshot.queryParams['courseName'];
      this.annotationLevelOptions = this.generalLevelOptions;
    } else if (fullPath.includes('students')) {
      this.isGeneral = false;
      this.studentName = this.activeRoute.snapshot.queryParams['studentName'];
      this.annotationLevelOptions = this.individualLevelOptions;
    }
    this.loadAnnotationLevels();

    this.form.get('type')?.valueChanges.subscribe((annotationType) => {
      if (annotationType) {
        this.loadSubcategories(annotationType);
      } else {
        this.subcategories = [];
        this.form.get('subcategory')?.setValue(null);
      }
    });
  }

  private async loadSubcategories(annotationType: string) {
    console.log(annotationType);

    const selectedAnnotationLevel = this.annotationLevelSubject
      .getValue()
      .find((level) => annotationType === level.annotation_level);
    if (!selectedAnnotationLevel) {
      this.subcategories = [];
      return;
    }

    this.isLoading$.next(true);

    try {
      const responseSubcategorias = await firstValueFrom(
        this.annotationSubcategoryService.getSubcategoriesByInstitutionAnnotationLevel(
          selectedAnnotationLevel.id
        )
      );

      this.subcategories = responseSubcategorias.data ?? [];
      this.form.get('subcategory')?.setValue(null); // Reiniciar selección
    } catch (error) {
      console.error('Error cargando subcategorías', error);
      this.subcategories = [];
    } finally {
      this.isLoading$.next(false);
    }
  }

  getErrorMessage(controlName: string): string | null {
    return this.studentService.getAnnotationErrorMessage(controlName);
  }

  onSubmit() {
    if (this.form.valid) {
      if (this.isGeneral) {
        this.createCourseAnnotation();
      } else {
        this.createStudentAnnotation();
      }
    } else {
      this.form.markAllAsTouched();
    }
  }

  private async createStudentAnnotation() {
    try {
      this.isLoading$.next(true);
      
      const data = {
        ...(this.form.value.subcategory && { subcategory_id: this.form.value.subcategory }),
        observation: this.form.value.observation,
        type: this.form.value.type,
      };
      
      const response = await firstValueFrom(
        await this.studentService.storeAnnotation(
          Number(this.entity_id),
          data as unknown as IannotationInput
        )
      );
      this.isLoading$.next(false);
      if (response) {
        this.router.navigate(['/students', this.entity_id, 'profile']);
      }
    } catch (error) {
      this.isLoading$.next(false);
    }
  }

  private async createCourseAnnotation() {
    try {
      this.isLoading$.next(true);
      const response = await firstValueFrom(
        await this.courseService.storeAnnotation(
          Number(this.entity_id),
          this.form.value as unknown as IannotationInput
        )
      );
      this.isLoading$.next(false);
      if (response) {
        this.router.navigate(['/courses']);
      }
    } catch (error) {
      this.isLoading$.next(false);
    }
  }

  get form() {
    return this.studentService.annotationForm;
  }

  private async loadAnnotationLevels() {
    this.isLoading$.next(true);
    const response = await firstValueFrom(
      await this.institutionService.loadAnnotationLevels()
    );

    if (response.data) {
      this.annotationLevelSubject.next(response.data);
    } else {
      this.annotationLevelSubject.next([]);
    }

    this.isLoading$.next(false);
  }

  mapAnnotationLevel(
    annotationLevels: IInstitutionAnnotationLevel[],
    annotationLevel: string
  ) {
    return mapAnnotationLevel(annotationLevels, annotationLevel);
  }

  public get observation(): string {
  return this.form.get('observation')?.value || '';
}
}
