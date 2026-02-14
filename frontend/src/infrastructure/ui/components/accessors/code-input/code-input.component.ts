import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  forwardRef,
  OnInit,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-code-input',
  templateUrl: './code-input.component.html',
  styleUrls: ['./code-input.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CodeInputComponent),
      multi: true,
    },
  ],
  standalone: true,
  imports: [CommonModule],
})
export class CodeInputComponent implements ControlValueAccessor, AfterViewInit {
  code: string[] = new Array(6).fill('');
  @ViewChildren('inputRef') inputRefs!: QueryList<ElementRef<HTMLInputElement>>;
  onChange: (value: string) => void = () => {};
  onTouched: () => void = () => {};

  ngAfterViewInit() {}

  writeValue(value: string): void {
    if (value) {
      this.code = value.split('').slice(0, 6);
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  onInput(index: number, event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const value = inputElement.value.toUpperCase();

    if (/^[A-Z0-9]$/.test(value)) {
      this.code[index] = value;
      if (index < 5) {
        this.inputRefs.get(index + 1)?.nativeElement.focus();
      }
    } else {
      this.code[index] = '';
      inputElement.value = '';
    }

    this.onChange(this.code.join(''));
  }

  onKeyDown(index: number, event: KeyboardEvent) {
    if (event.key === 'Backspace' && !this.code[index] && index > 0) {
      this.inputRefs.get(index - 1)?.nativeElement.focus();
    }
  }

  setDisabledState?(isDisabled: boolean): void {
    if (!this.inputRefs) {
      return;
    }
    this.inputRefs.forEach(
      (input) => (input.nativeElement.disabled = isDisabled)
    );
  }

  trackByIndex(index: number, item: any): number {
    return index;
  }
}
