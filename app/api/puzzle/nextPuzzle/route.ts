import { validateRequest } from '@/lib/auth';
import { dbConnect } from '@/lib/db';
import { NextRequest } from 'next/server';
import nextPuzzleFor from './nextFor';

export async function GET(_req: NextRequest) {
  await dbConnect();
  const { user } = await validateRequest();
  if (!user) {
    return new Response('Unauthorized', { status: 401 });
  }
  return new Response(JSON.stringify(await nextPuzzleFor(user)), {
    status: 200,
  });
}
