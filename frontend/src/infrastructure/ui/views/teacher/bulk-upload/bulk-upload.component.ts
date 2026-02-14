import { CommonModule, NgStyle } from '@angular/common';
import {
  AfterContentInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
} from '@angular/core';
import { ChartjsModule } from '@coreui/angular-chartjs';
import {
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
  SharedModule,
  SmartTableComponent,
  SmartTableFilterComponent,
  TemplateIdDirective,
  TextColorDirective,
  WidgetModule,
  WidgetStatFComponent,
} from '@coreui/angular-pro';
import { cilArrowRight, cilChartPie } from '@coreui/icons';
import { IconComponent, IconModule } from '@coreui/icons-angular';
import { studentManager } from '@infra-adapters/services/student.service';
import { teacherManager } from '@infra-adapters/services/teacher.service';
import {
  NgxFileDropEntry,
  FileSystemFileEntry,
  NgxFileDropModule,
} from 'ngx-file-drop';
import { BehaviorSubject, firstValueFrom } from 'rxjs';

@Component({
  selector: 'bulk-upload',
  standalone: true,
  imports: [
    NgxFileDropModule,
    CommonModule,
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
    SharedModule,
    WidgetModule,
    IconModule,
    ChartjsModule,
    WidgetStatFComponent,
  ],
  templateUrl: './bulk-upload.component.html',
  styleUrl: './bulk-upload.component.scss',
})
export class BulkUploadComponent {
  public files: NgxFileDropEntry[] = [];
  isLoading = false;
  // TODO interfaces
  teacherErrors = new BehaviorSubject<any[]>([]);
  teacherCoursesErrors = new BehaviorSubject<any[]>([]);
  validTeachersCount = new BehaviorSubject<[] | null>(null);
  validTeacherCoursesCount = new BehaviorSubject<[] | null>(null);

  icons = { cilChartPie, cilArrowRight };

  teacherColumns = [
    { key: 'rut', label: 'Profesor (RUT)' },
    { key: 'errors', label: 'Errores' },
    {
      key: 'details',
      label: 'Detalle',
      _style: { width: '10%' },
      filter: false,
      sorter: false,
    },
  ];

  teacherCoursesColumns = [
    { key: 'rut', label: 'Profeso asociado a curso' },
    { key: 'errors', label: 'Errores' },
    {
      key: 'details',
      label: 'Detalle',
      _style: { width: '10%' },
      filter: false,
      sorter: false,
    },
  ];

  details_visible = Object.create({});

  toggleTeacherDetails(item: any) {
    this.details_visible[item.rut] = !this.details_visible[item.rut];
  }

  toggleGuardianDetails(item: any) {
    this.details_visible[item.rut] = !this.details_visible[item.rut];
  }

  constructor(
    private teacherService: teacherManager,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  ngAfterContentInit(): void {
    this.changeDetectorRef.detectChanges();
  }

  onFilesDropped(files: NgxFileDropEntry[]) {
    this.files = files;

    files.forEach((droppedFile) => {
      if (droppedFile.fileEntry.isFile) {
        const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
        fileEntry.file((file: File) => {
          this.uploadFile(file);
        });
      }
    });
  }

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.uploadFile(file);
    } else {
      console.warn('No se seleccionó ningún archivo.');
    }
  }

  private async uploadFile(file: File) {
    this.isLoading = true;
    try {
      firstValueFrom(await this.teacherService.uploadFile(file))
        .then((response) => {
          if (
            'errors' in response &&
            'valid_teachers' in response &&
            'valid_teacher_courses' in response
          ) {
            this.processResponse(response);
          }
        })
        .catch((error) => {
          // TODO alerta de errores
          console.error('Error al subir el archivo:', error);
        });
    } catch (error) {
      console.error('Error al subir archivo:', error);
    } finally {
      this.isLoading = false;
    }
  }

  private processResponse(response: any) {
    const teacherErrors = Object.entries(response.errors.teachers).map(
      ([rut, value]: [string, any]) => {
          const allMessages = [
            ...(value.errors || []),
            ...(value.warnings || []),
          ];

          return {
            rut,
            errors: allMessages,
            details: value.row,
          };
        }
    );
    const teacherCoursesErrors = Object.entries(
      response.errors.teacher_courses
    ).map(([key, value]: any) => ({
      email: key,
      errors: value.errors,
      details: value.row,
    }));
    this.teacherErrors.next(teacherErrors);
    this.teacherCoursesErrors.next(teacherCoursesErrors);
    this.validTeachersCount.next(response.valid_teachers);
    this.validTeacherCoursesCount.next(response.valid_teacher_courses);
  }
}
