import { CommonModule, DatePipe, NgStyle } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AdministratorRole, UserRole } from '@core-interfaces/global';
import type { Icomplaint } from '@core-ports/outputs/complaint';
import type { Icourse } from '@core-ports/outputs/course';
import {
  BadgeComponent,
  ButtonDirective,
  CardBodyComponent,
  CardComponent,
  CardGroupComponent,
  CardHeaderComponent,
  ColComponent,
  CollapseDirective,
  ContainerComponent,
  ModalComponent,
  RowComponent,
  SmartTableComponent,
  SmartTableFilterComponent,
  TemplateIdDirective,
  TextColorDirective,
  type IColumn,
  ProgressComponent,
  ModalBodyComponent,
  ModalFooterComponent,
  ModalHeaderComponent,
  ButtonCloseDirective,
  TooltipDirective,
  AlertComponent,
  ListGroupDirective,
  ListGroupItemDirective,
} from '@coreui/angular-pro';
import { IconComponent } from '@coreui/icons-angular';
import { CustomDatePipe } from '@infra-adapters/pipe/CustomDate.pipe';
import { TranslateAdminRolePipe } from '@infra-adapters/pipe/TranslateAdminRole.pipe';
import { TranslateRolePipe } from '@infra-adapters/pipe/TranslateRole.pipe';
import { TranslateRoleInComplaintPipe } from '@infra-adapters/pipe/TranslateRoleInComplaint.pipe';
import { AuthManager } from '@infra-adapters/services/auth.service';
import { ComplaintManager } from '@infra-adapters/services/complaint.service';
import { UserManager } from '@infra-adapters/services/user.service';
import { BehaviorSubject, Subject, firstValueFrom } from 'rxjs';

@Component({
  selector: 'list-complaint',
  standalone: true,
  imports: [
    CommonModule,
    BadgeComponent,
    ButtonDirective,
    ButtonCloseDirective,
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
    ModalHeaderComponent,
    ModalBodyComponent,
    ModalFooterComponent,
    ProgressComponent,
    TooltipDirective,
    AlertComponent,
    ListGroupDirective,
    ListGroupItemDirective,

    CustomDatePipe,
  ],
  providers: [
    CustomDatePipe,
    TranslateRoleInComplaintPipe,
    TranslateAdminRolePipe,
    TranslateRolePipe,
  ],
  templateUrl: './list-complaint.component.html',
  styleUrl: './list-complaint.component.scss',
})
export class ListComplaintComponent implements OnInit {
  complaintsSubject$: BehaviorSubject<Icomplaint[]> = new BehaviorSubject<
    Icomplaint[]
  >([]);
  complaints$ = this.complaintsSubject$.asObservable();

  columns: IColumn[] = [
    { key: 'name', label: 'Denunciante' },
    { key: 'role', label: 'Rol' },
    { key: 'created_at', label: 'Fecha de creación' },
    { key: 'date_event', label: 'Fecha del evento denunciado' },
    {
      key: 'actions',
      label: '',
      _style: { width: '10%' },
      filter: false,
      sorter: false,
    },
  ];

  complaintModalVisible = false;
  // TODO FIX tipado cruzado
  selectedComplaint: any = null;

  isLoading$: Subject<boolean> = new Subject();

  constructor(
    private authService: AuthManager,
    private cdr: ChangeDetectorRef,
    private readonly complaintService: ComplaintManager,
    private readonly userService: UserManager,
    private readonly translateRoleInComplaintPipe: TranslateRoleInComplaintPipe,
    private readonly router: Router,
    private readonly translateRole: TranslateRolePipe,
    private readonly translateAdminRole: TranslateAdminRolePipe
  ) {}

  ableToCreateComplaint =
    this.authService.UserSessionData()?.role === UserRole.Student ||
    this.authService.UserSessionData()?.role === UserRole.Teacher ||
    this.authService.UserSessionData()?.admin_role ===
      AdministratorRole.SchoolSupervisor;

  ngOnInit() {
    this.loadComplaints();
  }

  async loadComplaints() {
    const isSchoolAdmin =
      this.authService.UserSessionData()?.admin_role ===
        AdministratorRole.SchoolAdmin
    const isStudent =
      this.authService.UserSessionData()?.role === UserRole.Student;
    if (isSchoolAdmin) {
      this.isLoading$.next(true);
      const loadData =
        this.authService.UserSessionData()?.role === UserRole.Administrator
          ? this.complaintService.getAllComplaints()
          : this.userService.getComplaintsByUserID(
              this.authService.UserSessionData()!.id
            );

      const response = await firstValueFrom(await loadData);
      if (!response.data) {
        this.isLoading$.next(false);
        return;
      }

      this.complaintsSubject$.next(this.mapComplaints(response.data));
      this.isLoading$.next(false);
    } else if (isStudent) {
      this.isLoading$.next(true);
      const response = await firstValueFrom(
        await this.userService.getComplaintsByUserID(
          this.authService.UserSessionData()!.id
        )
      );
      if (!response.data) {
        this.isLoading$.next(false);
        return;
      }
      this.complaintsSubject$.next(this.mapComplaints(response.data));
      this.isLoading$.next(false);
    }
  }

  async downloadEvidence(evidence_id: number) {
    const response = await firstValueFrom(
      await this.complaintService.downloadEvidence(evidence_id)
    );
    const a = document.createElement('a');
    const objectUrl = URL.createObjectURL(response);
    a.href = objectUrl;
    a.download = 'evidence';
    a.click();
    URL.revokeObjectURL(objectUrl);
  }

  handleComplaintModalChange(event: any) {
    this.complaintModalVisible = event;
  }

  toggleComplaintModal(complaint: Icomplaint | null) {
    this.selectedComplaint = complaint;
    this.complaintModalVisible = !this.complaintModalVisible;
    this.cdr.detectChanges();
  }

  // TODO es necesario??
  private mapComplaints(complaints: Icomplaint[]): any[] {
    return complaints.map((complaint) => {
      const userData = complaint.user?.detail;

      let role = '';
      if (complaint.user && complaint.user.administrator) {
        role = this.translateAdminRole.transform(
          complaint.user.administrator.admin_role
        );
      }
      if (
        complaint.user &&
        (complaint.user.student || complaint.user.teacher)
      ) {
        role = this.translateRole.transform(complaint.user.role);
      }

      return {
        name: userData?.first_name + ' ' + userData?.last_name,
        role,
        date_event: complaint.date_event,
        role_in_complaint: this.translateRoleInComplaintPipe.transform(
          complaint.role_in_complaint
        ),
        created_at: complaint.created_at,
        description: complaint.description,
        with_description: complaint.with_description,
        where_description: complaint.where_description,
        alone: complaint.alone,
        course: this.getCourse(complaint),
        evidences: complaint.evidences,
        isStudent: complaint.user && complaint.user.student,
      };
    });
  }

  private getCourse(selectedComplaint: Icomplaint): string {
    if (!selectedComplaint || !selectedComplaint.user) return '';

    if (selectedComplaint.user.student) {
      const courses = selectedComplaint.user.student.courses;
      return courses?.length ? courses[0].name : 'Sin curso';
    }

    if (selectedComplaint.user.teacher) {
      const courses = selectedComplaint.user.teacher
        .courses as unknown as Icourse[];
      return courses?.length ? courses[0].name : 'Sin curso';
    }

    return 'Sin curso';
  }

  navToStoreComplaint() {
    this.router.navigate(['/complaints/store']);
  }
}
