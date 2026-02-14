export interface IinstitutionInput {
  name: string;
  address: string;
  deadline_for_closing_a_complaint: number;
  amount_of_negative_annotations: number;
  logo?: File;
}

export type InstitutionsArgs =
  | 'name'
  | 'address'
  | 'deadline_for_closing_a_complaint'
  | 'amount_of_negative_annotations'
  | 'logo';
  ;
