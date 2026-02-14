import { CommonModule } from '@angular/common';
import { Component, forwardRef } from '@angular/core';
import { FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { DatePickerComponent, FormControlDirective, TimePickerComponent } from '@coreui/angular-pro';
@Component({
  selector: 'date-time-picker',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    FormControlDirective,
    DatePickerComponent,
    TimePickerComponent,
  ],
  templateUrl: './date-time-picker.component.html',
  styleUrl: './date-time-picker.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DateTimePickerComponent),
      multi: true
    }
  ]
})
export class DateTimePickerComponent {
  date: Date | null = null;
  time: Date | null = null;

  onChange: any = (value: Date | null) => {};
  onTouched: any = () => {};

  writeValue(value: Date | null) {
    if (value) {
      this.date = value;
      this.time = value;
    } else {
      this.date = null;
      this.time = null;
    }
  }

  registerOnChange(fn: (value: Date | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  onDateChange(date: Date) {
    this.date = date;
    this.updateDateTime();
  }

  onTimeChange(time: Date) {
    this.time = time;
    this.updateDateTime();
  }

  private updateDateTime() {
    if (this.date && this.time) {
      const timeDate = new Date(this.time);
      const [hours, minutes] = [timeDate.getHours(), timeDate.getMinutes()];
      const newDate = new Date(this.date);
      newDate.setHours(hours, minutes);
      this.onChange(newDate);
    } else {
      this.onChange(null);
    }
  }
}
