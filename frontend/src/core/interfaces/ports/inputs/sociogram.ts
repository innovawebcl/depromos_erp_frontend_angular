export interface IquestionInput {
  title: string;
  is_multiple_choice: boolean;
  rules: string;
  enum_as_options: string;
}

export interface IsociogramInput {
  title: string;
  version: number;
  questions: IquestionInput[];
}

export interface IcoursesToSociogramInput {
  sociogram_id: number;
  courses: number[];
}

export interface IinstitutionsToSociogramInput {
  sociogram_id: number;
  institutions: number[];
}

export type sociogramArgs = 'title' | 'version' | 'questions';

export type questionArgs =
  | 'title'
  | 'is_multiple_choice'
  | 'rules'
  | 'enum_as_options';

export type coursesToSociogramArgs = 'sociogram_id' | 'courses';
export type institutionsToSociogramArgs = 'sociogram_id' | 'institutions';
