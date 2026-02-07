import { Injectable } from '@nestjs/common';
import { SupabaseProvider } from '../../infrastructure/supabase/supabase.module';

@Injectable()
export class AuditService {
  constructor(private readonly supabaseProvider: SupabaseProvider) {}

  async log(
    eventId: string,
    actorUserId: string,
    action: string,
    entityType: string,
    entityId: string,
    metadata?: Record<string, unknown>,
  ): Promise<void> {
    const client = this.supabaseProvider.getClient();
    const payload = {
      event_id: eventId,
      actor_user_id: actorUserId,
      action,
      entity_type: entityType,
      entity_id: entityId,
      metadata: metadata ?? null,
    };
    const { error } = await client
      .from('audit_logs')
      .insert(payload)
      .select('id')
      .single();
    if (error) {
      throw new Error(error.message ?? 'Failed to write audit log');
    }
  }
}
