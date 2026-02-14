import { Pipe, PipeTransform } from '@angular/core';
import { TeacherRole } from '@core-interfaces/global';

@Pipe({
  name: 'translateTeacherRole',
  standalone: true, // Para usarlo en un componente standalone
})
export class TranslateTeacherRolePipe implements PipeTransform {
  transform(value: TeacherRole): string {
    const translations: Record<TeacherRole, string> = {
      [TeacherRole.HeadTeacher]: 'Profesor Jefe',
      [TeacherRole.ClassTeacher]: 'Profesor',
      [TeacherRole.Substitute]: 'Profesor Jefe Sustituto',
    };

    return translations[value] || value;
  }
}
