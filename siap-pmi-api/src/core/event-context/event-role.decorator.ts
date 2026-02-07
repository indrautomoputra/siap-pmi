import { SetMetadata } from '@nestjs/common';
import type { EventRoleType } from '../../modules/event-roles/event-roles.types';

export const EVENT_ROLE_METADATA_KEY = 'event_roles';

export const EventRole = (...roles: EventRoleType[]) =>
  SetMetadata(EVENT_ROLE_METADATA_KEY, roles);
