import { CommonModule, NgStyle, registerLocaleData } from '@angular/common';
import { Component, LOCALE_ID, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
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
  DatePickerComponent,
  FormCheckComponent,
  FormCheckInputDirective,
  FormCheckLabelDirective,
  ListGroupDirective,
  ListGroupItemDirective,
  ToasterComponent,
  ToastComponent,
  ToastCloseDirective,
  ToastBodyComponent,
  ToastHeaderComponent,
  ModalComponent,
  ModalFooterComponent,
  ModalBodyComponent,
  ModalHeaderComponent,
  ButtonCloseDirective,
} from '@coreui/angular-pro';
import { IconComponent, IconDirective } from '@coreui/icons-angular';
import { ComplaintManager } from '@infra-adapters/services/complaint.service';
import { IcomplaintInput } from '@core-ports/inputs/complaint';
import { IcomplaintFormInput } from '@core-interfaces/services/complaint';
import { RoleInComplaint, IDroppedFile } from '@core-interfaces/global';
import { TranslateRoleInComplaintPipe } from '@infra-adapters/pipe/TranslateRoleInComplaint.pipe';
import { NgxFileDropEntry, NgxFileDropModule } from 'ngx-file-drop';
import { Subject } from 'rxjs';
import localeEs from '@angular/common/locales/es';

registerLocaleData(localeEs);

@Component({
  selector: 'form-complaint',
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
    DatePickerComponent,

    FormCheckComponent,
    FormCheckInputDirective,
    FormCheckLabelDirective,

    NgxFileDropModule,

    IconComponent,

    TranslateRoleInComplaintPipe,

    ListGroupDirective,
    ListGroupItemDirective,

    ToasterComponent,
    ToastComponent,
    ToastHeaderComponent,
    ToastCloseDirective,
    ToastBodyComponent,

    ModalComponent,
    ModalBodyComponent,
    ModalHeaderComponent,
    ModalFooterComponent,
    ButtonCloseDirective,
  ],
  providers: [TranslateRoleInComplaintPipe],
  templateUrl: './form-complaint.component.html',
  styleUrl: './form-complaint.component.scss',
})
export class FormComplaintComponent implements OnInit {
  isLoading$: Subject<boolean> = new Subject();
  roleInComplaintOptions = Object.values(RoleInComplaint).map((role) => role);

  hasEvidence = false;
  acceptTerms = false;

  confirmModalVisible = false;

  public evidences: IDroppedFile[] = [];
  public maxEvidence = 3;
  public evidenceAccept = [
    '.jpg',
    '.jpeg',
    '.png',
    '.pdf',
    '.doc',
    '.docx',
    '.xls',
    '.xlsx',
  ];
  public wrongFile = false;

  constructor(
    private complaintService: ComplaintManager,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.form.reset();
    this.form.get('alone')?.setValue(true);
    this.form.get('alone')!.valueChanges.subscribe((alone) => {
      this.handleAloneChanges();
    });
  }

  get form() {
    return this.complaintService.complaintForm;
  }

  get evidenceAcceptString() {
    return this.evidenceAccept.join(', ');
  }

  get formAlone() {
    const isAlone = this.form.get('alone')?.value;
    if (typeof isAlone === 'string') {
      return isAlone === 'true';
    }
    return isAlone;
  }

  public maxDate = new Date();
  
  getErrorMessage(controlName: keyof IcomplaintFormInput): string | null {
    return this.complaintService.getErrorMessage(controlName);
  }

  public dropped(files: NgxFileDropEntry[]) {
    if (this.evidences.length >= this.maxEvidence) {
      this.wrongFile = true;
      setTimeout(() => {
        this.wrongFile = false;
      }, 3000);
      return;
    }
    const droppedFile = files[0];
    if (
      droppedFile.fileEntry.isFile &&
      this.evidenceAccept.some((ext) =>
        droppedFile.fileEntry.name.endsWith(ext)
      )
    ) {
      const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
      fileEntry.file((file: File) => {
        this.evidences.push({ file, filename: file.name });
      });
    }
  }

  public downloadFile(idx: number) {
    const file = this.evidences[idx];
    const url = URL.createObjectURL(file.file);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.filename;
    a.click();
  }

  public removeEvidence(idx: number) {
    const file = this.evidences[idx];
    this.evidences = this.evidences.filter((f) => f !== file);
  }

  async onSubmit() {
    if (this.form.valid) {
      this.confirmModalVisible = true;
    } else {
      this.form.markAllAsTouched();
    }
  }

  resetConfirmModal() {
    this.confirmModalVisible = false;
    this.acceptTerms = false;
  }

  async onConfirmSubmit() {
    if (this.form.valid && this.acceptTerms) {
      this.store();
    } else {
      this.form.markAllAsTouched();
    }
    this.resetConfirmModal();
  }

  private async store() {
    this.isLoading$.next(true);
    (
      await this.complaintService.storeComplaint(
        this.form.value as IcomplaintInput,
        this.evidences
      )
    ).subscribe({
      next: () => {
        this.isLoading$.next(false);
        this.router.navigate(['/complaints']);
      },
      error: (error) => {
        this.isLoading$.next(false);
      },
      complete: () => {
        this.isLoading$.next(false);
      },
    });
  }

  handleAloneChanges() {
    if (!this.formAlone) {
      this.form.get('with_description')!.setValidators([Validators.required]);
    } else {
      this.form.get('with_description')!.clearValidators();
    }
    this.form.get('with_description')!.updateValueAndValidity();
  }

  handleTermsChange() {
    this.acceptTerms = !this.acceptTerms;
  }

  handleEvidenceChange() {
    this.hasEvidence = !this.hasEvidence;
  }
}
