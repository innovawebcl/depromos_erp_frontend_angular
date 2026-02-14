import { CommonModule, NgStyle } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IInstitutionAnnotationLevel } from '@core-ports/outputs/annotationLevel';
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
import { IconComponent, IconDirective } from '@coreui/icons-angular';
import { TranslateAnnotationLevelPipe } from '@infra-adapters/pipe/TranslateAnnotationLevel.pipe';
import { InstitutionManager } from '@infra-adapters/services/institution.service';
import { BehaviorSubject, firstValueFrom } from 'rxjs';


@Component({
  selector: 'annotation-level-config',
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
    TranslateAnnotationLevelPipe
  ],
  templateUrl: './annotation-level-config.component.html',
  styleUrl: './annotation-level-config.component.scss'
})
export class AnnotationLevelConfigComponent implements OnInit {

  private annotationLevelSubject = new BehaviorSubject<IInstitutionAnnotationLevel[]>([]);
  annotationLevels$ = this.annotationLevelSubject.asObservable();
  isLoading: BehaviorSubject<boolean> = new BehaviorSubject(false);

  columns: IColumn[] = [
    {
      key: 'annotation_level',
      label: 'Tipo de anotación',
    },
    {
      key: 'custom_label',
      label: 'Etiqueta personalizada',
    },
    {
      key: 'actions',
      label: '',
      _style: { width: '5%' },
      filter: false,
      sorter: false,
    },
  ];

  selectedAnnotationLevel: IInstitutionAnnotationLevel | null = null;
  deleteModalVisible = false;

  constructor(
    private institutionManager: InstitutionManager,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadAnnotationLevels();
  }

  onCreate() {
    this.router.navigate(['/institutions/annotation-levels/store']);
  }

  
  subcategories(id: number) {
    this.router.navigate(['/institutions/annotation-level/subcategories/update'], {
      queryParams: {
        id,
      },
    });
  }

  onUpdate(id: number) {
    this.router.navigate(['/institutions/annotation-levels/update'], {
      queryParams: {
        id,
      },
    });
  }

  openDeleteModal(item: IInstitutionAnnotationLevel) {
    this.selectedAnnotationLevel = item;
    this.deleteModalVisible = true;
  }

  resetModal() {
    this.selectedAnnotationLevel = null;
    this.deleteModalVisible = false;
  }



  private async loadAnnotationLevels() {
    this.isLoading.next(true);
    const response = await firstValueFrom(
      await this.institutionManager.loadAnnotationLevels()
    );
    if (response.data) {
      this.annotationLevelSubject.next(response.data);
    } else {
      this.annotationLevelSubject.next([]);
    }
    this.isLoading.next(false);
  }

  async onConfirmDelete() {
    if (this.selectedAnnotationLevel) {
      this.isLoading.next(true);
      await firstValueFrom(
        await this.institutionManager.deleteAnnotationLevel(
          this.selectedAnnotationLevel.id
        )
      );
      this.loadAnnotationLevels();
      this.resetModal();
    }
  }
}
