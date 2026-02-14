import { CommonModule, NgStyle } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import type { Ioption } from '@core-interfaces/global';
import type {
  IanswerTypes,
  Iquestion,
  Isociogram,
} from '@core-ports/outputs/sociograms';
import type { IstudentAnswerClassmate } from '@core-ports/outputs/studentAnswerClassmate';
import {
  CardBodyComponent,
  FormControlDirective,
  CardComponent,
  CardHeaderComponent,
  ContainerComponent,
  FormCheckComponent,
  FormCheckInputDirective,
  FormCheckLabelDirective,
  FormLabelDirective,
  FormSelectDirective,
  ButtonDirective,
  InputGroupTextDirective,
  TextColorDirective,
  FormDirective,
  SpinnerComponent,
  FormFeedbackComponent,
  InputGroupComponent,
  ColComponent,
  RowComponent,
  MultiSelectComponent,
  MultiSelectOptionComponent,
  AlertComponent,
} from '@coreui/angular-pro';
import { IconComponent, IconDirective } from '@coreui/icons-angular';
import { sociogramManager } from '@infra-adapters/services/sociogram.service';
import { studentManager } from '@infra-adapters/services/student.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'sociogram-form',
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
    FormSelectDirective,
    MultiSelectComponent,
    MultiSelectOptionComponent,
    FormCheckInputDirective,
    FormCheckLabelDirective,
    AlertComponent,
  ],
  templateUrl: './sociogram-form.component.html',
  styleUrl: './sociogram-form.component.scss',
})
export class SociogramFormComponent implements OnInit {
  sociogram_id: string | null = null;
  course_id: string | null = null;
  sociogram: Isociogram | null = null;
  typesAnswer: IanswerTypes | null = null;
  classmateList: Ioption[] | null = null;
  form: FormGroup = this.fb.group({});
  isMultiSelectOpen: boolean = false;

  is_finished_sociogram: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private sociogramService: sociogramManager,
    private studentService: studentManager,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.sociogram_id = this.route.snapshot.queryParamMap.get('sociogram_id');
    this.course_id = this.route.snapshot.queryParamMap.get('course_id');
    if (this.sociogram_id && this.course_id) {
      this.loadResources();
      this.loadSociogramByID(Number(this.course_id), Number(this.sociogram_id));
      this.validateSociogram(Number(this.sociogram_id));
    }
  }

  async validateSociogram(sociogram_id: number) {
    const response = await firstValueFrom(
      await this.studentService.isFinishSociogram(sociogram_id)
    );

    this.is_finished_sociogram = response.data?.is_finished ?? false;
  }
  async onFinishSociogram() {
    if (this.sociogram_id) {
      const response = await firstValueFrom(
        await this.studentService.finishSociogram(Number(this.sociogram_id))
      );
      this.is_finished_sociogram = response.data?.is_finished ?? false;
    }
  }

  async initializeForm(questions: Iquestion[]): Promise<void> {
    this.form.reset();
    // * Armado de formulario
    questions.forEach((question) => {
      const control = new FormControl(question.is_multiple_choice ? [] : null);
      this.form.addControl(`question_${question.id}`, control);
    });

    //* Carga de respuestas
    const repsonse = await this.loadAnswerBySociogram();
    //* Asignación de respuetas por id de pregunta
    const answers = repsonse.answers.filter((answer) => answer.question);
    answers.forEach((answer) => {
      const inputControl = this.form.get(`question_${answer.question!.id}`);
      if (inputControl) {
        inputControl.patchValue(answer.value);
      }
    });
    //* Asignación de respuestas tipo compañero de clases
    const classmates = repsonse.answerClassmates.filter(
      (answer) => answer.question
    );

    const questionsWithAnswerForClassmate = classmates.reduce(
      (acc, current) => {
        const questionId = current.question!.id;
        if (!acc[questionId]) {
          acc[questionId] = [];
        }
        acc[questionId].push(current);
        return acc;
      },
      {} as { [key: number]: IstudentAnswerClassmate[] }
    );

    Object.keys(questionsWithAnswerForClassmate).forEach((question_id) => {
      const inputControl = this.form.get(`question_${question_id}`);
      if (inputControl) {
        const values = questionsWithAnswerForClassmate[Number(question_id)].map(
          (answer) => `${answer.student_answer_id}`
        );
        inputControl.setValue(values);
      }
    });
  }

  getOptions(enumKey: keyof IanswerTypes): Ioption[] {
    if (enumKey === 'StudentsClassmate') {
      return this.classmateList ?? [];
    }
    if (enumKey === 'ComfortLevel') {
    }
    const value = this.typesAnswer ? this.typesAnswer[enumKey] : [];
    return value;
  }

  isOptionDisabled(questionId: number, optionValue: string): boolean {
    const control = this.form.get(`question_${questionId}`);
    if (!control) {
      return false;
    }
    const selected = control.value || [];
    return selected.length === 3 && !selected.includes(optionValue);
  }

  async onChange(
    question_id: string,
    type_answer: string,
    is_multiple: string
  ) {
    this.isMultiSelectOpen = !event;
    const question_key: string = `question_${question_id}`;
    const fieldControl = this.form.get(question_key);
    if (fieldControl !== null) {
      if (fieldControl.value !== null) {
        await firstValueFrom(
          await this.studentService.declareAnswerSociogram({
            question_id: Number(question_id),
            sociogram_id: Number(this.sociogram_id),
            value: is_multiple
              ? (fieldControl.value as []).join(';')
              : fieldControl.value,
            course_id: Number(this.course_id),
          })
        );
      }
    }
  }

  async onChangeClassMates(
    event: boolean,
    question_id: string,
    type_answer: string,
    is_multiple: string
  ) {
    this.isMultiSelectOpen = !event;
    const question_key: string = `question_${question_id}`;
    const fieldControl = this.form.get(question_key);
    if (fieldControl !== null && type_answer === 'StudentsClassmate') {
      if (!event) {
        if (is_multiple) {
          const currentValue = fieldControl.value as Array<string>;
          if (currentValue.length > 3) {
            const newValue = currentValue.slice(0, 3);
            fieldControl.setValue(newValue);
          }
        }
        const value = fieldControl.value;

        await firstValueFrom(
          await this.studentService.declareAnswerClassmateSociogram({
            question_id: Number(question_id),
            sociogram_id: Number(this.sociogram_id),
            references: Array.isArray(value) ? value : [value],
            course_id: Number(this.course_id),
          })
        );
      }
    }
  }

  private async loadSociogramByID(course_id: number, sociogram_id: number) {
    const response = await firstValueFrom(
      await this.studentService.getSociogramsByCourseBySociogramID(
        course_id,
        sociogram_id
      )
    );
    const courses = response.data?.courses;

    if (Array.isArray(courses) && courses.length === 1) {
      const course = courses.find((course) => Number(course.id) === course_id);
      if (course) {
        if (Array.isArray(course.sociogram)) {
          const temp = course.sociogram.find(
            (sociogram) => sociogram.id === Number(this.sociogram_id)
          );
          if (temp) {
            this.sociogram = temp;
            this.initializeForm(this.sociogram.questions);
          }
        } else if (course.sociogram) {
          this.sociogram = course.sociogram;
          this.initializeForm(this.sociogram.questions);
        }
      }
    }
  }

  private async loadResources() {
    const answerOptions = await firstValueFrom(
      this.sociogramService.getTypeAnswers()
    );
    this.typesAnswer = answerOptions.data;

    try {
      const classmateOptions = await firstValueFrom(
        await this.studentService.getClassmate(Number(this.course_id))
      );
      const serializeClassmate = classmateOptions.data?.map((classmate) => ({
        value: `${classmate.id}`,
        label: `${classmate.user.detail?.first_name ?? '-'} ${
          classmate.user.detail?.last_name ?? '-'
        }`,
      }));
      this.classmateList = serializeClassmate ?? ([] as Ioption[]);
    } catch (error) {
      console.error(error);
      this.router.navigate(['students/sociograms']);
    }
  }

  private async loadAnswerBySociogram() {
    const response = await firstValueFrom(
      await this.studentService.getAnswerBySociogram(
        Number(this.course_id),
        Number(this.sociogram_id)
      )
    );
    const student = response.data;
    return {
      answers: student?.student_responses ?? [],
      answerClassmates: student?.student_classmate_responses ?? [],
    };
  }
}
