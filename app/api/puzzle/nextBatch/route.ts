import { validateRequest } from '@/lib/auth';
import { dbConnect } from '@/lib/db';
import { NextRequest } from 'next/server';
import nextPuzzleFor from '../nextPuzzle/nextFor';
import addRound from '../submit/addRound';
import { Puzzle } from '@/types/lichess-api';
import { LastBatchColl } from '@/models/LastBatch';

export async function GET(_req: NextRequest) {
  console.log('here');
  await dbConnect();
  const { user } = await validateRequest();
  console.log('here');
  if (!user) {
    return new Response('Unauthorized', { status: 401 });
  }
  console.log('here');
  const puzzles = new Array<Puzzle>();
  for (let i = 0; i < 5; i++) {
    const { puzzle } = await nextPuzzleFor(user);
    await addRound(user, puzzle); // TODO: Does this need fix?
    puzzles.push(puzzle);
  }
  await LastBatchColl.updateOne(
    { username: user.username },
    { batch: puzzles },
    { upsert: true }
  );
  return new Response(JSON.stringify(puzzles), {
    status: 200,
  });
}
