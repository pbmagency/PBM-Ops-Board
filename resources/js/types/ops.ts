export type RoleId =
  | "coo"
  | "project-manager"
  | "developer"
  | "creative"
  | "digital-marketer"
  | "cmo"
  | "marketing-manager"
  | "content-specialist"
  | "appointment-setter";

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: RoleId;
}

export interface OpsUser extends AuthUser {
  active: boolean;
}

export interface OperationsPayload {
  clients: unknown[];
  tasks: unknown[];
  cycles: unknown[];
  feedback: unknown[];
}

export interface TeamPayload {
  definitions: unknown[];
  reports: unknown[];
}

export interface PbmOpsPageProps {
  [key: string]: unknown;
  auth: { user: AuthUser | null };
  users: OpsUser[];
  operations: OperationsPayload;
  team: TeamPayload;
  flash: { success?: string };
}
