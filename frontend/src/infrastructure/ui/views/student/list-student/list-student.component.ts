import type { Istudent } from '@core-ports/outputs/student';
import { CommonModule, NgStyle } from '@angular/common';
import { Component, OnInit } from '@angular/core';
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
import { studentManager } from '@infra-adapters/services/student.service';
import { BehaviorSubject, Subject } from 'rxjs';
import { Router } from '@angular/router';
import { IconComponent } from '@coreui/icons-angular';
import { AuthManager } from '@infra-adapters/services/auth.service';
import { UserRole } from '@core-interfaces/global';

@Component({
  selector: 'list-student',
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
    TooltipDirective,
  ],
  templateUrl: './list-student.component.html',
  styleUrl: './list-student.component.scss',
})
export class ListStudentComponent implements OnInit {
  private studentSubject = new BehaviorSubject<Istudent[]>([]);
  isLoading: Subject<boolean> = new Subject();

  students = this.studentSubject.asObservable();

  // TODO mapping de columnas para tablas
  columns: IColumn[] = [
    { key: 'name', label: 'Nombre' },
    { key: 'email', label: 'Correo Electrónico' },
    { key: 'rut', label: 'RUT' },
    { key: 'course_name', label: 'Curso' },
    { key: 'annotations_count', label: 'Anotaciones' },
    {
      key: 'last_login',
      label: 'Último acceso',
      _style: { width: '15%' },
    },
    {
      key: 'actions',
      label: 'Acciones',
      _style: { width: '10%' },
      filter: false,
      sorter: false,
    },
  ];

  details_visible = Object.create({});

  selectedStudentId: number | null = null;
  selectedStudentName: string | null = null;
  deleteModalVisible = false;

  constructor(
    private studentService: studentManager,
    private router: Router,
    private authService: AuthManager
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  toggleDetails(item: any) {
    this.details_visible[item] = !this.details_visible[item];
  }

  goToStudentProfile(id: number) {
    this.router.navigate(['/students', id, 'profile']);
  }

  onCreate() {
    this.router.navigate(['/students/store']);
  }

  onUpdate(id: number) {
    this.router.navigate(['/students/update'], {
      queryParams: {
        id,
      },
    });
  }

  getAnnotationCountBadgeColor(count: number): string {
    if (count === 0) {
      return 'success';
    } else if (count < 3) {
      return 'warning';
    } else {
      return 'danger';
    }
  }

  openDeleteModal(id: number, name: string) {
    this.selectedStudentId = id;
    this.selectedStudentName = name;
    this.deleteModalVisible = true;
  }

  resetModal() {
    this.selectedStudentId = null;
    this.selectedStudentName = null;
    this.deleteModalVisible = false;
  }

  get isSuperAdmin() {
    return (
      this.authService.UserSessionData()?.role === UserRole.SuperAdministrator
    );
  }

  async onConfirmDelete() {
    if (this.selectedStudentId !== null) {
      (
        await this.studentService.deleteStudent(this.selectedStudentId)
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

  private loadData() {
    if (
      this.authService.UserSessionData()?.role !== UserRole.SuperAdministrator
    ) {
      this.loadStudents();
    } else if (this.authService.InstitutionSelected() !== 0) {
      this.loadStudents();
    }
  }

  private loadStudents() {
    this.isLoading.next(true);
    this.studentService
      .loadStudents()
      .then((item) => {
        item.subscribe((response) => {
          this.isLoading.next(false);
          this.studentSubject.next(
            response.data ? this.flattenStudent(response.data) : []
          );
        });
      })
      .catch((err) => {
        this.isLoading.next(false);
      });
  }

  private flattenStudent(students: Istudent[]): any[] {
    return students.map((student) => ({
      id: student.id,
      name: student.user?.detail ? 
        `${student.user.detail.first_name || ''} ${student.user.detail.second_name || ''} ${student.user.detail.last_name || ''} ${student.user.detail.second_last_name || ''}`.trim() 
        : 'Nombre no disponible',
      username: student.user?.username || '',
      role: student.user?.role || '',
      email: student.user?.detail?.email || null,
      rut: student.user?.detail?.rut || null,
      birth_date: student.user?.detail?.birth_date || null,
      people_living_with: student.people_living_with || null,
      number_of_siblings: student.number_of_siblings || null,
      medical_diagnosis: student.medical_diagnosis || null,
      repeated_courses: student.repeated_courses || null,
      address: student.address || null,
      guardians: student.guardians?.map((guardian) => ({
        name: `${guardian.name || ''} ${guardian.last_name || ''}`.trim(),
        email: guardian.email || '',
        kinship: guardian.kinship || '',
        id: guardian.id,
      })) || [],
      annotations_count: student.annotations ? student.annotations.length : 0,
      course_name: student.courses?.[0]?.name || '-',
      courses: student.courses?.map((course) => ({
        course_name: course.name || '',
      })) || [],
      last_login: this.getLastLogin(student.loginLogs),

    }));
  }

  async donwloadStudentsTemplate() {
    await this.studentService.generateExcelFile();
  }

  async donwloadEmptyStudentTemplate() {
    await this.studentService.generateEmptyExcelFile();
  }

  upload() {
    this.router.navigate(['/students/upload']);
  }
  
  uploadSIGE() {
    this.router.navigate(['/students/upload'], {
      queryParams: {
        templateSIGE: true,
      },
    });
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
