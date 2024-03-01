import { validateRequest } from '@/lib/auth';
import { dbConnect } from '@/lib/db';
import { NextRequest } from 'next/server';
import { getPuzzleBatch } from './nextbatch';

export async function GET(request: NextRequest): Promise<Response> {
  await dbConnect();
  const { user } = await validateRequest();
  if (!user) return new Response('Unauthorized', { status: 401 });

  let url = request.nextUrl;
  let exceptionsQuery = url.searchParams.get('exceptions');
  let exceptions = exceptionsQuery ? exceptionsQuery.split(',') : [];

  const puzzles = await getPuzzleBatch(user, exceptions);

  // Placeholder code to return a puzzle list
  return new Response(JSON.stringify({ puzzles: puzzles }));
}
