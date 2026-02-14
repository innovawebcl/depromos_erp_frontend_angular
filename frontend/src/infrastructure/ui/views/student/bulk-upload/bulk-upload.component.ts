import { ActivatedRoute } from '@angular/router';
import { CommonModule, NgStyle } from '@angular/common';
import {
  AfterContentInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
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
import {
  NgxFileDropEntry,
  FileSystemFileEntry,
  NgxFileDropModule,
} from 'ngx-file-drop';
import { BehaviorSubject, firstValueFrom } from 'rxjs';

@Component({
  selector: 'bulk-upload',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Default,
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
export class BulkUploadComponent implements AfterContentInit {
  templateSIGE: boolean = false;
  public files: NgxFileDropEntry[] = [];
  isLoading = false;
  // TODO interfaces
  studentErrors = new BehaviorSubject<any[]>([]);
  guardianErrors = new BehaviorSubject<any[]>([]);
  validStudentsCount = new BehaviorSubject<[] | null>(null);
  validGuardiansCount = new BehaviorSubject<[] | null>(null);

  icons = { cilChartPie, cilArrowRight };

  studentColumns = [
    { key: 'rut', label: 'Estudiante (RUT)' },
    { key: 'errors', label: 'Errores' },
    {
      key: 'details',
      label: 'Detalle',
      _style: { width: '10%' },
      filter: false,
      sorter: false,
    },
  ];

  guardianColumns = [
    { key: 'email', label: 'Apoderado (Email)' },
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

  toggleStudentDetails(item: any) {
    this.details_visible[item.rut] = !this.details_visible[item.rut];
  }

  toggleGuardianDetails(item: any) {
    this.details_visible[item.email] = !this.details_visible[item.email];
  }

  constructor(
    private studentService: studentManager,
    private changeDetectorRef: ChangeDetectorRef,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      if (params['templateSIGE'] !== undefined) {
        this.templateSIGE = params['templateSIGE'];
      }
    });
  }

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
    file;
    try {
      firstValueFrom(
        await this.studentService.uploadFile(file, this.templateSIGE)
      )
        .then((response) => {
          if (
            'errors' in response &&
            'valid_guardians' in response &&
            'valid_students' in response
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
    if (response.errors.students) {
      const studentErrors = Object.entries(response.errors.students).map(
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

      this.studentErrors.next(studentErrors);
    }

    if (response.errors.guardians) {
      const guardianErrors = Object.entries(response.errors.guardians).map(
        ([key, value]: any) => ({
          email: key,
          errors: value.errors,
          details: value.row,
        })
      );
      this.guardianErrors.next(guardianErrors);
    }

    this.validStudentsCount.next(response.valid_students);
    this.validGuardiansCount.next(response.valid_guardians);
  }
}
