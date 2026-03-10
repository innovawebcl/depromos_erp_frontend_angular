import { Pipe, PipeTransform } from '@angular/core';
import { UserRole } from '@core-interfaces/global';

@Pipe({
  name: 'translateRole',
  standalone: true,
})
export class TranslateRolePipe implements PipeTransform {
  private roleMap: Record<UserRole, string> = {
    [UserRole.Administrator]: 'Administrador',
    [UserRole.SuperAdministrator]: 'Super Administrador',
  };

  transform(value: UserRole): string {
    return this.roleMap[value];
  }
}
