import type { TeamMemberDesignation } from "@prisma/client";

export type TeamDesignationValue = TeamMemberDesignation;

export type TeamDesignationOption = {
  value: TeamDesignationValue;
  label: string;
};

/** Designation — fixed dropdown (no database table). */
export const TEAM_DESIGNATION_OPTIONS: TeamDesignationOption[] = [
  { value: "PRESIDENT", label: "President" },
  { value: "VICE_PRESIDENT", label: "Vice President" },
  { value: "SECRETARY", label: "Secretary" },
  { value: "TREASURER", label: "Treasurer" },
  { value: "EXECUTIVE_MEMBER", label: "Executive Committee member" },
  { value: "ADVISORY_MEMBER", label: "Advisory Committee member" },
  { value: "DISTRICT_COORDINATOR", label: "District Coordinator" },
  { value: "UNIT_COORDINATOR", label: "Unit Coordinator" },
  { value: "MEMBER", label: "Team member" },
];

const DESIGNATION_SET = new Set(TEAM_DESIGNATION_OPTIONS.map((o) => o.value));

export function teamDesignationLabel(value: TeamDesignationValue) {
  return TEAM_DESIGNATION_OPTIONS.find((o) => o.value === value)?.label ?? value.replace(/_/g, " ");
}

export function parseTeamMemberDesignation(raw: string): TeamMemberDesignation | null {
  const v = raw.trim().toUpperCase();
  return DESIGNATION_SET.has(v as TeamDesignationValue) ? (v as TeamMemberDesignation) : null;
}