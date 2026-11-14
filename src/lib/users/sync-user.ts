import { prisma } from "@/lib/db";
import type { UserRole } from "@prisma/client";

export async function syncUserFromCognito(input: {
  cognitoSub: string;
  email: string;
  name?: string | null;
  role?: UserRole;
}) {
  return prisma.user.upsert({
    where: { cognitoSub: input.cognitoSub },
    create: {
      cognitoSub: input.cognitoSub,
      email: input.email,
      name: input.name ?? null,
      role: input.role ?? "USER",
    },
    update: {
      email: input.email,
      ...(input.name !== undefined ? { name: input.name } : {}),
    },
  });
}
