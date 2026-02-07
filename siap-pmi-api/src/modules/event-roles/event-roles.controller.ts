import { Controller, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../infrastructure/auth/auth.guard';
import { EventContextGuard } from '../../core/event-context/event-context.guard';
import { EventRolesService } from './event-roles.service';

@Controller('event-roles')
@UseGuards(AuthGuard, EventContextGuard)
export class EventRolesController {
  constructor(private readonly eventRolesService: EventRolesService) {}

  assignRoleToEvent(): void {
    void this.eventRolesService.assignRoleToEvent();
  }

  revokeRoleFromEvent(): void {
    this.eventRolesService.revokeRoleFromEvent();
  }

  listEventRoles(): void {
    this.eventRolesService.listEventRoles();
  }
}
