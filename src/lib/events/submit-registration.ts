import { PaymentMethod, Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { generateEventRegistrationReference } from "@/lib/events/references";
import { eventIsOpenForRegistration } from "@/lib/events/public";
import {
  validateEventRegistrationInput,
  type EventRegistrationInput,
} from "@/lib/events/validate-registration";
import { queueEmailLog } from "@/lib/membership/workflow";

export async function submitEventRegistration(
  input: EventRegistrationInput,
  options?: { userId?: string; memberId?: string },
) {
  validateEventRegistrationInput(input);

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

  if (options?.memberId) {
    const memberDup = await prisma.eventRegistration.findFirst({
      where: {
        eventId: event.id,
        memberId: options.memberId,
        registrationStatus: { notIn: ["REJECTED", "CANCELLED"] },
      },
    });
    if (memberDup) {
      throw new Error("You are already registered for this event");
    }
  }

  const amount = new Prisma.Decimal(input.amountPaid);
  if (event.defaultFee != null) {
    const expected = Number(event.defaultFee);
    const paid = Number(amount);
    if (Math.abs(paid - expected) > 0.009) {
      throw new Error(`Registration fee must be ₹${expected.toFixed(2)} for this event`);
    }
  }

  const registrationReference = await generateEventRegistrationReference();
  const registration = await prisma.eventRegistration.create({
    data: {
      registrationReference,
      eventId: event.id,
      userId: options?.userId ?? null,
      memberId: options?.memberId ?? null,
      fullName: input.fullName.trim(),
      email,
      mobile: input.mobile.trim(),
      addressLine: input.addressLine.trim(),
      paymentReference: input.paymentReference.trim(),
      paymentDate: new Date(input.paymentDate),
      amountPaid: amount,
      paymentMethod: PaymentMethod.ONLINE,
    },
  });

  await queueEmailLog(email, "EVENT_REGISTRATION_SUBMITTED", {}, {
    registrationReference,
    eventTitle: event.title,
  });

  return registration;
}