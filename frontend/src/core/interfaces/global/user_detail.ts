export interface IuserDetail {
  id: number;
  email: string;
  first_name: string;
  second_name?: string;
  last_name: string;
  second_last_name?: string;
  rut: string;
  birth_date: Date;
}
