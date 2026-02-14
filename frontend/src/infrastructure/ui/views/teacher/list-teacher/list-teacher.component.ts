import { CommonModule, NgStyle } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import type { IteacherN } from '@core-ports/outputs/teacher';
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
  TooltipDirective,
  type IColumn,
} from '@coreui/angular-pro';
import { teacherManager } from '@infra-adapters/services/teacher.service';
import { BehaviorSubject, Subject } from 'rxjs';
import { Router } from '@angular/router';
import { IconComponent } from '@coreui/icons-angular';

import { TranslateTeacherRolePipe } from '@infra-adapters/pipe/TranslateTeacher.pipe';
import { AuthManager } from '@infra-adapters/services/auth.service';
import { UserRole } from '@core-interfaces/global';
@Component({
  selector: 'list-teacher',
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
    TranslateTeacherRolePipe,
    ContainerComponent,
    TooltipDirective,
  ],
  templateUrl: './list-teacher.component.html',
  styleUrl: './list-teacher.component.scss',
})
export class ListTeacherComponent implements OnInit {
  private teacherSubject = new BehaviorSubject<IteacherN[]>([]);
  isLoading: Subject<boolean> = new Subject();

  teachers = this.teacherSubject.asObservable();

  // TODO mapping de columnas para tablas
  columns: IColumn[] = [
    {
      key: 'name',
      label: 'Profesor',
    },
    {
      key: 'email',
      label: 'Correo',
    },
    {
      key: 'rut',
      label: 'RUT',
    },
    {
      key: 'subject_specialty',
      label: 'Especialidad',
    },
    {
      key: 'last_login',
      label: 'Último acceso',
      _style: { width: '15%' },
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

  selectedTeacherId: number | null = null;
  selectedTeacherName: string | null = null;
  deleteModalVisible = false;

  constructor(
    private teacherService: teacherManager,
    private router: Router,
    private authService: AuthManager
  ) {}

  get isSuperAdmin() {
    return (
      this.authService.UserSessionData()?.role === UserRole.SuperAdministrator
    );
  }

  ngOnInit(): void {
    this.loadData();
  }

  toggleDetails(item: any) {
    this.details_visible[item] = !this.details_visible[item];
  }

  onCreate() {
    this.router.navigate(['/teachers/store']);
  }

  onUpdate(id: number) {
    this.router.navigate(['/teachers/update'], {
      queryParams: {
        id,
      },
    });
  }

  openDeleteModal(id: number, name: string) {
    this.selectedTeacherId = id;
    this.selectedTeacherName = name;
    this.deleteModalVisible = true;
  }

  resetModal() {
    this.selectedTeacherId = null;
    this.selectedTeacherName = null;
    this.deleteModalVisible = false;
  }

  async onConfirmDelete() {
    if (this.selectedTeacherId !== null) {
      (
        await this.teacherService.deleteTeacher(this.selectedTeacherId)
      ).subscribe({
        next: (_) => {
          this.loadData();
          this.resetModal();
        },
        error: (error) => {
          console.error('Error al actualizar:', error);
        },
      });
    }
  }

  private flattenTeachers(teachers: IteacherN[]): any[] {
    return teachers.map((teacher) => ({
      id: teacher.id,
      name: `${teacher.user.detail?.first_name} ${teacher.user.detail?.last_name}`,
      username: teacher.user.username,
      role: teacher.user.role,
      email: teacher.user.detail?.email ?? null,
      rut: teacher.user.detail?.rut ?? null,
      birth_date: teacher.user.detail?.birth_date ?? null,
      subject_specialty: teacher.subject_specialty,
      last_login: this.getLastLogin(teacher.loginLogs),
      loginLogs: teacher.user.loginLogs,
      courses: teacher.courses?.map((course) => ({
        course_name: course.name,
        // course_level: course.level,
        course_role: course.detail?.role,
        is_substitute: course.detail?.is_substitute,
        start_date: course.detail?.start_date,
        end_date: course.detail?.end_date,
      })),
    }));
  }

  private loadData() {
    if (
      this.authService.UserSessionData()?.role !== UserRole.SuperAdministrator
    ) {
      this.loadTeachers();
    } else if (this.authService.InstitutionSelected() !== 0) {
      this.loadTeachers();
    }
  }

  private loadTeachers() {
    this.isLoading.next(true);
    this.teacherService
      .loadTeachers()
      .then((item) => {
        item.subscribe((response) => {
          this.isLoading.next(false);
          this.teacherSubject.next(
            response.data ? this.flattenTeachers(response.data) : []
          );
        });
      })
      .catch((err) => {
        this.isLoading.next(false);
      });
  }

  goToTeacherProfile(id: number) {
    this.router.navigate([`/teachers/${id}/profile`]);
  }

  async download() {
    await this.teacherService.generateExcelFile();
  }

  upload() {
    this.router.navigate(['/teachers/upload']);
  }

  private getLastLogin(logs?: any[]): string {
    if (!logs || logs.length === 0) {
      return 'Sin registros';
    }

    const lastLog = logs[logs.length - 1];

    return lastLog?.created_at
      ? this.formatDate(lastLog.created_at)
      : 'Sin registros';
  }

  private formatDate(dateString: string): string {
    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
      return 'Fecha inválida';
    }

    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    return `${day}/${month}/${year} ${hours}:${minutes}`;
  }
}
