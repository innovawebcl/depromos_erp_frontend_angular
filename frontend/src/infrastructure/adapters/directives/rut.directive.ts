import { Directive, HostListener, ElementRef } from '@angular/core';
import { NgControl } from '@angular/forms';
import { RutPipe } from '@infra-adapters/pipe/Rut.pipe';

@Directive({
  selector: '[appRutFormat]',
  standalone: true
})
export class RutDirective {
  constructor(
    private el: ElementRef,
    private control: NgControl,
    private rutPipe: RutPipe
  ) {}

  @HostListener('input', ['$event.target.value'])
  onInput(value: string) {
    this.formatValue(value);
  }

  @HostListener('blur')
  onBlur() {
    this.formatValue(this.control.value);
  }

  private formatValue(value: string) {
    const formatted = this.rutPipe.transform(value);
    this.control.control?.setValue(formatted, { emitEvent: false });
    this.el.nativeElement.value = formatted;
  }
}