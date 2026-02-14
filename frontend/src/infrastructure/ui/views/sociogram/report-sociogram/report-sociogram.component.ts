import { CommonModule, NgStyle } from '@angular/common';
import {
  Component,
  inject,
  OnInit,
  ViewChild,
  Renderer2,
  ElementRef,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NumberOrNull } from '@core-interfaces/global';
import {
  IcoursesToSociogram,
  IreportSociogram,
} from '@core-ports/outputs/sociograms';
import {
  ButtonDirective,
  CardBodyComponent,
  CardComponent,
  CardGroupComponent,
  CardHeaderComponent,
  ColComponent,
  ContainerComponent,
  FormSelectDirective,
  RowComponent,
  FormControlDirective,
  FormDirective,
  ListGroupDirective,
  ListGroupItemDirective,
  AlertComponent,
  SpinnerModule,
  ColorModeService,
} from '@coreui/angular-pro';
import { IconComponent, IconModule } from '@coreui/icons-angular';
import { sociogramManager } from '@infra-adapters/services/sociogram.service';
import { TranslateReportPipe } from '@infra-adapters/pipe/TranslateReport.pipe';
import { firstValueFrom, take } from 'rxjs';

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/** Custom Components */
import { LogoComponent } from './components/logo/logo.component';
import { OverviewInformationComponent } from './components/overview-information/overview-information.component';
import { SimpleMetricsComponent } from './components/simple-metrics/simple-metrics.component';
import { InstitutionMetricsComponent } from './components/institution-metrics/institution-metrics.component';
import { RelationshipMetricsComponent } from './components/relationship-metrics/relationship-metrics.component';
import { LeadersMetricsComponent } from './components/leaders-metrics/leaders-metrics.component';
import { GroupRelationshipMetricsComponent } from './components/group-relationship-metrics/group-relationship-metrics.component';
import { LonelyMetricsComponent } from './components/lonely-metrics/lonely-metrics.component';
import { SelfHealthMetricsComponent } from './components/self-health-metrics/self-health-metrics.component';
import { ReinforcementMetricsComponent } from './components/reinforcement-metrics/reinforcement-metrics.component';
import { BullyingMetricsComponent } from './components/bullying-metrics/bullying-metrics.component';
import { EndDescriptionReportComponent } from './components/end-description-report/end-description-report.component';
import { ToastrService } from 'ngx-toastr';
import { PdfManagerService } from '@infra-adapters/services/pdf-manager.service';

@Component({
  selector: 'report-sociogram',
  standalone: true,
  imports: [
    FormDirective,
    CommonModule,
    ButtonDirective,
    RowComponent,
    ColComponent,
    CardComponent,
    CardHeaderComponent,
    CardBodyComponent,
    ContainerComponent,
    CardGroupComponent,
    NgStyle,
    IconModule,
    IconComponent,
    ReactiveFormsModule,
    FormSelectDirective,
    FormControlDirective,
    ListGroupDirective,
    ListGroupItemDirective,
    LogoComponent,
    OverviewInformationComponent,
    SimpleMetricsComponent,
    InstitutionMetricsComponent,
    RelationshipMetricsComponent,
    LeadersMetricsComponent,
    GroupRelationshipMetricsComponent,
    LonelyMetricsComponent,
    SelfHealthMetricsComponent,
    ReinforcementMetricsComponent,
    BullyingMetricsComponent,
    EndDescriptionReportComponent,
    AlertComponent,
    TranslateReportPipe,
    SpinnerModule,
  ],
  templateUrl: './report-sociogram.component.html',
  styleUrl: './report-sociogram.component.scss',
})
export class ReportSociogramComponent implements OnInit {
  @ViewChild('canvas') canvas!: any;
  @ViewChild('canvas2') canvas2!: any;

  readonly #colorModeService = inject(ColorModeService);
  readonly colorMode = this.#colorModeService.colorMode;

  loadingScreenshoot: boolean = false;
  disabledPDF: boolean = false;

  sociogramWithCourses: IcoursesToSociogram | null = null;
  sociogram_id: string | null = null;

  courseForm = new FormGroup({
    course_id: new FormControl<NumberOrNull>(null),
  });

  sociogram: IreportSociogram | null = null;

  readonly pdfManager = inject(PdfManagerService);

  readonly loadingPDF = this.pdfManager.loading;

  constructor(
    private sociogramService: sociogramManager,
    private route: ActivatedRoute,
    private ToastrService: ToastrService,
    private renderer: Renderer2,
    private hostEl: ElementRef<HTMLElement>
  ) {}

  ngOnInit(): void {
    this.sociogram_id = this.route.snapshot.queryParamMap.get('id');
    if (this.sociogram_id) {
      this.loadCoursesBySociogramID();
    }
  }

  async onChange($event: any) {
    this.loadMetrics($event.target.value);
  }

  trackByChart(index: number, chart: any): number {
    return index;
  }

  getKeysByObject(metric: any) {
    return Object.keys(metric);
  }

  serializeMetricsToCharts(metrics: any[]): any[] {
    return metrics.map((metric) => {
      const labels = Object.keys(metric.answers); // Claves de las respuestas
      const data = Object.values(metric.answers); // Valores de las respuestas
      return {
        title: metric.question,
        data: {
          labels: labels,
          datasets: [
            {
              label: metric.question, // Texto de la pregunta
              backgroundColor: this.generateColors(labels.length),
              borderRadius: 6,
              borderSkipped: false,
              data: data,
              barPercentage: 0.6,
              categoryPercentage: 0.5,
            },
          ],
        },
        options: {
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false,
            },
          },
          scales: {
            x: {
              grid: {
                color: this.getStyle('--cui-border-color-translucent'),
                display: false,
                drawTicks: false,
              },
              ticks: {
                color: this.getStyle('--cui-body-color'),
                font: {
                  size: 14,
                },
                padding: 16,
              },
            },
            y: {
              beginAtZero: true,
              grid: {
                color: this.getStyle('--cui-border-color-translucent'),
              },
              ticks: {
                color: this.getStyle('--cui-body-color'),
                font: {
                  size: 14,
                },
                maxTicksLimit: 5,
                padding: 16,
                stepSize: 25, // Ajusta según tus datos
              },
            },
          },
        },
      };
    });
  }

  get isValidSociogram(): boolean {
    return this.sociogram ? true : false;
  }

  private async loadMetrics(value: string) {
    const response = await firstValueFrom(
      this.sociogramService.getReportBySociogramIdAndCourseID(
        Number(this.sociogram_id),
        Number(value)
      )
    );
    this.sociogram = response.data;
  }

  private getStyle(variable: string): string {
    // Simula la función getStyle de CoreUI
    const style = getComputedStyle(document.documentElement);
    return style.getPropertyValue(variable).trim();
  }

  private generateColors(count: number): string[] {
    const colors = [
      '#FF6384',
      '#36A2EB',
      '#FFCE56',
      '#4BC0C0',
      '#9966FF',
      '#FF9F40',
    ];
    return Array.from({ length: count }, (_, i) => colors[i % colors.length]);
  }

  private async loadCoursesBySociogramID() {
    const response = await firstValueFrom(
      this.sociogramService.getCoursesToSociogram(Number(this.sociogram_id))
    );
    const courses = response.data?.courses ?? [];
    this.sociogramWithCourses = response.data;
    if (courses.length > 0) {
      await this.loadMetrics(`${courses[0].id}`);
    }
  }

  async generatePDF() {
    if (this.pdfManager.isValidateColorModeForPDF()) {
      await this.pdfManager.generatePDFSociogram(
        '.avoid-break',
        'reporte-sociograma'
      );
    }
  }

  async sociogramScreenshot() {
    try {
      const titles = [
        'Relaciones Interpersonales',
        'Sugerencias para grupos de trabajos',
      ];
      this.loadingScreenshoot = true;
      const sociograms = Array.from(
        document.querySelectorAll('.sociogram-node')
      ) as HTMLElement[];

      for (let i = 0; i < sociograms.length; i++) {
        await html2canvas(sociograms[i], { scale: 2 }).then((canvas) => {
          const imageData = canvas.toDataURL('image/png');

          const link = document.createElement('a');
          link.setAttribute('download', `${titles[i]}.png`);
          link.setAttribute('href', imageData);
          link.click();
        });
      }
      this.loadingScreenshoot = false;
    } catch (error: unknown) {
      this.loadingScreenshoot = false;
    }
  }
}
