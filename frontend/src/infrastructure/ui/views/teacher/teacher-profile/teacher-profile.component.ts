import { Component, OnInit } from '@angular/core';
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
} from '@coreui/angular-pro';
import { CommonModule, NgStyle } from '@angular/common';
import { IconComponent } from '@coreui/icons-angular';
import { TranslateAnnotationLevelPipe } from '@infra-adapters/pipe/TranslateAnnotationLevel.pipe';
import { TranslateKinshipPipe } from '@infra-adapters/pipe/TranslateKinship.pipe';
import { CustomDatePipe } from '@infra-adapters/pipe/CustomDate.pipe';
import { IteacherN } from '@core-ports/outputs/teacher';
import { teacherManager } from '@infra-adapters/services/teacher.service';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateTeacherRolePipe } from '@infra-adapters/pipe/TranslateTeacher.pipe';
import { AuthManager } from '@infra-adapters/services/auth.service';
import { UserRole } from '@core-interfaces/global';
import type { ILoginLog } from '@core-interfaces/ports/outputs/user';

@Component({
  selector: 'teacher-profile',
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

    CustomDatePipe,
    TranslateTeacherRolePipe,
  ],
  templateUrl: './teacher-profile.component.html',
  styleUrl: './teacher-profile.component.scss',
})
export class TeacherProfileComponent implements OnInit {
  teacherId: number | null = null;
  private teacherSubject = new BehaviorSubject<IteacherN | null>(null);
  private loginLogsSubject = new BehaviorSubject<ILoginLog[]>([]);
  teacher$ = this.teacherSubject.asObservable();
  loginLogs$ = this.loginLogsSubject.asObservable();
  isLoading: Subject<boolean> = new Subject();

  isAbleToEdit = false;

  constructor(
    private authService: AuthManager,
    private teacherService: teacherManager,
    private router: Router,
    private activeRoute: ActivatedRoute
  ) {}

  courseColumns: IColumn[] = [
    {
      key: 'name',
      label: 'Curso',
    },
    {
      key: 'role',
      label: 'Cargo',
    },
    {
      key: 'start_date',
      label: 'Fecha de inicio',
    },
    {
      key: 'end_date',
      label: 'Fecha de término',
    },
  ];

  loginLogsColumns: IColumn[] = [
  { key: 'created_at', label: 'Fecha y hora' },
  { key: 'action_log', label: 'Acción' },
  { key: 'description', label: 'Descripción' },
];

collapses = {
    loginLogs: false,
  };

  ngOnInit(): void {
    this.teacherId = Number(this.activeRoute.snapshot.params['id']);
    const role = this.authService.UserSessionData()?.role;
    if (!this.teacherId) {
      if (role === UserRole.Teacher) {
        this.loadTeacherFromUser();
      } else {
        this.router.navigate(['/']);
        return;
      }
    } else {
      this.isAbleToEdit =
        role === UserRole.SuperAdministrator || role === UserRole.Administrator;
      this.loadTeacher();
    }
  }

   get isSuperAdmin() {
    return (
      this.authService.UserSessionData()?.role === UserRole.SuperAdministrator
    );
  }

  async loadTeacher() {
  this.isLoading.next(true);

  const response = await firstValueFrom(
    await this.teacherService.loadTeacherByID(this.teacherId!)
  );

  const teacher = response.data!;

  this.teacherSubject.next(this.flattenTeacher(teacher));

  this.loginLogsSubject.next(
    this.flattenLoginLogs(teacher.loginLogs ?? [])
  );

  this.isLoading.next(false);
}

  async loadTeacherFromUser() {
    this.isLoading.next(true);
    const teacher = await firstValueFrom(
      await this.teacherService.loadTeacherMe()
    );
    this.teacherSubject.next(this.flattenTeacher(teacher.data!));
    this.isLoading.next(false);
  }

  private flattenTeacher(teacher: IteacherN): any {
    return {
      ...teacher,
      name: `${teacher.user.detail?.first_name} ${teacher.user.detail?.last_name}`,
      username: teacher.user.username,
      email: teacher.user.detail?.email,
      rut: teacher.user.detail?.rut,
      birth_date: teacher.user.detail?.birth_date,
      courses: (teacher?.courses ?? []).map((course) => ({
        ...course,
        role: course.detail?.role,
        start_date: course?.detail?.start_date,
        end_date: course?.detail?.end_date,
      })),
    };
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

toggleCollapse(key: keyof typeof this.collapses): void {
  this.collapses[key] = !this.collapses[key];
}


  goToUpdateForm() {
    this.router.navigate(['/teachers/update'], {
      queryParams: {
        id: this.teacherId,
      },
    });
  }
}
