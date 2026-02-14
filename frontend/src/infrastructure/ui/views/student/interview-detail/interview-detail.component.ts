import { CommonModule, NgStyle } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { Iinterview } from '@core-ports/outputs/interview';
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
  GutterDirective,
  AlertComponent,
  BorderDirective,
  ToastComponent,
  ToastBodyComponent,
  ToastHeaderComponent,
  ToastCloseDirective,
  ToasterComponent,
  TableDirective,
  ColorModeService,
} from '@coreui/angular-pro';
import { IconComponent } from '@coreui/icons-angular';
import { CustomDatePipe } from '@infra-adapters/pipe/CustomDate.pipe';
import { SafeHtmlPipe } from '@infra-adapters/pipe/SafeHtml.pipe';
import { studentManager } from '@infra-adapters/services/student.service';
import { BehaviorSubject, firstValueFrom } from 'rxjs';

@Component({
  selector: 'interview-detail',
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
    GutterDirective,
    AlertComponent,
    BorderDirective,
    ToastComponent,
    ToastBodyComponent,
    ToastHeaderComponent,
    ToastCloseDirective,
    ToasterComponent,

    TableDirective,
    CustomDatePipe,
    SafeHtmlPipe
  ],
  templateUrl: './interview-detail.component.html',
  styleUrl: './interview-detail.component.scss'
})
export class InterviewDetailComponent implements OnInit {
  interview_id: number | null = null;
  private interviewSubject: BehaviorSubject<Iinterview | null> = new BehaviorSubject<Iinterview | null>(null);
  interview$ = this.interviewSubject.asObservable();

  loading$ = new BehaviorSubject<boolean>(false);

  constructor(
    private readonly route: ActivatedRoute,
    private readonly studentService: studentManager,
    private readonly domSanitizer: DomSanitizer,
  ) {}

  ngOnInit(): void {
    this.interview_id = parseInt(this.route.snapshot.params['id']);
    if (this.interview_id) {
      this.loadInterview(this.interview_id);
    }
  }


  private async loadInterview(id: number) {
    this.loading$.next(true);
    const interview = await firstValueFrom(
      await this.studentService.loadInterviewById(id)
    );
    this.interviewSubject.next(interview.data);
    this.loading$.next(false);
  }

  sanitizeHtml(html: string) {
    return this.domSanitizer.bypassSecurityTrustHtml(html);
  }
}
