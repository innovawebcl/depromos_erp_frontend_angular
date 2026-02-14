import { CommonModule, NgStyle } from '@angular/common';
import { Component, OnInit } from '@angular/core';
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
  SmartTableComponent,
  SmartTableFilterComponent,
  TemplateIdDirective,
  TextColorDirective,
  TooltipDirective,
  type IColumn,
} from '@coreui/angular-pro';
import { sociogramManager } from '@infra-adapters/services/sociogram.service';
import { BehaviorSubject, firstValueFrom, Subject } from 'rxjs';
import { Router } from '@angular/router';
import { IconComponent, IconModule } from '@coreui/icons-angular';
import { AuthManager } from '@infra-adapters/services/auth.service';
import { UserRole } from '@core-interfaces/global';
import type { IanswerTypes, Isociogram } from '@core-ports/outputs/sociograms';

@Component({
  selector: 'list-sociogram',
  standalone: true,
  imports: [
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
    IconModule,
    IconComponent,
    TooltipDirective,
  ],
  templateUrl: './list-sociogram.component.html',
  styleUrl: './list-sociogram.component.scss',
})
export class ListSociogramComponent implements OnInit {
  private sociogramSubject = new BehaviorSubject<Isociogram[]>([]);
  isLoading: Subject<boolean> = new Subject();

  sociograms = this.sociogramSubject.asObservable();

  sociogramsTypesAnswer: IanswerTypes | null = null; // TODO mapping de enum en cliente

  // TODO mapping de columnas para tablas
  columns: IColumn[] = [
    {
      key: 'title',
      label: 'Sociograma',
    },
    {
      key: 'version',
      label: 'Versión',
    },
    {
      key: 'questionsCount',
      label: 'Preguntas',
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

  selectedSociogramId: number | null = null;
  selectedSociogramName: string | null = null;
  deleteModalVisible = false;

  constructor(
    private sociogramService: sociogramManager,
    private router: Router,
    private authService: AuthManager
  ) {}

  ngOnInit(): void {
    this.loadResources();
    this.loadData();
  }

  toggleDetails(id: number) {
    this.details_visible[id] = !this.details_visible[id];
  }

  onCreate() {
    this.router.navigate(['/sociograms/store']);
  }

  onLoadReport(id: number) {
    this.router.navigate(['/sociograms/report'], {
      queryParams: {
        id,
      },
    });
  }

  onUpdate(id: number) {
    this.router.navigate(['/sociograms/update'], {
      queryParams: {
        id,
      },
    });
  }

  onCopy(id: number) {
    this.router.navigate(['/sociograms/store'], {
      queryParams: {
        duplicate: id,
      },
    });
  }

  onAssingCourses(sociogram: number) {
    this.router.navigate(['/sociograms/courses'], {
      queryParams: {
        sociogram,
      },
    });
  }

  onAssingInstitutions(sociogram: number) {
    this.router.navigate(['/sociograms/institutions'], {
      queryParams: {
        sociogram,
      },
    });
  }

  openDeleteModal(id: number, name: string) {
    this.selectedSociogramId = id;
    this.selectedSociogramName = name;
    this.deleteModalVisible = true;
  }

  resetModal() {
    this.selectedSociogramId = null;
    this.selectedSociogramName = null;
    this.deleteModalVisible = false;
  }

  validateRegisterNewSociogram() {
    const institution_selected = this.authService.InstitutionSelected();
    return (
      institution_selected === 0 &&
      this.authService.UserSessionData()?.role === UserRole.SuperAdministrator
    );
  }

  get isSuperAdmin() {
    return (
      this.authService.UserSessionData()?.role === UserRole.SuperAdministrator
    );
  }
  get isAdmin() {
    return this.authService.UserSessionData()?.role === UserRole.Administrator;
  }

  get isTeacher() {
    return this.authService.UserSessionData()?.role === UserRole.Teacher;
  }

  async onConfirmDelete() {
    if (this.selectedSociogramId !== null) {
      (
        await this.sociogramService.deleteSociogram(this.selectedSociogramId)
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
      this.loadSociogramsByInstitutionID();
    } else if (this.authService.InstitutionSelected() !== 0) {
      this.loadSociograms();
    }
  }

  private async loadResources() {
    const responseAnswer = await firstValueFrom(
      this.sociogramService.getTypeAnswers()
    );
    this.sociogramsTypesAnswer = responseAnswer.data;
  }

  private loadSociograms() {
    this.isLoading.next(true);
    this.sociogramService
      .loadSociograms()
      .then((item) => {
        item.subscribe((response) => {
          this.isLoading.next(false);
          this.sociogramSubject.next(response.data ? response.data : []);
        });
      })
      .catch((err) => {
        this.isLoading.next(false);
      });
  }

  private loadSociogramsByInstitutionID() {
    this.isLoading.next(true);
    this.sociogramService
      .loadSociogramsByInstitutionID()
      .then((item) => {
        item.subscribe((response) => {
          this.isLoading.next(false);
          this.sociogramSubject.next(response.data ? response.data : []);
        });
      })
      .catch((err) => {
        this.isLoading.next(false);
      });
  }

  getAnswerLabels(type: keyof IanswerTypes | string): string[] {
    if (!this.sociogramsTypesAnswer) {
      return [];
    }
    if (type === 'StudentsClassmate') {
      return ['Listado de compañeros de por curso'];
    }
    return (
      this.sociogramsTypesAnswer[type as keyof IanswerTypes]?.map(
        (answer) => answer.label
      ) || []
    );
  }
}
