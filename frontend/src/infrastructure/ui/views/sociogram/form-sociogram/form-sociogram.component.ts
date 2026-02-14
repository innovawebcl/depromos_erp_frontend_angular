import { CommonModule, NgStyle } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormArray,
  Validators,
  FormGroup,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import type { Ioption } from '@core-interfaces/global';
import type {
  IquestionForm,
  IsociogramFormInput,
} from '@core-interfaces/services/sociogram';
import type {
  IanswerTypes,
  Iquestion,
  Isociogram,
} from '@core-ports/outputs/sociograms';
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
  FormControlDirective,
  FormDirective,
  FormFeedbackComponent,
  FormLabelDirective,
  FormSelectDirective,
  InputGroupComponent,
  InputGroupTextDirective,
  RowComponent,
  SpinnerComponent,
  TextColorDirective,
} from '@coreui/angular-pro';
import { IconComponent, IconDirective } from '@coreui/icons-angular';
import { sociogramManager } from '@infra-adapters/services/sociogram.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'form-sociogram',
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
  ],
  standalone: true,
  templateUrl: './form-sociogram.component.html',
  styleUrls: ['./form-sociogram.component.scss'],
})
export class FormSociogramComponent implements OnInit, OnDestroy {
  sociogram_id: string | null = null;
  duplicate_id: string | null = null;
  rules: Ioption[] = [];
  sociogramsOptions: Ioption[] = [];
  sociogramsTypesAnswer: IanswerTypes | null = null; // TODO mapping de enum en cliente

  constructor(
    private fb: FormBuilder,
    private sociogramService: sociogramManager,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadResources();
    const sociogram_id = this.route.snapshot.queryParamMap.get('id');
    const sociogram_to_duplicate =
      this.route.snapshot.queryParamMap.get('duplicate');

    if (sociogram_id) {
      this.sociogram_id = sociogram_id;
      this.loadSociogramByID(Number(sociogram_id), false);
    } else if (sociogram_to_duplicate) {
      this.duplicate_id = sociogram_to_duplicate;
      this.loadSociogramByID(Number(sociogram_to_duplicate), true);
    }
  }

  ngOnDestroy(): void {
    this.questions.clear();
    this.addQuestion();
    this.form.reset();
  }

  get form(): FormGroup {
    return this.sociogramService.sociogramForm;
  }

  get questions(): FormArray {
    return this.form.get('questions') as FormArray;
  }

  addQuestion() {
    this.questions.push(
      this.fb.group({
        title: ['', Validators.required],
        is_multiple_choice: [false, Validators.required],
        rules: ['', Validators.required],
        enum_as_options: ['', Validators.required],
      })
    );
  }

  removeQuestion(index: number) {
    this.questions.removeAt(index);
  }

  async onSubmit() {
    const values = this.form.value;
    if (
      values.questions.length > 0 &&
      values.title !== '' &&
      values.version > 0
    ) {
      if (this.sociogram_id) {
        this.updateSociogram();
      } else {
        this.createSociogram();
      }
    }
  }

  getErrorMessage(
    controlName: keyof IsociogramFormInput | string
  ): string | null {
    return this.sociogramService.getErrorMessage(controlName);
  }

  getQuestionErrorMessage(
    index: number,
    controlName: keyof IquestionForm | string
  ): string | null {
    return this.sociogramService.getQuestionErrorMessage(index, controlName);
  }
  getAnswerLabels(type: keyof IanswerTypes | string): string[] {
    if (!this.sociogramsTypesAnswer) {
      return [];
    }
    if (type === 'StudentsClassmate') {
      return ['Listado de compañeros de por curso'];
    }
    return (
      this.sociogramsTypesAnswer[type as keyof IanswerTypes]?.map(
        (answer) => answer.label
      ) || []
    );
  }

  private async loadResources() {
    const responseRules = await firstValueFrom(
      this.sociogramService.getRules()
    );
    const responseOptions = await firstValueFrom(
      this.sociogramService.getSociogramsOptions()
    );
    const responseAnswer = await firstValueFrom(
      this.sociogramService.getTypeAnswers()
    );
    this.rules = responseRules.data ?? [];
    this.sociogramsOptions = responseOptions.data ?? [];
    this.sociogramsTypesAnswer = responseAnswer.data;
  }

  private async updateSociogram() {
  try {
    const response = await firstValueFrom(
      await this.sociogramService.updateSociogram(
        this.form.value,
        Number(this.sociogram_id)
      )
    );
    if (response?.status === 200 || response?.data) {
      this.router.navigate(['/sociograms']);
    }
  } catch (error) {
    console.error("Error al actualizar sociograma:", error);
  }
}

  private async createSociogram() {
  try {
    const response = await firstValueFrom(
      await this.sociogramService.storeSociogram(this.form.value)
    );
    if (response?.status === 200 || response?.data) {
      this.router.navigate(['/sociograms']);
    }
  } catch (error) {
    console.error("Error al crear sociograma:", error);
  }
}

  private async loadSociogramByID(id: number, is_duplicated: boolean = false) {
    const sociogram = await firstValueFrom(
      await this.sociogramService.loadSociogramByID(id)
    );

    if (sociogram.data) this.loadForm(sociogram.data, is_duplicated);
  }

  private loadForm(sociogram: Isociogram, is_duplicated: boolean = false) {
    const questions = sociogram.questions ?? [];
    this.questions.clear();

    questions.forEach((question) => {
      this.questions.push(
        this.fb.group({
          title: [question.title, Validators.required],
          is_multiple_choice: [
            question.is_multiple_choice,
            Validators.required,
          ],
          rules: [question.rules, Validators.required],
          enum_as_options: [question.enum_as_options, Validators.required],
        })
      );
    });

    this.form.patchValue({
      title: is_duplicated ? `Copia de ${sociogram.title}` : sociogram.title,
      version: sociogram.version,
    });
  }
}
