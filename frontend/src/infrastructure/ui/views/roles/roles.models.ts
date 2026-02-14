export interface ModuleDef {
  key: string;
  name?: string;
}

export interface RoleRow {
  id: number;
  name: string;
  description?: string | null;
  created_at?: string | null;
  modules?: Record<string, boolean> | null;
}

export interface RoleUpsert {
  name: string;
  description?: string | null;
}
