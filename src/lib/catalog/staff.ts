export const OWNER_EMAIL = "zuvaan.dhanduveriyaa@gmail.com";
export const DEPUTY_EMAIL = "mmxinthi@gmail.com";

export type StaffRole = "owner" | "admin";

export type StaffMember = {
  email: string;
  role: StaffRole;
  active: boolean;
};

export function normEmail(value: string) {
  return value.trim().toLowerCase();
}

export function isOwnerEmail(email: string) {
  return normEmail(email) === OWNER_EMAIL;
}

export function isListedStaffEmail(email: string) {
  const e = normEmail(email);
  return e === OWNER_EMAIL || e === DEPUTY_EMAIL;
}
