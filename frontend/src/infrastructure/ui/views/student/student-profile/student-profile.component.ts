import type { Istudent } from '@core-ports/outputs/student';
import { studentManager } from '@infra-adapters/services/student.service';
import { AuthManager } from '@infra-adapters/services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  inject,
} from '@angular/core';
import { BehaviorSubject, Subject, combineLatest, firstValueFrom } from 'rxjs';
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
  TableDirective,
  TooltipDirective,
} from '@coreui/angular-pro';
import { CommonModule, DatePipe, NgStyle } from '@angular/common';
import { IconComponent } from '@coreui/icons-angular';
import type { Iannotation } from '@core-ports/outputs/annotation';
import {
  AdministratorRole,
  AnnotationLevel,
  UserRole,
} from '@core-interfaces/global';
import { TranslateAnnotationLevelPipe } from '@infra-adapters/pipe/TranslateAnnotationLevel.pipe';
import { TranslateKinshipPipe } from '@infra-adapters/pipe/TranslateKinship.pipe';
import type { Iinterview } from '@core-ports/outputs/interview';
import { CustomDatePipe } from '@infra-adapters/pipe/CustomDate.pipe';
import type { IInstitutionAnnotationLevel } from '@core-ports/outputs/annotationLevel';
import { mapAnnotationLevel } from '@utils/AnnotationLevel';
import { InstitutionManager } from '@infra-adapters/services/institution.service';
import { TranslateRolePipe } from '@infra-adapters/pipe/TranslateRole.pipe';
import { TranslateAdminRolePipe } from '@infra-adapters/pipe/TranslateAdminRole.pipe';
import { PdfManagerService } from '@infra-adapters/services/pdf-manager.service';
import type { ILoginLog } from '@core-interfaces/ports/outputs/user';

@Component({
  selector: 'student-profile',
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
    GutterDirective,
    TranslateAnnotationLevelPipe,
    TranslateKinshipPipe,
    AlertComponent,
    BorderDirective,
    ToastComponent,
    ToastBodyComponent,
    ToastHeaderComponent,
    ToastCloseDirective,
    ToasterComponent,

    TableDirective,
    CustomDatePipe,

    TooltipDirective,
  ],
  providers: [
    DatePipe,
    TranslateAnnotationLevelPipe,
    TranslateKinshipPipe,
    TranslateRolePipe,
    TranslateAdminRolePipe,
  ],
  templateUrl: './student-profile.component.html',
  styleUrl: './student-profile.component.scss',
})
export class StudentProfileComponent implements OnInit, AfterViewInit {
  private studentSubject = new BehaviorSubject<Istudent | null>(null);
  private annotationsSubject = new BehaviorSubject<Iannotation[] | null>(null);
  private interviewsSubject = new BehaviorSubject<Iinterview[] | null>(null);
  private annotationLevelSubject = new BehaviorSubject<
    IInstitutionAnnotationLevel[]
    >([]);
  private loginLogsSubject = new BehaviorSubject<ILoginLog[]>([]);

  student$ = this.studentSubject.asObservable();
  annotations$ = this.annotationsSubject.asObservable();
  interviews$ = this.interviewsSubject.asObservable();
  annotationLevels$ = this.annotationLevelSubject.asObservable();
  loginLogs$ = this.loginLogsSubject.asObservable();


  isLoading: Subject<boolean> = new Subject();

  studentId: number | null = null;

  allowedToStoreAnnotation = false;
  severeStudent = false;

  annotation_id: number = 0;
  deleteModalVisible: boolean = false;

  isAbleToEdit = false;

  readonly pdfManager = inject(PdfManagerService);
  readonly loadingPDF = this.pdfManager.loading;

  collapses = {
    personalInfo: true,
    guardians: false,
    annotations: false,
    interviews: false,
    loginLogs: false,
  };
  @ViewChild('annotationsSection', { static: false })
  annotationsSection!: ElementRef<HTMLDivElement>;

  toggleCollapse(section: string): void {
    this.collapses[section as keyof typeof this.collapses] =
      !this.collapses[section as keyof typeof this.collapses];
  }

  annotationColumns: IColumn[] = [
    { key: 'created_at', label: 'Fecha' },
    { key: 'observation', label: 'Observación' },
    { key: 'annotator', label: 'Anotado por' },
    { key: 'role', label: 'Rol' },
    { key: 'type', label: 'Tipo de anotación' },
    { key: 'subcategory', label: 'Subcategoría' },
  ];

  interviewColumns: IColumn[] = [
    { key: 'interview_date', label: 'Fecha' },
    { key: 'reason', label: 'Motivo' },
    { key: 'registered_by', label: 'Registrado Por' },
    { key: 'role', label: 'Rol' },
    {
      key: 'actions',
      label: 'Acciones',
      _style: { width: '10%' },
      filter: false,
      sorter: false,
    },
  ];

  loginLogsColumns: IColumn[] = [
  { key: 'created_at', label: 'Fecha y hora' },
  { key: 'action_log', label: 'Acción' },
  { key: 'description', label: 'Descripción' },
];

  constructor(
    private institutionService: InstitutionManager,
    private studentService: studentManager,
    private router: Router,
    private authService: AuthManager,
    private activeRoute: ActivatedRoute,
    private kinshipPipe: TranslateKinshipPipe,
    private readonly translateAdminRole: TranslateAdminRolePipe,
    private readonly translateRole: TranslateRolePipe
  ) { }

  // TODO limpiar ngoninit
  ngOnInit(): void {
    this.studentId = this.activeRoute.snapshot.params['id'];
    const role = this.authService.UserSessionData()?.role;
    this.allowedToStoreAnnotation = role !== UserRole.Student;
    if (!this.studentId) {
      if (role === UserRole.Student) {
        this.loadStudentFromUser();
      } else {
        this.router.navigate(['/']);
        return;
      }
    } else {
      this.isAbleToEdit =
        role === UserRole.SuperAdministrator || role === UserRole.Administrator;
      this.loadStudent();
    }

    if (
      this.authService.UserSessionData()?.admin_role ===
      AdministratorRole.SchoolSupervisor
    ) {
      this.annotationColumns.push({
        key: 'actions',
        label: 'Acciones',
        _style: { width: '10%' },
        filter: false,
        sorter: false,
      });
    }

    this.loadAnnotationLevels();
    combineLatest([this.student$, this.annotations$]).subscribe(
      ([student, annotations]) => {
        if (student && annotations) {
          this.severeStudent = false;
          // TODO ajustar validación
          //  student.institution?.amount_of_negative_annotations! <=
          //   annotations?.length!;
        }
      }
    );
  }

  ngAfterViewInit(): void {
    // Gestión de scroll hacia determinado elemento
    const goToAnnotations =
      this.activeRoute.snapshot.queryParams['goToAnnotations'];
    if (goToAnnotations) {
      this.collapses.annotations = true;
      setTimeout(() => {
        this.annotationsSection.nativeElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }, 1000);
    }
  }

  private async loadAnnotationLevels() {
    this.isLoading.next(true);
    const response = await firstValueFrom(
      await this.institutionService.loadAnnotationLevels()
    );
    if (response.data) {
      this.annotationLevelSubject.next(response.data);
    } else {
      this.annotationLevelSubject.next([]);
    }
    this.isLoading.next(false);
  }

  openDeleteModal(id: number) {
    this.annotation_id = id;
    this.deleteModalVisible = true;
  }

  resetDeletedModal() {
    this.annotation_id = 0;
    this.deleteModalVisible = false;
  }

  onConfirmDelete() {
    this.deletedAnnotation(this.annotation_id);
    this.resetDeletedModal();
  }

  loadStudent() {
    this.isLoading.next(true);
    this.studentService.loadStudentByID(this.studentId!).then((item) => {
      item.subscribe((response) => {
        this.isLoading.next(false);
        this.setLoadData(response.data);
      });
    });
  }

  loadStudentFromUser() {
    this.isLoading.next(true);
    this.studentService.loadStudentMe().then((item) => {
      item.subscribe((response) => {
        this.isLoading.next(false);
        this.setLoadData(response.data);
      });
    });
  }

  getAnnotationLevelColor(level: string): string {
    switch (level) {
      case AnnotationLevel.Positive:
        return 'success';
      case AnnotationLevel.Remedial:
        return 'neutral';
      case AnnotationLevel.Low:
        return 'warning';
      case AnnotationLevel.Severe:
        return 'danger';
      case AnnotationLevel.VerySevere:
        return 'very-severe';
      case AnnotationLevel.RemedialGeneral:
        return 'super-neutral';
      case AnnotationLevel.PositiveGeneral:
        return 'super-success';
      case AnnotationLevel.NegativeGeneral:
        return 'super-danger';
      default:
        return 'secondary';
    }
  }

  get isSuperAdmin() {
    return (
      this.authService.UserSessionData()?.role === UserRole.SuperAdministrator
    );
  }

  goToAnnotation() {
    this.router.navigate([`/students/${this.studentId}/annotations/store`], {
      queryParams: { name: (this.studentSubject.value as unknown as any).name },
    });
  }

  goToInterviewForm() {
    this.router.navigate([`/students/${this.studentId}/interviews/store`], {
      queryParams: { name: (this.studentSubject.value as unknown as any).name },
    });
  }

  goToUpdateForm() {
    this.router.navigate(['/students/update'], {
      queryParams: {
        id: this.studentId,
      },
    });
  }

  goToInterviewDetail(interviewId: number) {
    this.router.navigate([`/students/interviews/${interviewId}`]);
  }

  deletedAnnotation(annotation_id: number) {
    this.studentService.deleteAnnotation(annotation_id).then((item) => {
      item.subscribe((response) => {
        this.loadStudent();
      });
    });
  }

  get isAdmin() {
    return this.authService.UserSessionData()?.role === UserRole.Administrator;
  }

  private setLoadData(student?: Istudent | null) {
    this.studentSubject.next(student ? this.flattenStudent(student) : {});

    this.annotationsSubject.next(
      this.flattenAnnotations(student?.annotations ?? [])
    );

    this.interviewsSubject.next(
      this.flattenInterviews(student?.interviews ?? [])
    );

    this.loginLogsSubject.next(
    this.flattenLoginLogs(student?.loginLogs ?? [])
  );
  }

  private flattenStudent(student: Istudent): any {
    const activeCourse = student.courses ? student.courses[0] : null;
    const pastCourses = student.courses?.filter((course) => !course.active);
    return {
      id: student.id,
      name: `${student.user.detail?.first_name} ${student.user.detail?.second_name ?? ''
        } ${student.user.detail?.last_name} ${student.user.detail?.second_last_name ?? ''
        }`,
      username: student.user.username,
      role: student.user.role,
      email: student.user.detail?.email ?? null,
      rut: student.user.detail?.rut ?? null,
      birth_date: student.user.detail?.birth_date ?? null,
      people_living_with: student.people_living_with
        .map((kinship) => this.kinshipPipe.transform(kinship as any))
        .join(', '),
      number_of_siblings: student.number_of_siblings,
      medical_diagnosis: student.medical_diagnosis ?? '-',
      repeated_courses: student.repeated_courses,
      years_in_school: student.years_in_school,
      address: student.address,
      guardians: student.guardians?.map((guardian) => ({
        name: `${guardian.name} ${guardian.last_name}`,
        email: guardian.email,
        kinship: guardian.kinship,
        phone: guardian.phone,
        id: guardian.id,
      })),
      active_course: activeCourse
        ? {
          course_name: activeCourse.name,
          // course_level: activeCourse.level,
        }
        : null,
      past_courses: pastCourses?.map((course) => ({
        course_name: course.name,
        // course_level: course.level,
      })),
      institution: {
        // TODO refactor
        name: '',
        address: '',
        deadline_for_closing_a_complaint: 0,
        amount_of_negative_annotations: 0,
      },
    };
  }
  // TODO refactor tipado any
  private flattenAnnotations(annotations: Iannotation[]): any {
    return annotations.map((annotation) => {
      const user = `${annotation.user.detail?.first_name} ${annotation.user.detail?.last_name}`;
      let role = '';
      if (annotation.user && annotation.user.administrator) {
        role = this.translateAdminRole.transform(
          annotation.user.administrator.admin_role
        );
      }
      if (
        annotation.user &&
        (annotation.user.student || annotation.user.teacher)
      ) {
        role = this.translateRole.transform(annotation.user.role);
      }
      return {
        id: annotation.id,
        type: annotation.type,
        observation: annotation.observation,
        created_at: annotation.created_at,
        annotator: user,
        role,
        subcategory: annotation.subcategory || '',
      };
    });
  }

  private flattenInterviews(interviews: Iinterview[]): any {
    return interviews?.map((interview) => ({
      id: interview.id,
      student_id: interview.student_id,
      interview_date: interview.interview_date,
      reason: interview.reason,
      records: interview.records,
      comments: interview.comments,
      agreements: interview.agreements,
      created_at: interview.created_at,
      registered_by: interview.user
        ? `${interview.user.detail!.first_name} ${interview.user.detail!.last_name
        }`
        : 'Sin registro',
      role: interview.user
        ? interview.user.role === UserRole.Teacher
          ? 'Profesor'
          : 'Inspector'
        : 'Sin registro',
    }));
  }

  private flattenLoginLogs(logs: ILoginLog[]): any[] {
  return logs.map((log) => ({
    id: log.id,
    created_at: log.created_at,
    action_log: this.translateActionLog(log.action_log),
    description: log.description,
  }));
}

private translateActionLog(action: string): string {
  switch (action) {
    case 'login':
      return 'Inicio de sesión';
    default:
      return action;
  }
}

  mapAnnotationLevel(
    annotationLevels: IInstitutionAnnotationLevel[],
    annotationLevel: string
  ) {
    return mapAnnotationLevel(annotationLevels, annotationLevel);
  }

  async generatePDF(elementId: string = 'reporte-container') {
    const studentName = (this.studentSubject.value as unknown as any).name;
    const fileName = `Reporte_Anotaciones_${studentName}`;
    if (this.pdfManager.isValidateColorModeForPDF()) {
      await this.pdfManager.generatePDF(elementId, fileName);
    }
  }
}
