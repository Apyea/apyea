export function resolveRegistrationFee(
  event: {
    defaultFee?: number | null;
    memberFee?: number | null;
    nonMemberFee?: number | null;
  },
  isMember: boolean,
): number | null {
  if (isMember && event.memberFee != null) return event.memberFee;
  if (!isMember && event.nonMemberFee != null) return event.nonMemberFee;
  return event.defaultFee ?? null;
}