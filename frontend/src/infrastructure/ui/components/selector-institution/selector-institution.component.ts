import { CommonModule, NgStyle } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';

import {
  FormDirective,
  InputGroupComponent,
  InputGroupTextDirective,
  SpinnerComponent,
  TextColorDirective,
  FormControlDirective,
  ContainerComponent,
  FormSelectDirective,
} from '@coreui/angular-pro';

import { InstitutionManager } from '@infra-adapters/services/institution.service';
import type { Iinstitution } from '@core-ports/outputs/institution';

import { BehaviorSubject } from 'rxjs';
import { AuthManager } from '@infra-adapters/services/auth.service';
import { UserRole } from '@core-interfaces/global';
import { ActivatedRoute } from '@angular/router';

interface institutionForm {
  institution_id: FormControl<number | null>;
}

@Component({
  selector: 'selector-institution',
  standalone: true,
  imports: [
    NgStyle,
    ReactiveFormsModule,
    FormsModule,
    CommonModule,

    InputGroupComponent,
    InputGroupTextDirective,
    SpinnerComponent,

    FormDirective,
    TextColorDirective,
    FormControlDirective,
    ContainerComponent,
    FormSelectDirective,
  ],
  templateUrl: './selector-institution.component.html',
  styleUrl: './selector-institution.component.scss',
})
export class SelectorInstitutionComponent implements OnInit {
  @Output() institutionChange = new EventEmitter<Iinstitution | null>();

  form: FormGroup<institutionForm> = new FormGroup<institutionForm>({
    institution_id: new FormControl<number | null>(null),
  });

  private institutionSubject = new BehaviorSubject<Iinstitution[]>([]);
  institutions = this.institutionSubject.asObservable();

  constructor(
    private institutionService: InstitutionManager,
    private authService: AuthManager,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadInstitutions();
    if (this.isSuperAdministrator()) {
      this.setCurrentInstitution();
      this.listenToInstitutionChanges();
    }
  }

  isSuperAdministrator() {
    return (
      this.authService.UserSessionData()?.role === UserRole.SuperAdministrator
    );
  }

  private setCurrentInstitution() {
    const institutions = this.route.snapshot.data[
      'institutions'
    ] as Iinstitution[];
    const institution_id = this.authService.InstitutionSelected();
    let selected_institution_id = institution_id;
    if (!selected_institution_id) {
      this.authService.setInstitution(Number(institutions[0].id));
      selected_institution_id = Number(institutions[0].id);
    }
    this.form.setValue({
      institution_id: selected_institution_id,
    });
  }

  private async loadInstitutions() {
    const institutions = this.route.snapshot.data[
      'institutions'
    ] as Iinstitution[];
    this.institutionSubject.next(institutions ?? []);
    const institution_id = this.authService.UserSessionData()?.institution_id;
    if (institution_id && institutions) {
      const institution_found = institutions.find(
        (institution) => Number(institution.id) === Number(institution_id)
      );
      this.institutionChange.emit(institution_found ?? null);
    }
  }

  private listenToInstitutionChanges() {
    this.form.get('institution_id')?.valueChanges.subscribe((value) => {
      if (value === null) {
        this.authService.cleanInstitution();
      } else {
        this.authService.setInstitution(Number(value));
      }
      window.location.reload();
    });
  }
}
