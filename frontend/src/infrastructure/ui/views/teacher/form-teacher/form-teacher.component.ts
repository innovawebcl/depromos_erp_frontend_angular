import { CommonModule, NgStyle } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  type FormArray,
  type FormGroup,
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { ActivatedRoute, Router } from '@angular/router';

import {
  type BoolOrNull,
  type NumberOrNull,
  type StringOrNull,
  TeacherRole,
} from '@core-interfaces/global';

import type {
  ICourseTeachersForm,
  ITeacherFormInput,
} from '@core-interfaces/services/teacher';

import type { IteacherInput } from '@core-ports/inputs/teacher';
import type { Icourse } from '@core-ports/outputs/course';

import { TranslateTeacherRolePipe } from '@infra-adapters/pipe/TranslateTeacher.pipe';
import { CourseManager } from '@infra-adapters/services/course.service';
import { teacherManager } from '@infra-adapters/services/teacher.service';

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
} from '@coreui/angular-pro';

import { IconComponent, IconDirective } from '@coreui/icons-angular';
import { BehaviorSubject, firstValueFrom, Subject } from 'rxjs';
import { RutDirective } from '@infra-adapters/directives/rut.directive';
import { RutPipe } from '@infra-adapters/pipe/Rut.pipe';

@Component({
  selector: 'form-teacher',
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
    TranslateTeacherRolePipe,
    FormSelectDirective,
    RutDirective,
    RutPipe,
  ],
  templateUrl: './form-teacher.component.html',
  styleUrl: './form-teacher.component.scss',
  providers: [RutPipe],
})
export class FormTeacherComponent implements OnInit {
  teacher_id: string | null = '';

  private courseSubject = new BehaviorSubject<Icourse[]>([]);
  isLoading: Subject<boolean> = new Subject();

  coursesOptions = this.courseSubject.asObservable();

  roleOptions = Object.values(TeacherRole).map((role) => role);

  constructor(
    private teacherService: teacherManager,
    private courseService: CourseManager,
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.form.reset();
    this.courses.clear();
    this.teacher_id = this.route.snapshot.queryParamMap.get('id');
    if (
      typeof this.teacher_id === 'string' &&
      !isNaN(Number(this.teacher_id))
    ) {
      this.loadTeacherByID(Number(this.teacher_id));
    } else {
      this.addCourse();
    }
    this.loadCourses();
  }

  async onSubmit() {
    const coursesFormArray = this.form.get('courses') as FormArray;
    if (this.form.valid && coursesFormArray.valid) {
      if (
        typeof this.teacher_id === 'string' &&
        !isNaN(Number(this.teacher_id))
      ) {
        this.update();
      } else {
        this.store();
      }
    }
  }

  getErrorMessage(controlName: keyof ITeacherFormInput): string | null {
    return this.teacherService.getErrorMessage(controlName);
  }
  getCourseErrorMessage(
    index: number,
    controlName: keyof ICourseTeachersForm
  ): string | null {
    return this.teacherService.getCourseErrorMessage(index, controlName);
  }

  get form() {
    return this.teacherService.teacherForm;
  }

  private async loadTeacherByID(id: number) {
    const teacher = await firstValueFrom(
      await this.teacherService.loadTeacherByID(id)
    );

    if (teacher.data) {
      const courses = teacher.data.courses ?? [];

      const coursesFormArray = this.form.get('courses') as FormArray;
      coursesFormArray.clear();

      courses.forEach((course) => {
        coursesFormArray.push(
          this.fb.group({
            course_id: [course.id, Validators.required],
            is_substitute: [course.detail?.is_substitute ?? false],
            role: [course.detail?.role, Validators.required],
          })
        );
      });

      this.form.get('password')?.clearValidators();
      this.form.patchValue({
        username: teacher.data.user.username,
        password: '',
        first_name: teacher.data.user.detail?.first_name,
        last_name: teacher.data.user.detail?.last_name,
        email: teacher.data.user.detail?.email,
        birth_date: teacher.data.user.detail?.birth_date,
        rut: teacher.data.user.detail?.rut,
        subject_specialty: teacher.data.subject_specialty,
      });
      this.form.get('password')?.updateValueAndValidity();
    }
  }

  private async update() {
    (
      await this.teacherService.updateTeacher(
        this.form.value as IteacherInput,
        Number(this.teacher_id)
      )
    ).subscribe({
      next: (_) => {
        this.router.navigate(['/teachers']);
      },
      error: (error) => {
        console.error('Error al actualizar:', error);
      },
    });
  }

  private async store() {
    (
      await this.teacherService.storeTeacher(this.form.value as IteacherInput)
    ).subscribe({
      next: (_) => {
        this.router.navigate(['/teachers']);
      },
      error: (error) => {
        if (error.error.data) {
          const errors = error.error.data;
          for (const key in errors) {
            if (Object.prototype.hasOwnProperty.call(errors, key)) {
              const element = errors[key];
              this.teacherService.errorMessages[key]['server'] = element[0];
              this.form.get(key)?.setErrors({ server: element });
            }
          }
        }
      },
    });
  }

  get courses(): FormArray<FormGroup<ICourseTeachersForm>> {
    return this.form.get('courses') as FormArray<
      FormGroup<ICourseTeachersForm>
    >;
  }

  addCourse() {
    const courseGroup: FormGroup<ICourseTeachersForm> =
      this.fb.group<ICourseTeachersForm>({
        course_id: this.fb.control<NumberOrNull>(null, [Validators.required]),
        role: this.fb.control<StringOrNull>(null, [Validators.required]),
        is_substitute: this.fb.control<BoolOrNull>(false),
      });
    this.courses.push(courseGroup);
  }

  removeCourse(index: number) {
    this.courses.removeAt(index);
  }

  private async loadCourses() {
    this.isLoading.next(true);
    this.courseService
      .loadCourses()
      .then((item) => {
        item.subscribe((response) => {
          this.isLoading.next(false);
          this.courseSubject.next(response.data ?? []);
        });
      })
      .catch((err) => {
        this.isLoading.next(false);
      });
  }


}
