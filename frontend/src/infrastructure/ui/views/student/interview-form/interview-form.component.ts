import { CommonModule, NgStyle } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IInterviewForm } from '@core-interfaces/services/student';
import { IInterviewInput } from '@core-ports/inputs/interview';
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
  DatePickerComponent,
  CardFooterComponent,
} from '@coreui/angular-pro';
import { IconComponent, IconDirective } from '@coreui/icons-angular';
import { studentManager } from '@infra-adapters/services/student.service';
import { Subject, firstValueFrom } from 'rxjs';
import { QuillModule } from 'ngx-quill';
import { DateTimePickerComponent } from '@infra-ui/components/accessors/date-time-picker/date-time-picker.component';

@Component({
  selector: 'interview-form',
  standalone: true,
  imports: [
    NgStyle,
    ReactiveFormsModule,
    FormsModule,
    CommonModule,
    QuillModule,

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
    CardFooterComponent,
    FormCheckComponent,
    FormSelectDirective,
    MultiSelectComponent,
    MultiSelectOptionComponent,
    FormCheckInputDirective,
    FormCheckLabelDirective,
    AlertComponent,

    DateTimePickerComponent,
  ],
  templateUrl: './interview-form.component.html',
  styleUrl: './interview-form.component.scss'
})
export class InterviewFormComponent {
  private student_id: number | null = null;
  studentName = '';

  isLoading$: Subject<boolean> = new Subject();


  constructor(
    private studentService: studentManager,
    private activeRoute: ActivatedRoute,
    private router: Router,
  ) {}

  get form() {
    return this.studentService.interviewForm;
  }

  ngOnInit(): void {
    this.form.reset();
    this.student_id = Number(this.activeRoute.snapshot.params['id']);
    this.studentName = this.activeRoute.snapshot.queryParams['name'];
    if (!this.studentName) {
      this.router.navigate([`/students/${this.student_id}/profile`]);
    }
  }

  getErrorMessage(controlName: keyof IInterviewForm): string | null {
    return this.studentService.getErrorMessage(controlName);
  }

  onSubmit() {
    if (this.form.valid) {
      this.store();
    } else {
      this.form.markAllAsTouched();
    }
  }

  private async store() {
    this.isLoading$.next(true);
    const response = await firstValueFrom(
      await this.studentService.storeInterview(
      this.student_id!,
      this.form.value as IInterviewInput
    ));
    this.isLoading$.next(false);
    if (response) {
      this.router.navigate(['/students', this.student_id, 'profile']);
    }
  }

  editorModules = {
    toolbar: [ // uso [modules] requiere declarar el toolbar en el template 
          ['bold', 'italic', 'underline'],
          [{ header: 1 }, { header: 2 }],
          [{ list: 'ordered' }, { list: 'bullet' }],
          [{ color: [] }, { background: [] }],
          ['link', 'image'],
          ['clean'],
        ],
    counter: {
      container: '#counter',
      unit: 'char'
    }
  };
}
