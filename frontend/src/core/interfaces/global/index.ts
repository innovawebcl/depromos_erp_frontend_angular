export enum UserRole {
  Administrator = 'Administrator',
  SuperAdministrator = 'SuperAdministrator',
}

export enum StorageKeys {
  session_token = 'session-token',
}

export type serverError = { status: number; data: null; message: string };

export type ErrorMessage = { [key: string]: { [errorKey: string]: string } };

export type StringOrNull = string | null;
export type NumberOrNull = number | null;
export type DateOrNull = Date | null;
export type BoolOrNull = boolean | null;

export interface IApiResponse<T> {
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
