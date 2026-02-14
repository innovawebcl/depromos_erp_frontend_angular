import { RoleInComplaint } from "@core-interfaces/global";

export interface IcomplaintInput {
  description: string;
  where_description: string;
  with_description: string;
  alone: boolean;
  date_event: Date;
  role_in_complaint: RoleInComplaint;
}

export type ComplaintArgs =
  | 'description'
  | 'where_description'
  | 'with_description'
  | 'alone'
  | 'date_event'
  | 'role_in_complaint';
