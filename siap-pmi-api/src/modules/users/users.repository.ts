import { Injectable } from '@nestjs/common';
import { SupabaseProvider } from '../../infrastructure/supabase/supabase.module';
import { User, UserId } from './users.types';

type AuthUserRow = {
  id: string;
  email: string | null;
  created_at: string;
  banned_until: string | null;
};

const toDomainUser = (row: AuthUserRow): User => ({
  id: row.id,
  email: row.email ?? '',
  createdAt: new Date(row.created_at),
  isActive: row.banned_until === null,
});

@Injectable()
export class UsersRepository {
  constructor(private readonly supabaseProvider: SupabaseProvider) {}

  async findById(userId: UserId): Promise<User | null> {
    const client = this.supabaseProvider.getClient();
    const { data, error } = await client
      .schema('auth')
      .from('users')
      .select('id,email,created_at,banned_until')
      .eq('id', userId)
      .limit(1)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }
    if (!data) {
      return null;
    }
    return toDomainUser(data as AuthUserRow);
  }

  async findByEmail(email: string): Promise<User | null> {
    const client = this.supabaseProvider.getClient();
    const { data, error } = await client
      .schema('auth')
      .from('users')
      .select('id,email,created_at,banned_until')
      .eq('email', email)
      .limit(1)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }
    if (!data) {
      return null;
    }
    return toDomainUser(data as AuthUserRow);
  }
}
