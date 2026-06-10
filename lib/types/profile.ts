import type { UserRole } from "../auth-roles";

export type Profile = {
  id: string;
  role: UserRole;
  full_name: string | null;
  phone: string | null;
  telegram: string | null;
  doctor_id: string | null;
  created_at: string;
};
