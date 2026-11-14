export const MASTER_RESOURCES = [
  "genders",
  "nationalities",
  "states",
  "districts",
  "mandals",
  "yoga-qualification-levels",
  "yoga-professional-types",
  "employment-statuses",
  "gov-work-interest-options",
  "volunteer-responses",
  "lecture-languages",
  "employment-preference-types",
  "professional-challenge-types",
] as const;

export type MasterResource = (typeof MASTER_RESOURCES)[number];

export function isMasterResource(value: string): value is MasterResource {
  return (MASTER_RESOURCES as readonly string[]).includes(value);
}
