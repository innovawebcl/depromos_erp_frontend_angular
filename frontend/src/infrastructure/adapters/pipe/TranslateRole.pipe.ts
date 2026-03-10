import { Pipe, PipeTransform } from '@angular/core';
import { UserRole } from '@core-interfaces/global';

@Pipe({
  name: 'translateRole',
  standalone: true,
})
export class TranslateRolePipe implements PipeTransform {
  private roleMap: Record<UserRole, string> = {
    [UserRole.Admin]: 'Administrador',
  };

  transform(value: UserRole): string {
    return this.roleMap[value] ?? value;
  }
}
