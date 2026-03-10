export interface PaginationMeta {
  current_page: number;
  last_page: number;
  total: number;
  per_page?: number;
}

export interface Paginated<T> {
  data: T[];
  meta?: PaginationMeta;
}

export interface RoleSummary {
  id: number;
  name: string;
}

export interface UserRow {
  id: number;
  name: string;
  first_name?: string | null;
  last_name?: string | null;
  username: string;
  email: string;
  active: boolean;
  role_id: number | null;
  role?: RoleSummary | null;
  first_login?: boolean;
  created_at?: string | null;
}

export interface UserDetail extends UserRow {
  // future-proof
}

export interface UserUpsert {
  name: string;
  first_name?: string | null;
  last_name?: string | null;
  username: string;
  email: string;
  password?: string | null;
  role_id: number | null;
  active?: boolean;
}
