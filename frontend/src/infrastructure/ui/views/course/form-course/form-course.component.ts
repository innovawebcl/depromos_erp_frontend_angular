import type { IcourseInput } from '@core-ports/inputs/course';
import type { IcourseFormInput } from '@core-interfaces/services/course';

import { CourseManager } from '@infra-adapters/services/course.service';

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

import { BehaviorSubject, firstValueFrom } from 'rxjs';
import type { Iinstitution } from '@core-ports/outputs/institution';

@Component({
  selector: 'form-course',
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
  ],
  templateUrl: './form-course.component.html',
  styleUrl: './form-course.component.scss',
})
export class FormCourseComponent implements OnInit {
  private course_id: string | null = '';
  private institutionSubject = new BehaviorSubject<Iinstitution[]>([]);
  institutions = this.institutionSubject.asObservable();

  constructor(
    private courseService: CourseManager,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.form.reset();
    this.course_id = this.route.snapshot.queryParamMap.get('id');
    if (typeof this.course_id === 'string' && !isNaN(Number(this.course_id))) {
      this.loadCourseByID(Number(this.course_id));
    }
  }

  async onSubmit() {
    if (this.form.valid) {
      if (
        typeof this.course_id === 'string' &&
        !isNaN(Number(this.course_id))
      ) {
        this.update();
      } else {
        this.store();
      }
    }
  }

  getErrorMessage(controlName: keyof IcourseFormInput): string | null {
    return this.courseService.getErrorMessage(controlName);
  }

  get form() {
    return this.courseService.courseForm;
  }

  private async loadCourseByID(id: number) {
    const course = await firstValueFrom(
      await this.courseService.loadCourseByID(id)
    );
    if (course.data) {
      this.form.setValue({
        // level: course.data.level,
        name: course.data.name,
      });
    }
  }

  private async update() {
    (
      await this.courseService.updateCourse(
        this.form.value as IcourseInput,
        Number(this.course_id)
      )
    ).subscribe({
      next: (condos) => {
        this.router.navigate(['/courses']);
      },
      error: (error) => {
        console.error('Error al actualizar:', error);
      },
    });
  }

  private async store() {
    (
      await this.courseService.storeCourse(this.form.value as IcourseInput)
    ).subscribe({
      next: (condos) => {
        this.router.navigate(['/courses']);
      },
      error: (error) => {
        console.error('Error al crear:', error);
      },
    });
  }
}
