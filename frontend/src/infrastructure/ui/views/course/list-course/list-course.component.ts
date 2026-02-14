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
import { CourseManager } from '@infra-adapters/services/course.service';
import { BehaviorSubject, firstValueFrom, Subject } from 'rxjs';
import { Router } from '@angular/router';
import { IconComponent } from '@coreui/icons-angular';
import { Icourse } from '@core-ports/outputs/course';
import { AuthManager } from '@infra-adapters/services/auth.service';
import { AdministratorRole, UserRole } from '@core-interfaces/global';
import { Istudent } from '@core-ports/outputs/student';
import { studentManager } from '@infra-adapters/services/student.service';

interface IstudentMapping {
  id: number;
  name: string;
  email: string;
  rut: string;
  annotations_count: number;
}

@Component({
  selector: 'list-course',
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
  templateUrl: './list-course.component.html',
  styleUrl: './list-course.component.scss',
})
export class ListCourseComponent implements OnInit {
  private courseSubject = new BehaviorSubject<Icourse[]>([]);
  isLoading: Subject<boolean> = new Subject();

  courses = this.courseSubject.asObservable();

  students: IstudentMapping[] = [];

  columns: IColumn[] = [
    {
      key: 'name',
      label: 'Nombre de Curso',
    },
    {
      key: 'actions',
      label: '',
      _style: { width: '5%' },
      filter: false,
      sorter: false,
    },
  ];

  studentColumns: IColumn[] = [
    { key: 'name', label: 'Nombre' },
    { key: 'email', label: 'Correo Electrónico' },
    { key: 'rut', label: 'RUT' },
    { key: 'annotations_count', label: 'Anotaciones' },
    {
      key: 'actions',
      label: 'Acciones',
      _style: { width: '5%' },
      filter: false,
      sorter: false,
    },
  ];

  details_visible = Object.create({});

  selectedCourseId: number | null = null;
  selectedCourseName: string | null = null;
  selectedStudentId: number | null = null;
  selectedStudentName: string | null = null;
  deleteModalVisible = false;
  deleteStudentModalVisible = false;

  allowedToEdit =
    this.authService.UserSessionData()?.role === UserRole.SuperAdministrator;

  constructor(
    private courseService: CourseManager,
    private studentService: studentManager,
    private router: Router,
    private authService: AuthManager
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  get allowedToAnnotationStudent() {
    return (
      this.authService.UserSessionData()?.role === UserRole.Administrator ||
      this.authService.UserSessionData()?.role === UserRole.Teacher
    );
  }

  async toggleDetails(id: number) {
  if (this.selectedCourseId === id) {
    this.details_visible[id] = false;
    this.selectedCourseId = null;
    return;
  }

  if (this.selectedCourseId !== null) {
    this.details_visible[this.selectedCourseId] = false;
  }

  this.details_visible[id] = true;
  this.selectedCourseId = id;

  const response = await firstValueFrom(
    await this.courseService.loadStudentsByCourseID(id)
  );

  if (response.data) {
    this.students = this.mappgingCourse(response.data);
  }
}

  onUpdateStudent(studentId: number): void {
    this.router.navigate(['/students/update'], {
      queryParams: {
        id: studentId,
      },
    });
  }

  onCreate() {
    this.router.navigate(['/courses/store']);
  }

  onUpdate(id: number) {
    this.router.navigate(['/courses/update'], {
      queryParams: {
        id,
      },
    });
  }

  navToAnnotationForm(id: number) {
    this.router.navigate(['/courses', id, 'annotations', 'store'], {
      queryParams: {
        courseName: this.courseSubject.value.find((c) => c.id === id)?.name,
      },
    });
  }

  goToStudentProfile(id: number) {
    this.router.navigate(['/students', id, 'profile']);
  }

  openDeleteModal(id: number, name: string) {
    this.selectedCourseId = id;
    this.selectedCourseName = name;
    this.deleteModalVisible = true;
  }

  openDeleteStudentModal(id: number, name: string, item: IstudentMapping) {
    this.selectedStudentId = id;
    this.selectedStudentName = name;
    this.deleteStudentModalVisible = true;
  }

  resetModal() {
    this.selectedCourseId = null;
    this.selectedCourseName = null;
    this.deleteModalVisible = false;
  }

  resetStudentModal() {
    this.selectedStudentId = null;
    this.selectedStudentName = null;
    this.deleteStudentModalVisible = false;
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

  async onConfirmDelete() {
    if (this.selectedCourseId !== null) {
      (await this.courseService.deleteCourse(this.selectedCourseId)).subscribe({
        next: (_) => {
          this.loadData();
          this.resetModal();
        },
        error: (error) => {
          console.error('Error al eliminar:', error);
        },
      });
    }
  }

  async onConfirmStudentDelete() {
    if (this.selectedStudentId !== null) {
      (
        await this.studentService.deleteStudent(this.selectedStudentId)
      ).subscribe({
        next: (_) => {
          if (this.selectedCourseId) {
            this.reloadStudents(this.selectedCourseId);
          }
          this.resetStudentModal();
        },
        error: (error) => {
          console.error('Error al eliminar:', error);
        },
      });
    }
  }

  private async reloadStudents(courseId: number) {
  const response = await firstValueFrom(
    await this.courseService.loadStudentsByCourseID(courseId)
  );

  this.students = response.data
    ? this.mappgingCourse(response.data)
    : [];
}

  get isSuperA() {
    return (
      this.authService.UserSessionData()?.role === UserRole.SuperAdministrator
    );
  }

  private loadData() {
    if (
      this.authService.UserSessionData()?.role !== UserRole.SuperAdministrator
    ) {
      this.loadCourse();
    } else if (this.authService.InstitutionSelected() !== 0) {
      this.loadCourse();
    }
  }

  private loadCourse() {
    this.isLoading.next(true);
    this.courseService
      .loadCourses()
      .then((item) => {
        item.subscribe((response) => {
          this.isLoading.next(false);
          this.courseSubject.next(response.data ?? []);
        });
      })
      .catch((err) => {
        this.isLoading.next(false);
      });
  }

  private mappgingCourse(students: Istudent[]): IstudentMapping[] {
    return students.map((student) => ({
      id: student.id,
      name: `${student.user.detail?.first_name} ${
        student.user.detail?.second_name ?? ''
      } ${student.user.detail?.last_name} ${
        student.user.detail?.second_last_name ?? ''
      }`,
      email: student.user.detail?.email,
      rut: student.user.detail?.rut,
      annotations_count: student.annotations?.length ?? 0,
    })) as IstudentMapping[];
  }
}
