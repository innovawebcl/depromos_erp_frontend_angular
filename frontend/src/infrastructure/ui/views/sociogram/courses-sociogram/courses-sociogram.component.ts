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
import { Icourse } from '@core-ports/outputs/course';
import { IcoursesToSociogramResponse } from '@core-ports/outputs/sociograms';
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
} from '@coreui/angular-pro';
import { IconComponent, IconDirective } from '@coreui/icons-angular';
import { CourseManager } from '@infra-adapters/services/course.service';
import { sociogramManager } from '@infra-adapters/services/sociogram.service';
import { firstValueFrom } from 'rxjs';
import { FilterCoursesPipe } from '@infra-adapters/pipe/FilteredCourses.pipe';
@Component({
  selector: 'courses-sociogram',
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
    IconComponent,
    CardComponent,
    CardHeaderComponent,
    CardBodyComponent,
    FormCheckComponent,
    FormCheckInputDirective,
    FormCheckLabelDirective,
    FormSelectDirective,
    FilterCoursesPipe,
  ],
  templateUrl: './courses-sociogram.component.html',
  styleUrl: './courses-sociogram.component.scss',
})
export class CoursesSociogramComponent implements OnInit {
  sociogram_id: string | null = null;

  listCourses: Icourse[] = [];

  filterGroup: FormGroup = new FormGroup({ search: new FormControl('') });

  constructor(
    private fb: FormBuilder,
    private sociogramService: sociogramManager,
    private coursesService: CourseManager,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.sociogram_id = this.route.snapshot.queryParamMap.get('sociogram');

    if (this.sociogram_id) {
      this.loadCourses();
      this.loadCoursesToSociogram();
    }
  }

  resetFilter() {
    this.filterGroup.reset();
  }

  get form(): FormGroup {
    return this.sociogramService.coursesToSociogramForm;
  }

  get courses(): FormArray {
    return this.form.get('courses') as FormArray;
  }

  addCourse() {
    this.courses.push(
      this.fb.group({
        course_id: [null, Validators.required],
        Title: ['new-item', Validators.required],
      })
    );
  }

  removeCourse(index: number) {
    this.courses.removeAt(index);
  }

  getCourseName(courseId: number | null): string {
    if (!courseId) {
      return 'Curso no encontrado';
    }
    const course = this.listCourses.find(
      (option) => option.id === Number(courseId)
    );
    return course?.name || 'Curso no encontrado';
  }

  getFilteredCourses(): { id: number; name: string }[] {
    const selectedCourseIds = this.courses.controls.map((control) =>
      Number(control.get('course_id')?.value)
    );

    return this.listCourses.filter(
      (course) => !selectedCourseIds.includes(Number(course.id))
    );
  }

  addAllCourses(): void {
    const currentCourseIds = this.courses.controls.map(
      (control) => control.get('course_id')?.value
    );

    const coursesToAdd = this.getFilteredCourses().filter(
      (course) => !currentCourseIds.includes(course.id)
    );

    coursesToAdd.forEach((course) => {
      this.courses.push(
        this.fb.group({
          course_id: [course.id, Validators.required],
          title: [course.name, Validators.required],
        })
      );
    });
  }

  areAllCoursesAdded(): boolean {
    return this.getFilteredCourses().length === 0;
  }

  async onSubmit() {
    if (this.form.valid && this.courses.valid) {
      const sociogram_id = this.form.get('sociogram_id')?.value;
      const currentCourseIds = this.courses.controls.map(
        (control) => control.get('course_id')?.value
      );

      this.sociogramService
        .registerOrUpdateCoursesToSociogram({
          sociogram_id,
          courses: currentCourseIds,
        })
        .subscribe({
          next: (_) => {
            this.router.navigate(['/sociograms']);
          },
          error: (error) => {
            console.error('Error al actualizar:', error);
          },
        });
    }
  }

  private async loadCoursesToSociogram() {
    const response = await firstValueFrom(
      this.sociogramService.getCoursesToSociogram(Number(this.sociogram_id))
    );
    this.loadDataToForm(response);
  }

  private loadDataToForm(response: IcoursesToSociogramResponse) {
    if (response.data) {
      const courses = response.data.courses ?? [];
      this.courses.clear();

      courses.forEach((course) => {
        this.courses.push(
          this.fb.group({
            course_id: [course.id, Validators.required],
            title: [course.name, Validators.required],
          })
        );
      });

      this.form.patchValue({
        sociogram_id: response.data.id,
        title: response.data.title,
      });
    }
  }

  private async loadCourses() {
    const response = await firstValueFrom(
      await this.coursesService.loadCourses()
    );
    this.listCourses = response.data ?? [];
  }
}
