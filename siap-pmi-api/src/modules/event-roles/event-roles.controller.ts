import { Controller } from '@nestjs/common';
import { EventRolesService } from './event-roles.service';

@Controller('event-roles')
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
