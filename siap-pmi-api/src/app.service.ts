import { Injectable } from '@nestjs/common';
import { SupabasePublicProvider } from './infrastructure/supabase/supabase.module';

@Injectable()
export class AppService {
  constructor(private readonly supabaseProvider: SupabasePublicProvider) {}

  getHello(): string {
    return 'Hello World!';
  }

  async getHealth(): Promise<{
    status: string;
    db: string;
    auth: string;
  }> {
    const [db, auth] = await Promise.all([
      this.checkDatabase(),
      this.checkAuth(),
    ]);
    const status = db === 'ok' && auth === 'ok' ? 'ok' : 'degraded';
    return { status, db, auth };
  }

  private async checkDatabase(): Promise<'ok' | 'error'> {
    try {
      const client = this.supabaseProvider.getClient();
      const { error } = await client.from('events').select('id').limit(1);
      if (error) {
        return 'error';
      }
      return 'ok';
    } catch {
      return 'error';
    }
  }

  private async checkAuth(): Promise<'ok' | 'error'> {
    try {
      const url = process.env.SUPABASE_URL ?? '';
      if (!url) {
        return 'error';
      }
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 2000);
      const response = await fetch(
        `${url.replace(/\/+$/, '')}/auth/v1/health`,
        { signal: controller.signal },
      );
      clearTimeout(timeout);
      if (!response.ok) {
        return 'error';
      }
      await response.text();
      return 'ok';
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return 'error';
      }
      return 'error';
    }
  }
}
