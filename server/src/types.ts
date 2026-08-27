export type OrgType = "school" | "travel" | "fleet" | "other";
export type Designation = "transport_admin" | "fleet_manager" | "owner" | "driver";
export type UserRole = "admin" | "driver";

export type Organization = {
  id: string;
  name: string;
  type: OrgType;
  created_at: string;
};

export type User = {
  id: string;
  org_id: string;
  full_name: string;
  email: string;
  mobile: string;
  designation: Designation;
  password_hash: string;
  role: UserRole;
  email_verified: boolean;
  verification_token: string | null;
  verification_expires_at: string | null;
  created_at: string;
};

export type Driver = {
  id: string;
  org_id: string;
  name: string;
  license: string;
  phone: string;
  created_at: string;
};

export type Bus = {
  id: string;
  org_id: string;
  code: string;
  plate: string;
  capacity: number;
  created_at: string;
};
