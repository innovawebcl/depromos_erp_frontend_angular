import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { ButtonDirective, TooltipDirective } from '@coreui/angular-pro';
import { IconComponent } from '@coreui/icons-angular';

@Component({
  selector: 'image-input',
  standalone: true,
  imports: [
    CommonModule,
    ButtonDirective,
    IconComponent,
    TooltipDirective,
  ],
  templateUrl: './image-input.component.html',
  styleUrl: './image-input.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ImageInputComponent),
      multi: true,
    },
  ],
})
export class ImageInputComponent {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  file: File | null = null;
  preview: string | null = null;
  onChange: (value: File | string | null) => void = () => {};
  onTouched: () => void = () => {};

  writeValue(value: File | string | null): void {
    if (typeof value === 'string') {
      this.preview = value;
      this.file = null;
    } else if (value instanceof File) {
      this.preview = URL.createObjectURL(value);
      this.file = value;
    } else {
      this.preview = null;
      this.file = null;
    }
  }

  registerOnChange(fn: (value: File | string | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.[0]) {
      this.file = input.files[0];
      this.preview = URL.createObjectURL(this.file);
      this.onChange(this.file);  // Cambia el valor a File
    }
  }

  clearFile(): void {
    this.file = null;
    this.preview = null;
    this.onChange(null);
  }

  triggerFileInput(): void {
    this.onTouched();
    this.fileInput.nativeElement.click();
  }
}
