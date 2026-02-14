export enum UserRole {
  Student = 'Student',
  Teacher = 'Teacher',
  Administrator = 'Administrator',
  SuperAdministrator = 'SuperAdministrator',
}

export enum TeacherRole {
  HeadTeacher = 'HeadTeacher',
  ClassTeacher = 'ClassTeacher',
  Substitute = 'Substitute',
}

export enum Kinship {
  Father = 'father',
  Mother = 'mother',
  Grandparent = 'grandparent',
  Uncle = 'uncle',
  Aunt = 'aunt',
  Other = 'other',
}

export enum AnnotationLevel {
  Remedial = 'remedial',
  Positive = 'positive',
  Low = 'low',
  Severe = 'severe',
  VerySevere = 'very_severe',
  RemedialGeneral = 'remedial_general',
  PositiveGeneral = 'positive_general',
  NegativeGeneral = 'negative_general',
}

export enum RoleInComplaint {
  Witness = 'witness',
  Victim = 'victim',
}

export enum RoleInComplaintFull {
  Witness = 'witness',
  Victim = 'victim',
  Accused = 'accused',
  Accomplice = 'accomplice',
}

export enum InvestigationState {
  Init = 'init',
  Advanced = 'advanced',
  Finalized = 'finalized',
}

export enum AdministratorRole {
  SchoolAdmin = 'school_admin',
  SchoolSupervisor = 'school_supervisor',
}

// case Init = 'init';
// case Advanced = 'advanced';
// case Finalized = 'finalized';

export enum StorageKeys {
  session_token = 'session-token',
  institution_id = 'institution_id',
}

export type serverError = { status: number; data: null; message: string };

export type ErrorMessage = { [key: string]: { [errorKey: string]: string } };

export type StringOrNull = string | null;
export type NumberOrNull = number | null;
export type DateOrNull = Date | null;
export type BoolOrNull = boolean | null;

export interface IApiResponse<T> {
  loginLogs: never[];
  data: null | T;
  status: number;
  message: string;
}

export interface IDroppedFile {
  file: File;
  filename: string;
}
export interface Ioption {
  value: string;
  label: string;
}

export enum exceptionType {
  institutionIDForSA = 'ID de institución no encontrado en los claims JWT.', //* se usa para cuando el superadministrador no tiene el id de la institución seteado en session storage
}
