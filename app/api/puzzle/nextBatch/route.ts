import { validateRequest } from '@/lib/auth';
import { dbConnect } from '@/lib/db';
import { NextRequest } from 'next/server';
import nextPuzzleFor from '../nextPuzzle/nextFor';
import addRound from '../submit/addRound';
import { Puzzle } from '@/types/lichess-api';
import { LastBatchColl } from '@/models/LastBatch';

export async function POST(req: NextRequest) {
  await dbConnect();
  const { user } = await validateRequest();
  if (!user) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Compute batch by repeated calls to nextPuzzleFor.
  const { batchSize } = await req.json();
  const puzzles = new Array<Puzzle>();
  for (let i = 0; i < batchSize; i++) {
    // We shouldn't mark as active, since then whole batch will be the same.
    // TODO: Same batch on refresh?
    const { puzzle } = await nextPuzzleFor(user, true);
    await addRound(user, puzzle);
    puzzles.push(puzzle);
  }

  // Persist this batch in LastBatchColl.
  await LastBatchColl.updateOne(
    { username: user.username },
    { batch: puzzles },
    { upsert: true }
  );

  return new Response(JSON.stringify(puzzles), {
    status: 200,
  });
}
