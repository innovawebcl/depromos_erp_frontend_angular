import { CommonModule, DatePipe, NgStyle } from '@angular/common';
import { Component, LOCALE_ID, OnInit } from '@angular/core';
import { InvestigationState } from '@core-interfaces/global';
import { Iinvestigation } from '@core-ports/outputs/investigation';
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
  ProgressComponent,
} from '@coreui/angular-pro';
import { IconComponent } from '@coreui/icons-angular';
import { InvestigationManager } from '@infra-adapters/services/investigation.service';
import { BehaviorSubject, Subject, firstValueFrom } from 'rxjs';
import { TranslateInvestigationStatePipe } from '@infra-adapters/pipe/TranslateInvestigationStatePipe.pipe';
import { Router } from '@angular/router';

@Component({
  selector: 'investigation-list',
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
    TranslateInvestigationStatePipe,
    ProgressComponent,
  ],
  providers: [
    { provide: LOCALE_ID, useValue: 'es' },
    DatePipe,
    TranslateInvestigationStatePipe,
  ],
  templateUrl: './investigation-list.component.html',
  styleUrl: './investigation-list.component.scss',
})
export class InvestigationListComponent implements OnInit {
  private investigationsSubject = new BehaviorSubject<Iinvestigation[]>([]);
  investigations = this.investigationsSubject.asObservable();
  isLoading: Subject<boolean> = new Subject();

  columns: IColumn[] = [
    { key: 'title', label: 'Título' },
    { key: 'created_at', label: 'Fecha de creación' },
    { key: 'state', label: 'Estado' },
    { key: 'administrator', label: 'Administrador' },
    {
      key: 'actions',
      label: '',
      _style: { width: '10%' },
      filter: false,
      sorter: false,
    },
  ];

  constructor(
    private readonly investigationService: InvestigationManager,
    private readonly datePipe: DatePipe,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.loadInvestigations();
  }

  private async loadInvestigations() {
    this.isLoading.next(true);
    const response = await firstValueFrom(
      await this.investigationService.loadInvestigations()
    );
    this.investigationsSubject.next(
      this.mapInvestigations(response.data ?? [])
    );
    this.isLoading.next(false);
  }

  private mapInvestigations(investigations: Iinvestigation[]): any {
    return investigations.map((investigation: Iinvestigation) => {
      return {
        id: investigation.id,
        title: investigation.title,
        description: investigation.description,
        created_at: this.datePipe.transform(
          investigation.created_at,
          "d 'de' MMMM 'de' y"
        ),
        state: investigation.state,
        administrator: investigation.administrator.admin_role, // TODO referencias correctas a nombre de usuario
      };
    });
  }

  getStatePercentage(state: InvestigationState) {
    switch (state) {
      case InvestigationState.Init:
        return 25;
      case InvestigationState.Advanced:
        return 50;
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

  goToInvestigationForm() {
    this.router.navigate(['/investigation', 'new']);
  }

  goToInvestigationDetail(id: number) {
    this.router.navigate(['/investigation', id]);
  }
}
