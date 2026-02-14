import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import type {
  Iinvestigation,
  IinvestigationComment,
  IinvestigationEvidence,
} from '@core-ports/outputs/investigation';
import { InvestigationManager } from '@infra-adapters/services/investigation.service';
import { BehaviorSubject, Subject, firstValueFrom } from 'rxjs';
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
  GutterDirective,
  AlertComponent,
  BorderDirective,
  ToastComponent,
  ToastBodyComponent,
  ToastHeaderComponent,
  ToastCloseDirective,
  ToasterComponent,
  ProgressComponent,
  ListGroupDirective,
  ListGroupItemDirective,
  ModalBodyComponent,
  ModalHeaderComponent,
  ButtonCloseDirective,
  SpinnerComponent,
  ModalFooterComponent,
  CardFooterComponent,
  TooltipDirective,
  TableDirective,
} from '@coreui/angular-pro';
import { CommonModule, DatePipe, NgStyle } from '@angular/common';
import { IconComponent } from '@coreui/icons-angular';
import { InvestigationState } from '@core-interfaces/global';
import { TranslateInvestigationStatePipe } from '@infra-adapters/pipe/TranslateInvestigationStatePipe.pipe';
import {
  TranslateRoleInComplaintFullPipe,
  TranslateRoleInComplaintPipe,
} from '@infra-adapters/pipe/TranslateRoleInComplaint.pipe';
import type { Icomplaint } from '@core-ports/outputs/complaint';
import { TranslateRolePipe } from '@infra-adapters/pipe/TranslateRole.pipe';
import { NgxFileDropEntry, NgxFileDropModule } from 'ngx-file-drop';
import { FormsModule } from '@angular/forms';
import type { Iinvolved } from '@core-ports/outputs/involved';
import { ToastrService } from 'ngx-toastr';
import { CustomDatePipe } from '@infra-adapters/pipe/CustomDate.pipe';
import type { Icourse } from '@core-ports/outputs/course';
import { TranslateAdminRolePipe } from '@infra-adapters/pipe/TranslateAdminRole.pipe';
import type { IuserDetail } from '@core-interfaces/global/user_detail';
import { PdfManagerService } from '@infra-adapters/services/pdf-manager.service';
import { LogoComponent } from '@infra-ui/views/sociogram/report-sociogram/components/logo/logo.component';
import { InstitutionManager } from '@infra-adapters/services/institution.service';

@Component({
  selector: 'investigation-detail',
  standalone: true,
  imports: [
    CommonModule,
    CustomDatePipe,
    BadgeComponent,
    TableDirective,
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
    CardFooterComponent,
    SmartTableFilterComponent,
    ContainerComponent,
    CardGroupComponent,
    NgStyle,
    IconComponent,
    ModalComponent,
    ModalHeaderComponent,
    ModalBodyComponent,
    ModalFooterComponent,
    ButtonCloseDirective,
    GutterDirective,
    FormsModule,
    AlertComponent,
    BorderDirective,
    ToastComponent,
    ToastBodyComponent,
    ToastHeaderComponent,
    ToastCloseDirective,
    ToasterComponent,
    ProgressComponent,
    ListGroupDirective,
    ListGroupItemDirective,
    TranslateInvestigationStatePipe,
    TranslateRoleInComplaintPipe,
    TranslateRoleInComplaintFullPipe,
    TranslateRolePipe,
    NgxFileDropModule,
    SpinnerComponent,
    TooltipDirective,
    LogoComponent,
  ],
  providers: [
    DatePipe,
    TranslateInvestigationStatePipe,
    TranslateRoleInComplaintPipe,
    TranslateRolePipe,
    TranslateAdminRolePipe,
  ],
  templateUrl: './investigation-detail.component.html',
  styleUrl: './investigation-detail.component.scss',
})
export class InvestigationDetailComponent implements OnInit {
  private investigationSubject = new BehaviorSubject<Iinvestigation | null>(
    null
  );
  investigation$ = this.investigationSubject.asObservable();
  investigationId: number | null = null;

  private involvedsSubject = new BehaviorSubject<any[]>([]);
  involveds$ = this.involvedsSubject.asObservable();

  private complaintsSubject = new BehaviorSubject<any[]>([]);
  complaints$ = this.complaintsSubject.asObservable();

  loadingData$: Subject<boolean> = new Subject();
  loadingPDFData$: Subject<boolean> = new Subject();
  loadingSubmitEvidence$: Subject<boolean> = new Subject();
  loadingSubmitComment$: Subject<boolean> = new Subject();
  loadingSubmitResolution$: Subject<boolean> = new Subject();
  loadingFinalize$: Subject<boolean> = new Subject();

  complaintModalVisible = false;
  selectedComplaint: any | null = null;

  involvedEvidenceModalVisible = false;
  selectedInvolved: any | null = null;

  involvedCommentModalVisible = false;
  selectedInvolvedComment: any | null = null;
  newComment = '';

  CommentModalVisible = false;
  selectedComment: IinvestigationComment | null = null;
  newGlobalComment = '';

  EvidencesModalVisible = false;
  selectedEvidences: IinvestigationEvidence | null = null;

  resolution: string = '';
  resolutionUpdated = false;

  mandated: string = '';
  institutionName: string = '';

  involvedColumns: IColumn[] = [
    { key: 'name', label: 'Nombre' },
    { key: 'role', label: 'Tipo' },
    { key: 'involved_type', label: 'Rol' },
    {
      key: 'actions',
      label: '',
      _style: { width: '5%' },
      filter: false,
      sorter: false,
    },
  ];

  involvedDetailsVisible = Object.create({});
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

  confirmModal: boolean = false;

  readonly pdfManager = inject(PdfManagerService);
  readonly loadingPDF = this.pdfManager.loading;

  constructor(
    private readonly investigationService: InvestigationManager,
    private readonly institutionService: InstitutionManager,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly translateRole: TranslateRolePipe,
    private readonly translateAdminRole: TranslateAdminRolePipe,
    private ToastrService: ToastrService
  ) {}

  ngOnInit() {
    this.resolution = '';
    this.investigationId = this.route.snapshot.params['id'];
    if (!this.investigationId) {
      this.router.navigate(['/']);
      return;
    }
    this.loadInvestigation();
  }

  get evidenceAcceptString() {
    return this.evidenceAccept.join(', ');
  }

  async loadInvestigation() {
    this.loadingData$.next(true);
    const response = await firstValueFrom(
      await this.investigationService.loadInvestigationByID(
        this.investigationId!
      )
    );
    if (!response.data) {
      this.router.navigate(['/']);
      return;
    }
    const mandatedFullName = response.data.administrator.user.user_details
      ? response.data.administrator.user.user_details.first_name +
        ' ' +
        response.data.administrator.user.user_details.last_name
      : 'Sin nombre';
    this.investigationSubject.next(response.data);
    this.involvedsSubject.next(this.mapInvolveds(response.data.involveds));
    this.complaintsSubject.next(this.mapComplaints(response.data.complaints));
    this.resolution = response.data.resolution || '';
    this.mandated = mandatedFullName;
    await this.getInstitutionName(response.data.administrator.institution_id);
    this.loadingData$.next(false);
  }

  async getInstitutionName(institutionId: number): Promise<void> {
  const response = await firstValueFrom(
    await this.institutionService.loadInstitutionByID(institutionId)
  );
  console.log('institution response', response.data?.name);
  this.institutionName = response.data?.name || 'Sin institución';
}



  async submitInvolvedEvidence(id: number, file: File) {
    this.toggleInvolvedEvidenceModal(null);
    this.loadingSubmitEvidence$.next(true);
    const response = await firstValueFrom(
      await this.investigationService.storeInvestigationInvolvedEvidence(
        id,
        file
      )
    );
    this.loadingSubmitEvidence$.next(false);
    if (response.data) {
      this.loadInvestigation();
    }
  }

  async submitEvidence(id: number, file: File) {
    this.toggleEvidenceModal();
    this.loadingSubmitEvidence$.next(true);
    const response = await firstValueFrom(
      await this.investigationService.storeInvestigationEvidence(id, file)
    );
    this.loadingSubmitEvidence$.next(false);
    if (response.data) {
      this.loadInvestigation();
    }
  }

  public async submitInvolvedComment() {
    const involvedId = this.selectedInvolvedComment!.id;
    console.log('submitting comment', this.newComment);
    this.toggleInvolvedCommentModal(null);
    if (!this.newComment || this.newComment.length === 0) {
      console.log('no involeved comment');  
      return;
    }
    this.loadingSubmitComment$.next(true);
    const response = await firstValueFrom(
      await this.investigationService.storeInvestigationInvolvedComment(
        involvedId,
        this.newComment
      )
    );
    console.log('response', response);
    this.loadingSubmitComment$.next(false);
    if (response.data) {
      console.log('loading investigation');
      this.loadInvestigation();
      this.newComment = '';
    }
  }

  public async submitComment() {
    this.toggleCommentModal();
    console.log('submitting comment', this.newGlobalComment);
    if (!this.newGlobalComment || this.newGlobalComment.length === 0) {
      console.log('no comment');
      return;
    }
    this.loadingSubmitComment$.next(true);
    const response = await firstValueFrom(
      await this.investigationService.storeInvestigationComment(
        this.investigationId!,
        this.newGlobalComment
      )
    );
    console.log('response', response);
    this.loadingSubmitComment$.next(false);
    if (response.data) {
      console.log('loading investigation2');
      this.loadInvestigation();
      this.newComment = '';
    }
  }

  onConfirm() {
    this.resetModal();
    this.finalizeInvestigation();
  }

  async updateInvestigationResolution() {
    if (!this.resolution || this.resolution.length === 0) {
      return;
    }
    this.loadingSubmitResolution$.next(true);
    const response = await firstValueFrom(
      await this.investigationService.updateInvestigationResolution(
        this.investigationId!,
        this.resolution
      )
    );
    this.loadingSubmitResolution$.next(false);
    if (response.data) {
      this.loadInvestigation();

      this.resolutionUpdated = true;

      setTimeout(() => {
        this.resolutionUpdated = false;
      }, 3000);
    }
  }

  public dropped(files: NgxFileDropEntry[], investigationInvolvedId: number) {
    const droppedFile = files[0];
    if (
      droppedFile.fileEntry.isFile &&
      this.evidenceAccept.some((ext) =>
        droppedFile.fileEntry.name.endsWith(ext)
      )
    ) {
      const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
      fileEntry.file((file: File) => {
        this.submitInvolvedEvidence(investigationInvolvedId, file);
      });
    }
  }
  public droppedEvidence(files: NgxFileDropEntry[]) {
    const droppedFile = files[0];
    if (
      droppedFile.fileEntry.isFile &&
      this.evidenceAccept.some((ext) =>
        droppedFile.fileEntry.name.endsWith(ext)
      )
    ) {
      const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
      fileEntry.file((file: File) => {
        this.submitEvidence(this.investigationId!, file);
      });
    }
  }

  async downloadEvidence(involvedEvidenceId: number) {
    const response = await firstValueFrom(
      await this.investigationService.downloadEvidence(involvedEvidenceId)
    );
    const a = document.createElement('a');
    const objectUrl = URL.createObjectURL(response);
    a.href = objectUrl;
    a.download = 'evidence';
    a.click();
    URL.revokeObjectURL(objectUrl);
  }

  async downloadGlobalEvidence(evidence_id: number) {
    const response = await firstValueFrom(
      await this.investigationService.downloadGlobalEvidence(evidence_id)
    );
    const a = document.createElement('a');
    const objectUrl = URL.createObjectURL(response);
    a.href = objectUrl;
    a.download = 'evidence';
    a.click();
    URL.revokeObjectURL(objectUrl);
  }

  async finalizeInvestigation() {
    this.loadingFinalize$.next(true);
    this.loadingSubmitEvidence$.next(true);
    this.loadingSubmitComment$.next(true);
    this.loadingSubmitResolution$.next(true);

    const response = await firstValueFrom(
      await this.investigationService.finalizeInvestigation(
        this.investigationId!
      )
    );
    this.loadingFinalize$.next(false);
    this.loadingSubmitEvidence$.next(false);
    this.loadingSubmitComment$.next(false);
    this.loadingSubmitResolution$.next(false);
    if (response.data) {
      this.loadInvestigation();
    }
  }

  getStatePercentage(state: InvestigationState) {
    let resolved = 0;
    let involveds = 0;
    switch (state) {
      case InvestigationState.Init:
        return 25;
      case InvestigationState.Advanced:
        involveds = (this.investigationSubject.value?.involveds || []).length;
        if (involveds === 0) {
          return 25;
        }
        resolved = (this.investigationSubject.value?.involveds || []).filter(
          (involved) => involved.evidences.length > 0
        ).length;
        return 25 + (resolved / involveds) * 75;
      case InvestigationState.Finalized:
        return 100;
      default:
        return 0;
    }
  }

  getStateColor(state: InvestigationState) {
    switch (state) {
      case InvestigationState.Init:
        return 'danger';
      case InvestigationState.Advanced:
        return 'warning';
      case InvestigationState.Finalized:
        return 'primary';
      default:
        return 'secondary';
    }
  }

  handleComplaintModalChange(event: any) {
    this.complaintModalVisible = event;
  }

  toggleComplaintModal(complaint: Icomplaint | null) {
    this.selectedComplaint = complaint;
    this.complaintModalVisible = !this.complaintModalVisible;
  }

  handleInvolvedEvidenceModalChange(event: any) {
    this.involvedEvidenceModalVisible = event;
  }

  handleEvidenceModalChange(event: any) {
    this.EvidencesModalVisible = event;
  }

  toggleInvolvedEvidenceModal(involved: Iinvolved | null) {
    this.selectedInvolved = involved;
    this.involvedEvidenceModalVisible = !this.involvedEvidenceModalVisible;
  }

  toggleEvidenceModal() {
    this.EvidencesModalVisible = !this.EvidencesModalVisible;
  }

  handleInvolvedCommentModalChange(event: any) {
    this.involvedCommentModalVisible = event;
  }

  handleCommentModalChange(event: any) {
    this.CommentModalVisible = event;
  }

  toggleInvolvedCommentModal(involved: Iinvolved | null) {
    this.selectedInvolvedComment = involved;
    this.involvedCommentModalVisible = !this.involvedCommentModalVisible;
  }

  toggleCommentModal() {
    this.CommentModalVisible = !this.CommentModalVisible;
  }

  toggleDetails(id: number) {
    this.involvedDetailsVisible[id] = !this.involvedDetailsVisible[id];
  }

  private mapComplaints(complaints: any[]): any {
    return complaints.map((complaint) => {
      const user = complaint.user as any;

      const userData = user.user_details as IuserDetail; // TODO serializar desde backend core investigación

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
        role_in_complaint: complaint.role_in_complaint,
        description: complaint.description,
        with_description: complaint.with_description,
        where_description: complaint.where_description,
        alone: complaint.alone,
        course: this.getCourse(complaint),
        evidences: complaint.complaint_evidences,
      };
    });
  }

  private mapInvolveds(involveds: any[]): any[] {
    return involveds.map((involved) => ({
      ...involved,
      id: involved.id,
      name:
        involved.involved.user.user_details?.first_name +
        ' ' +
        involved.involved.user.user_details?.last_name,
    }));
  }

  private getCourse(selectedComplaint: Icomplaint) {
  if (selectedComplaint) {
    console.log('selectedComplaint', selectedComplaint);
    if (selectedComplaint.user?.student) {
      return selectedComplaint.user.student.courses?.[0]?.name ?? 'Sin curso';
    }
    if (selectedComplaint.user?.teacher) {
      console.log('teacher', selectedComplaint.user.teacher);
      const courses = selectedComplaint.user.teacher
        .courses as unknown as Array<Icourse>;

      if (Array.isArray(courses) && courses.length > 0) {
        return courses[0].name;
      } else {
        return 'Sin curso';
      }
    }
    return '';
  }
  return '';
}

  resetModal() {
    this.confirmModal = false;
  }

  async generatePDF() {
    try {
      this.loadingPDFData$.next(true);
      const fileName = `investigacion-${this.investigationSubject.value?.title}`;
      if (this.pdfManager.isValidateColorModeForPDF()) {
        await this.pdfManager.generatePDFInvestigation('.avoid-break', fileName);
      }
      this.loadingPDFData$.next(false);
    } catch (error) {
      this.loadingPDFData$.next(false);
    }
  }
}
