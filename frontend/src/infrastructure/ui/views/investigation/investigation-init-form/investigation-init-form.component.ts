import { Component, OnInit } from '@angular/core';
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
  ListGroupDirective,
  ListGroupItemDirective,
  ModalComponent,
  ModalBodyComponent,
  ModalContentComponent,
  ModalHeaderComponent,
  ModalFooterComponent,
  ModalToggleDirective,
  ButtonCloseDirective,
  SmartTableComponent,
  SmartTableFilterComponent,
  TemplateIdDirective,
  IColumn,
  TooltipDirective,
} from '@coreui/angular-pro';
import { CommonModule, NgStyle } from '@angular/common';
import { IconComponent, IconDirective } from '@coreui/icons-angular';
import {
  FormArray,
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ComplaintManager } from '@infra-adapters/services/complaint.service';
import { BehaviorSubject, Subject, combineLatest, firstValueFrom } from 'rxjs';
import { Icomplaint } from '@core-ports/outputs/complaint';
import {
  TranslateRoleInComplaintFullPipe,
  TranslateRoleInComplaintPipe,
} from '@infra-adapters/pipe/TranslateRoleInComplaint.pipe';
import { TranslateRolePipe } from '@infra-adapters/pipe/TranslateRole.pipe';
import { teacherManager } from '@infra-adapters/services/teacher.service';
import { studentManager } from '@infra-adapters/services/student.service';
import type { IteacherN } from '@core-ports/outputs/teacher';
import type { Istudent } from '@core-ports/outputs/student';
import { RoleInComplaintFull, UserRole } from '@core-interfaces/global';
import { InvestigationManager } from '@infra-adapters/services/investigation.service';
import type { IInvestigationFormInput } from '@core-interfaces/services/investigation';
import type { IinvestigationInput } from '@core-ports/inputs/investigation';
import { Router } from '@angular/router';
import { TranslateAdminRolePipe } from '@infra-adapters/pipe/TranslateAdminRole.pipe';

@Component({
  selector: 'investigation-init-form',
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
    FormCheckComponent,
    FormCheckInputDirective,
    FormCheckLabelDirective,
    FormSelectDirective,
    TranslateRoleInComplaintPipe,
    TranslateRoleInComplaintFullPipe,
    TranslateRolePipe,
    IconComponent,

    ListGroupDirective,
    ListGroupItemDirective,

    ModalComponent,
    ModalBodyComponent,
    ModalContentComponent,
    ModalHeaderComponent,
    ModalFooterComponent,
    ModalToggleDirective,
    ButtonCloseDirective,

    SmartTableComponent,
    SmartTableFilterComponent,
    TemplateIdDirective,
    TooltipDirective,
  ],
  templateUrl: './investigation-init-form.component.html',
  styleUrl: './investigation-init-form.component.scss',
  providers: [TranslateRolePipe, TranslateAdminRolePipe],
})
export class InvestigationInitFormComponent implements OnInit {
  private complaintsSubject = new BehaviorSubject<Icomplaint[]>([]);
  complaints$ = this.complaintsSubject.asObservable();
  private teachersSubject = new BehaviorSubject<IteacherN[]>([]);
  teachers$ = this.teachersSubject.asObservable();
  private studentsSubject = new BehaviorSubject<Istudent[]>([]);
  students$ = this.studentsSubject.asObservable();

  public isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  private isLoadingStudents$: BehaviorSubject<boolean> = new BehaviorSubject(
    false
  );
  private isLoadingTeachers$: BehaviorSubject<boolean> = new BehaviorSubject(
    false
  );
  private isLoadingComplaints$: BehaviorSubject<boolean> = new BehaviorSubject(
    false
  );

  complaintModalVisible = false;
  selectedComplaint: Icomplaint | null = null;

  investigationInvolvedModalVisible = false;
  selectedInvestigationInvolved: any = null;

  roleInComplaintOptions = Object.values(RoleInComplaintFull).map(
    (role) => role
  );
  selectedRoleInComplaint: RoleInComplaintFull | null = null;

  studentColumns: IColumn[] = [
    {
      key: 'name',
      label: 'Estudiante',
    },
    {
      key: 'course',
      label: 'Curso',
    },
    {
      key: 'actions',
      label: '',
      _style: { width: '5%' },
      filter: false,
      sorter: false,
    },
  ];

  teacherColumns: IColumn[] = [
    {
      key: 'name',
      label: 'Profesor',
    },
    {
      key: 'actions',
      label: '',
      _style: { width: '5%' },
      filter: false,
      sorter: false,
    },
  ];

  constructor(
    private complaintService: ComplaintManager,
    private teacherService: teacherManager,
    private studentService: studentManager,
    private investigationService: InvestigationManager,
    private fb: FormBuilder,
    private router: Router,
    private readonly translateRole: TranslateRolePipe,
    private readonly translateAdminRole: TranslateAdminRolePipe
  ) {}

  ngOnInit(): void {
    this.form.reset();
    combineLatest([
      this.isLoadingComplaints$,
      this.isLoadingTeachers$,
      this.isLoadingStudents$,
    ]).subscribe(
      ([isLoadingComplaints, isLoadingTeachers, isLoadingStudents]) => {
        this.isLoading$.next(
          isLoadingComplaints || isLoadingTeachers || isLoadingStudents
        );
      }
    );
    this.loadComplaints();
    this.loadTeachers();
    this.loadStudents();
  }

  get form() {
    return this.investigationService.investigationForm;
  }

  get complaints(): FormArray {
    return this.form.get('complaints') as FormArray;
  }

  get involveds(): FormArray {
    return this.form.get('involveds') as FormArray;
  }

  private async loadComplaints() {
    this.isLoadingComplaints$.next(true);
    const response = await firstValueFrom(
      await this.complaintService.getAllComplaints()
    );
    this.complaintsSubject.next(response.data ?? []);
    this.isLoadingComplaints$.next(false);
  }

  private async loadTeachers() {
    this.isLoadingTeachers$.next(true);
    const response = await firstValueFrom(
      await this.teacherService.loadTeachers()
    );
    this.teachersSubject.next(this.mapTeachers(response.data ?? []));
    this.isLoadingTeachers$.next(false);
  }

  private async loadStudents() {
    this.isLoadingStudents$.next(true);
    const response = await firstValueFrom(
      await this.studentService.loadStudents()
    );
    this.studentsSubject.next(this.mapStudents(response.data ?? []));
    this.isLoadingStudents$.next(false);
  }

  onSubmit() {
    if (this.form.valid) {
      this.createInvestigation();
    } else {
      this.form.markAllAsTouched();
    }
  }

  private async createInvestigation() {
    this.isLoading$.next(true);
    const response = await firstValueFrom(
      await this.investigationService.storeInvestigation(
        this.form.value as unknown as IinvestigationInput
      )
    );
    this.isLoading$.next(false);
    if (response) {
      const investigationId = response.data?.id;
      this.router.navigate(['/investigation', investigationId]);
    }
  }

  addComplaint(complaintId: number) {
    this.complaints.push(
      this.fb.group({
        complaint_id: [complaintId, Validators.required],
      })
    );
  }
  // TODO tipado correcto de investigación
  addInvestigationInvolved(involved: any, role: RoleInComplaintFull | null) {
    if (!involved || !role) {
      return;
    }
    const involvedId = involved.id;
    const involvedType = involved.role;
    this.involveds.push(
      this.fb.group({
        involved_id: [involvedId, Validators.required],
        involved_type: [involvedType, Validators.required],
        role: [role, Validators.required],
      })
    );
    this.resetInvestigationInvolved();
    this.toggleInvestigationInvolvedModal(null);
  }

  removeComplaint(id: number) {
    const index = this.complaints.value.findIndex(
      (complaint: any) => complaint.complaint_id === id
    );
    this.complaints.removeAt(index);
  }

  removeInvestigationInvolved(id: number, involved_type: UserRole) {
    const index = this.involveds.value.findIndex(
      (involved: any) =>
        involved.involved_id === id && involved.involved_type === involved_type
    );
    this.involveds.removeAt(index);
  }

  getComplaintUserName(complaint: Icomplaint | null) {
    if (!complaint) {
      return 'Desconocido';
    }
    if (complaint.user) {
      return (
        complaint.user.detail?.first_name +
        ' ' +
        complaint.user.detail?.last_name
      );
    }
    return 'Desconocido';
  }

  getComplaintUserRole(complaint: Icomplaint | null) {
    if (!complaint) {
      return 'Desconocido';
    }
    let role = 'Desconocido';
    if (complaint.user && complaint.user.administrator) {
      role = this.translateAdminRole.transform(
        complaint.user.administrator.admin_role
      );
    }
    if (complaint.user && (complaint.user.student || complaint.user.teacher)) {
      role = this.translateRole.transform(complaint.user.role);
    }
    return role;
  }

  getInvolvedResponse(
    id: number,
    involved_type: UserRole
  ): RoleInComplaintFull | null {
    const involved = this.involveds.value.find(
      (involved: any) =>
        involved.involved_id === id && involved.involved_type === involved_type
    );
    return involved?.role;
  }

  toggleComplaintModal(complaint: Icomplaint | null) {
    this.selectedComplaint = complaint;
    this.complaintModalVisible = !this.complaintModalVisible;
  }

  toggleInvestigationInvolvedModal(
    investigationInvolved: IteacherN | Istudent | null
  ) {
    this.selectedInvestigationInvolved = investigationInvolved;
    this.investigationInvolvedModalVisible =
      !this.investigationInvolvedModalVisible;
  }

  handleComplaintModalChange(event: any) {
    this.complaintModalVisible = event;
  }

  handleInvestigationInvolvedModalChange(event: any) {
    this.investigationInvolvedModalVisible = event;
  }

  mapStudents(students: Istudent[]): any[] {
    return students.map((student) => ({
      id: student.id,
      name: `${student.user.detail?.first_name} ${student.user.detail?.last_name}`,
      course: student?.courses?.[0].name ?? 'Desconocido',
      role: student.user?.role,
    }));
  }

  mapTeachers(teachers: IteacherN[]): any[] {
    return teachers.map((teacher) => ({
      id: teacher.id,
      name: `${teacher.user.detail?.first_name} ${teacher.user.detail?.last_name}`,
      role: teacher.user?.role,
    }));
  }

  public resetInvestigationInvolved() {
    this.selectedInvestigationInvolved = null;
    this.selectedRoleInComplaint = null;
  }

  isComplaintAdded(id: number): boolean {
    return this.complaints.value.some(
      (complaint: any) => complaint.complaint_id === id
    );
  }

  isInvolved(id: number, involved_type: UserRole): boolean {
    return this.involveds.value.some(
      (involved: any) =>
        involved.involved_id === id && involved.involved_type === involved_type
    );
  }

  getErrorMessage(controlName: keyof IInvestigationFormInput): string | null {
    return this.investigationService.getErrorMessage(controlName);
  }
}
