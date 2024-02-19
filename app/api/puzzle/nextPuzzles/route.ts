import { validateRequest } from '@/lib/auth';
import { dbConnect } from '@/lib/db';
import { NextRequest } from 'next/server';
import nextPuzzleFor from '../nextPuzzle/nextFor';
import addRound from '../submit/addRound';
import { Puzzle } from '@/types/lichess-api';

export async function GET(_req: NextRequest) {
  await dbConnect();
  const { user } = await validateRequest();
  if (!user) {
    return new Response('Unauthorized', { status: 401 });
  }
  const puzzles = new Array<Puzzle>();
  for (let i = 0; i < 5; i++) {
    const { puzzle } = await nextPuzzleFor(user);
    await addRound(user, puzzle); // TODO: Does this need fix?
    puzzles.push(puzzle);
  }
  return new Response(JSON.stringify(puzzles), {
    status: 200,
  });
}
