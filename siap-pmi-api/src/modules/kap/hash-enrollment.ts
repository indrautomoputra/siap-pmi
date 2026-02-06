import { createHmac } from 'crypto';

export const hashEnrollment = (
  enrollmentId: string,
  eventId: string,
  secretSalt: string,
): string => {
  if (!secretSalt) {
    throw new Error('KAP_HASH_SALT is required');
  }
  return createHmac('sha256', secretSalt)
    .update(`${enrollmentId}:${eventId}`)
    .digest('hex');
};
