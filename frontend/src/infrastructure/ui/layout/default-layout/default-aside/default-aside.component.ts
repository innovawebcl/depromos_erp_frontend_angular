import { AfterViewInit, Component, ElementRef, Renderer2 } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { IconDirective } from '@coreui/icons-angular';
import { RouterLink } from '@angular/router';
import {
  AvatarComponent,
  BorderDirective,
  ButtonCloseDirective,
  FormCheckComponent,
  FormCheckInputDirective,
  FormCheckLabelDirective,
  ListGroupDirective,
  ListGroupItemDirective,
  NavComponent,
  NavItemComponent,
  NavLinkDirective,
  ProgressBarDirective,
  ProgressComponent,
  SidebarComponent,
  SidebarHeaderComponent,
  SidebarToggleDirective,
  TabContentComponent,
  TabContentRefDirective,
  TabPaneComponent,
  TextColorDirective,
  ThemeDirective
} from '@coreui/angular-pro';

@Component({
  selector: 'app-default-aside',
  templateUrl: './default-aside.component.html',
  styleUrls: ['./default-aside.component.scss'],
  standalone: true,
  imports: [SidebarComponent, SidebarHeaderComponent, NavComponent, NavItemComponent, NavLinkDirective, TabContentRefDirective, RouterLink, IconDirective, ThemeDirective, ButtonCloseDirective, SidebarToggleDirective, TabContentComponent, TabPaneComponent, NgTemplateOutlet, ListGroupDirective, ListGroupItemDirective, BorderDirective, TextColorDirective, AvatarComponent, FormCheckComponent, FormCheckInputDirective, FormCheckLabelDirective, ProgressBarDirective, ProgressComponent]
})
export class DefaultAsideComponent implements AfterViewInit {
  constructor(
    private renderer: Renderer2,
    private elementRef: ElementRef
  ) {}

  public messages = new Array(5);

  ngAfterViewInit(): void {
    this.renderer.removeStyle(this.elementRef.nativeElement, 'display');
  }
}
