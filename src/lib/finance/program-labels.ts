import type { ProgramCategory } from "@prisma/client";

export const PROGRAM_CATEGORY_LABELS: Record<ProgramCategory, string> = {
  TRAINING_PROGRAMME: "Training programme",
  WORKSHOP: "Workshop",
  SEMINAR: "Seminar",
  CONFERENCE: "Conference",
  OTHER: "Other",
};