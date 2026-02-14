import type { Icourse } from '@core-ports/outputs/course';
import { Component, OnInit } from '@angular/core';
import { studentManager } from '@infra-adapters/services/student.service';
import { firstValueFrom } from 'rxjs';
import {
  AlertComponent,
  BadgeComponent,
  ButtonDirective,
  CardBodyComponent,
  CardComponent,
  CardGroupComponent,
  CardHeaderComponent,
  ColComponent,
  CollapseDirective,
  ContainerComponent,
  IColumn,
  ModalComponent,
  ProgressBarComponent,
  ProgressComponent,
  RowComponent,
  SmartTableComponent,
  SmartTableFilterComponent,
  TemplateIdDirective,
  TextColorDirective,
  TooltipModule,
} from '@coreui/angular-pro';
import { IconComponent } from '@coreui/icons-angular';
import { CommonModule, NgStyle } from '@angular/common';
import { Router } from '@angular/router';
import { Isociogram } from '@core-ports/outputs/sociograms';

@Component({
  selector: 'sociogram-list',
  standalone: true,
  imports: [
    CommonModule,
    BadgeComponent,
    ButtonDirective,
    CollapseDirective,
    SmartTableComponent,
    TemplateIdDirective,
    TextColorDirective,
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
    AlertComponent,
    TooltipModule,
    ProgressBarComponent,
    ProgressComponent,
  ],
  templateUrl: './sociogram-list.component.html',
  styleUrl: './sociogram-list.component.scss',
})
export class SociogramListComponent implements OnInit {
  sociogramsByCourses: Icourse[] = [];
  sociograms: Isociogram[] = [];

  is_finished_sociogram: boolean = true;

  columns: IColumn[] = [
    {
      key: 'name',
      label: 'Curso',
    },
    {
      key: 'sociogram_count',
      label: 'Sociogramas',
    },
    {
      key: 'actions',
      label: '',
      _style: { width: '5%' },
      filter: false,
      sorter: false,
    },
  ];

  details_visible = Object.create({});

  constructor(private studentService: studentManager, private router: Router) {}

  ngOnInit(): void {
    this.loadCourses();
  }

  toggleDetails(id: number) {
    this.details_visible[id] = !this.details_visible[id];
    this.loadSociogramsByIDCourse(id);
  }

  startQuestionnaire(course_id: number, sociogram_id: number) {
    this.router.navigate(['students/answer/sociograms'], {
      queryParams: {
        course_id,
        sociogram_id,
      },
    });
  }

  private async loadCourses() {
    const response = await firstValueFrom(
      await this.studentService.getCourses()
    );
    this.sociogramsByCourses = response.data?.courses ?? [];
  }
  private async loadSociogramsByIDCourse(course_id: number) {
    try {
      const response = await firstValueFrom(
        await this.studentService.getSociogramsByCourse(course_id)
      );

      const course = response.data?.courses;

      if (course && course.length > 0) {
        if (Array.isArray(course[0].sociogram)) {
          this.sociograms = course[0].sociogram;
        } else if (
          course[0].sociogram &&
          typeof course[0].sociogram === 'object'
        ) {
          this.sociograms = [course[0].sociogram];
        }
        console.log(this.sociograms);
        this.sociograms = this.sociograms.map((s: Isociogram) => ({
          ...s,
          is_finished_sociogram: this.studentService.isFinishSociogram(s.id),
        }));
      }
    } catch (error) {
      throw new Error('Sin resultados');
    }
  }

  getStudentSociogramProgress(sociogram: Isociogram) {
    const totalQuestions = sociogram.questions.length;
    const uniqueStudentResponses = new Set(
      sociogram.student_responses?.map(
        (response) => response.sociogram_question_id
      ) ?? []
    );
    const uniqueStudentClassmateResponses = new Set(
      sociogram.student_classmate_responses?.map(
        (response) => response.sociogram_question_id
      ) ?? []
    );
    return Math.round(
      ((uniqueStudentResponses.size + uniqueStudentClassmateResponses.size) /
        totalQuestions) *
        100
    );
  }
}
