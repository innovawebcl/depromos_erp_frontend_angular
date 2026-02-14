import { CommonModule, NgStyle } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Iinstitution } from '@core-ports/outputs/institution';
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
import { InstitutionManager } from '@infra-adapters/services/institution.service';
import { BehaviorSubject, Subject } from 'rxjs';
import { Router } from '@angular/router';
import { IconComponent } from '@coreui/icons-angular';

@Component({
  selector: 'list-institution',
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
  templateUrl: './list-institution.component.html',
  styleUrl: './list-institution.component.scss',
})
export class ListInstitutionComponent implements OnInit {
  private institutionSubject = new BehaviorSubject<Iinstitution[]>([]);
  isLoading: Subject<boolean> = new Subject();

  institutions = this.institutionSubject.asObservable();

  columns: IColumn[] = [
    {
      key: 'name',
      label: 'Institución',
    },
    {
      key: 'address',
      label: 'Dirección',
    },
    {
      key: 'deadline_for_closing_a_complaint',
      label: 'Días de límite para cerrar una reclamación',
    },
    {
      key: 'amount_of_negative_annotations',
      label: 'Cantidad de anotaciones negativas',
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

  selectedInstitutionId: number | null = null;
  selectedInstitutionName: string | null = null;
  deleteModalVisible = false;

  constructor(
    private institutionService: InstitutionManager,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  toggleDetails(item: any) {
    this.details_visible[item] = !this.details_visible[item];
  }

  private loadData() {
    this.isLoading.next(true);
    this.institutionService
      .loadInstitutions()
      .then((item) => {
        item.subscribe((response) => {
          this.isLoading.next(false);
          if (response.data) {
            this.institutionSubject.next(response.data); // Asegúrate de enviar un array
          } else {
            this.institutionSubject.next([]); // Si no hay datos, envía un array vacío
          }
        });
      })
      .catch((err) => {
        console.error(err);
        this.isLoading.next(false);
      });
  }

  onCreate() {
    this.router.navigate(['/institutions/store']);
  }

  onUpdate(id: number) {
    this.router.navigate(['/institutions/update'], {
      queryParams: {
        id,
      },
    });
  }

  openDeleteModal(id: number, name: string) {
    this.selectedInstitutionId = id;
    this.selectedInstitutionName = name;
    this.deleteModalVisible = true;
  }

  resetModal() {
    this.selectedInstitutionId = null;
    this.selectedInstitutionName = null;
    this.deleteModalVisible = false;
  }

  async onConfirmDelete() {
    if (this.selectedInstitutionId !== null) {
      (
        await this.institutionService.deleteInstitution(
          this.selectedInstitutionId
        )
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
}
