import { Component, OnInit } from '@angular/core';

import {
  FormBuilder,
  FormArray,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';

import { BehaviorSubject, Subject, firstValueFrom } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';

import { studentManager } from '@infra-adapters/services/student.service';
import { CourseManager } from '@infra-adapters/services/course.service';
import { TranslateKinshipPipe } from '@infra-adapters/pipe/TranslateKinship.pipe';

import type { Icourse } from '@core-ports/outputs/course';
import type { IstudentInput } from '@core-ports/inputs/student';
import { Kinship } from '@core-interfaces/global';

import type {
  ICourseStudentsForm,
  IGuardianStudentForm,
  IStudentFormInput,
} from '@core-interfaces/services/student';

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
  MultiSelectComponent,
  MultiSelectOptionComponent,
} from '@coreui/angular-pro';

import { IconComponent, IconDirective } from '@coreui/icons-angular';
import { CommonModule, NgStyle } from '@angular/common';
import { RutDirective } from '@infra-adapters/directives/rut.directive';
import { RutPipe } from '@infra-adapters/pipe/Rut.pipe';

@Component({
  selector: 'form-student',
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
    TranslateKinshipPipe,
    MultiSelectComponent,
    MultiSelectOptionComponent,
    RutDirective,
    RutPipe,
  ],
  templateUrl: './form-student.component.html',
  styleUrls: ['./form-student.component.scss'],
  providers: [RutPipe],
})
export class FormStudentComponent implements OnInit {
  levels: string[] = [
    'Primero Básico',
    'Segundo Básico',
    'Tercero Básico',
    'Cuarto Básico',
    'Quinto Básico',
    'Sexto Básico',
    'Séptimo Básico',
    'Octavo Básico',
    'Primero Medio',
    'Segundo Medio',
    'Tercero Medio',
    'Cuarto Medio',
  ];

  kinshipArray: string[] = Object.values(Kinship);

  student_id: string | null = null;
  private courseSubject = new BehaviorSubject<Icourse[]>([]);
  isLoading: Subject<boolean> = new Subject();

  coursesOptions = this.courseSubject.asObservable();
  kinshipOptions = Object.values(Kinship).map((kinship) => kinship);

  constructor(
    private fb: FormBuilder,
    private studentService: studentManager,
    private courseService: CourseManager,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.student_id = this.route.snapshot.queryParamMap.get('id');
    this.form.reset();
    this.courses.clear();
    this.guardians.clear();
    if (this.student_id) {
      this.loadStudentByID(Number(this.student_id));
    } else {
      this.addCourse();
      this.addGuardian();
    }
    this.loadCourses();
  }

  async onSubmit() {
    this.form.markAllAsTouched();
    console.log(this.form.valid, this.form.errors);

    if (this.form.valid) {
      if (this.student_id) {
        this.updateStudent();
      } else {
        this.createStudent();
      }
    }
  }

  get form() {
    return this.studentService.studentForm;
  }

  get courses(): FormArray {
    return this.form.get('courses') as FormArray;
  }

  get guardians(): FormArray {
    return this.form.get('guardians') as FormArray;
  }

  addCourse() {
    this.courses.push(
      this.fb.group({
        course_id: [null, Validators.required],
      })
    );
  }

  removeCourse(index: number) {
    this.courses.removeAt(index);
  }

  addGuardian() {
    this.guardians.push(
      this.fb.group({
        name: ['', Validators.required],
        last_name: ['', Validators.required],
        kinship: [null, Validators.required],
        email: ['', [Validators.required, Validators.email]],
        phone: ['', Validators.required],
      })
    );
  }

  removeGuardian(index: number) {
    this.guardians.removeAt(index);
  }

  getErrorMessage(controlName: keyof IStudentFormInput): string | null {
    return this.studentService.getErrorMessage(controlName);
  }

  getCourseErrorMessage(
    index: number,
    controlName: keyof ICourseStudentsForm
  ): string | null {
    return this.studentService.getCourseErrorMessage(index, controlName);
  }

  getGuardiansErrorMessage(
    index: number,
    controlName: keyof IGuardianStudentForm
  ): string | null {
    return this.studentService.getGuardianErrorMessage(index, controlName);
  }

  private async loadStudentByID(id: number) {
    const student = await firstValueFrom(
      await this.studentService.loadStudentByID(id)
    );
    if (student.data) {
      const courses = student.data.courses ?? [];
      const guardians = student.data.guardians ?? [];

      this.courses.clear();

      courses.forEach((course) =>
        this.courses.push(
          this.fb.group({
            course_id: [course.id, Validators.required],
          })
        )
      );

      this.guardians.clear();

      guardians.forEach((guardian) => {
        this.guardians.push(
          this.fb.group({
            name: [guardian.name, Validators.required],
            last_name: [guardian.last_name, Validators.required],
            kinship: [guardian.kinship, Validators.required],
            email: [guardian.email, [Validators.required, Validators.email]],
            phone: [guardian.phone, Validators.required],
          })
        );
      });

      this.form.get('password')?.clearValidators();
      this.form.patchValue({
        username: student.data.user.username,
        password: '',
        first_name: student.data.user.detail?.first_name,
        second_name: student.data.user.detail?.second_name,
        second_last_name: student.data.user.detail?.second_last_name,
        last_name: student.data.user.detail?.last_name,
        email: student.data.user.detail?.email,
        birth_date: student.data.user.detail?.birth_date,
        rut: student.data.user.detail?.rut ?? '',
        address: student.data.address,
        medical_diagnosis: student.data.medical_diagnosis,
        number_of_siblings: student.data.number_of_siblings,
        people_living_with: student.data.people_living_with,
        repeated_courses: student.data.repeated_courses ?? [],
        years_in_school: student.data.years_in_school ?? 0,
      });
      this.form.get('password')?.updateValueAndValidity();
    }
  }

  private async updateStudent() {
    const repeated_courses = this.form.value.repeated_courses ?? [];
    const people_living_with = this.form.value.people_living_with ?? [];
    const serialize = {
      ...this.form.value,
      people_living_with: people_living_with.join(';'),
      repeated_courses: repeated_courses.join(';'),
    };
    const response = await firstValueFrom(
      await this.studentService.updateStudent(
        serialize as unknown as IstudentInput,
        Number(this.student_id)
      )
    );
    if (response) {
      this.router.navigate(['/students']);
    }
  }

  private async createStudent() {
    const repeated_courses = this.form.value.repeated_courses ?? [];
    const people_living_with = this.form.value.people_living_with ?? [];
    const serialize = {
      ...this.form.value,
      people_living_with: people_living_with.join(';'),
      repeated_courses: repeated_courses.join(';'),
    };
    const response = await firstValueFrom(
      await this.studentService.storeStudent(
        serialize as unknown as IstudentInput
      )
    );
    if (response) {
      this.router.navigate(['/students']);
    }
  }

  private async loadCourses() {
    this.isLoading.next(true);
    const response = await firstValueFrom(
      await this.courseService.loadCourses()
    );
    this.courseSubject.next(response.data ?? []);
    this.isLoading.next(false);
  }
}
