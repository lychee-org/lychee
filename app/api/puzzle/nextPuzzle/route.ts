import { validateRequest } from '@/lib/auth';
import { dbConnect } from '@/lib/db';
import { NextRequest } from 'next/server';
import nextPuzzleFor from './nextFor';

export async function POST(req: NextRequest) {
  await dbConnect();
  const { user } = await validateRequest();
  if (!user) {
    return new Response('Unauthorized', { status: 401 });
  }
  const { themeGroupStr } = await req.json();
  const themeGroup = themeGroupStr as string[];
  const puzzle = await nextPuzzleFor(user, false, themeGroup);
  return new Response(JSON.stringify(puzzle), {
    status: 200,
  });
}
