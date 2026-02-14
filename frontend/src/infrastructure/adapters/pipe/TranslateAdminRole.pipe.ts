import { Pipe, PipeTransform } from '@angular/core';
import { AdministratorRole } from '@core-interfaces/global';

@Pipe({
  name: 'translateAdminRole',
  standalone: true,
})
export class TranslateAdminRolePipe implements PipeTransform {
  private roleMap: Record<AdministratorRole, string> = {
    [AdministratorRole.SchoolAdmin]: 'Administrador',
    [AdministratorRole.SchoolSupervisor]: 'Inspector',
  };

  transform(value: AdministratorRole): string {
    return this.roleMap[value];
  }
}
