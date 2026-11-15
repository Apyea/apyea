import { PaymentMethod, Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { generateEventRegistrationReference } from "@/lib/events/references";
import { eventIsOpenForRegistration } from "@/lib/events/public";
import {
  validateEventRegistrationInput,
  type EventRegistrationInput,
} from "@/lib/events/validate-registration";
import { queueEmailLog } from "@/lib/membership/workflow";
import { resolveRegistrationFee } from "@/lib/events/fees";

export async function submitEventRegistration(
  input: EventRegistrationInput,
  options: { userId: string; memberId: string },
) {
  const master = await prisma.govWorkInterestOption.findMany({
    select: { id: true, code: true },
  });
  const codeById = (id: string) => master.find((o) => o.id === id)?.code;
  validateEventRegistrationInput(input, { govInterestCodeById: codeById });

  if (!options.memberId) {
    throw new Error("Sign in as an APYEA member to register for programmes");
  }

  const event = await prisma.event.findUnique({ where: { id: input.eventId.trim() } });
  if (!event || !eventIsOpenForRegistration(event)) {
    throw new Error("Event is not open for registration");
  }

  const email = input.email.trim().toLowerCase();
  const duplicate = await prisma.eventRegistration.findFirst({
    where: {
      eventId: event.id,
      email,
      registrationStatus: { notIn: ["REJECTED", "CANCELLED"] },
    },
  });
  if (duplicate) {
    throw new Error("An active registration already exists for this email on this event");
  }

  const memberDup = await prisma.eventRegistration.findFirst({
    where: {
      eventId: event.id,
      memberId: options.memberId,
      registrationStatus: { notIn: ["REJECTED", "CANCELLED"] },
    },
  });
  if (memberDup) {
    throw new Error("You are already registered for this programme");
  }

  const amount = new Prisma.Decimal(input.amountPaid);
  const expectedFee = resolveRegistrationFee(
    {
      defaultFee: event.defaultFee != null ? Number(event.defaultFee) : null,
      memberFee: event.memberFee != null ? Number(event.memberFee) : null,
      nonMemberFee: event.nonMemberFee != null ? Number(event.nonMemberFee) : null,
    },
    true,
  );
  if (expectedFee != null) {
    const paid = Number(amount);
    if (Math.abs(paid - expectedFee) > 0.009) {
      throw new Error(`Registration fee must be ₹${expectedFee.toFixed(2)} for members`);
    }
  }

  const registrationReference = await generateEventRegistrationReference();
  const registration = await prisma.eventRegistration.create({
    data: {
      registrationReference,
      eventId: event.id,
      userId: options.userId,
      memberId: options.memberId,
      fullName: input.fullName.trim(),
      email,
      mobile: input.mobile.trim(),
      addressLine: input.addressLine.trim(),
      paymentReference: input.paymentReference.trim(),
      paymentDate: new Date(input.paymentDate),
      amountPaid: amount,
      paymentMethod: PaymentMethod.ONLINE,
      teacherInterestJson: input.teacherInterest,
    },
  });

  await queueEmailLog(email, "EVENT_REGISTRATION_SUBMITTED", {}, {
    registrationReference,
    eventTitle: event.title,
  });

  return registration;
}