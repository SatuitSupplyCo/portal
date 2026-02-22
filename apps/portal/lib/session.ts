import { auth } from '@repo/auth';
import { db } from '@repo/db/client';
import type { SessionUser } from '@/lib/permissions';

export async function getSessionUser(): Promise<SessionUser> {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Not authenticated');

  const dbUser = await db.query.users.findFirst({
    where: (u, { eq }) => eq(u.id, session.user.id),
  });
  if (!dbUser) {
    throw new Error(
      'Your session references a user that no longer exists in the database. Please sign out and sign back in.',
    );
  }

  return {
    id: session.user.id,
    role: session.user.role,
    permissions: session.user.permissions ?? [],
    orgId: session.user.orgId,
    name: dbUser.name,
    email: dbUser.email,
  };
}
