import { Puzzle } from "@/types/lichess-api";
import { validateRequest } from '@/lib/auth';
import { dbConnect } from '@/lib/db';
import mongoose from 'mongoose';
import { NextRequest } from "next/server";
import { User } from "lucia/dist/core";

const RATING_RADIUS = 300;
const BATCH_SIZE = 5;

export async function getPuzzleBatch(user: User, exceptions: Array<string>): Promise<Array<Puzzle>> {
  const { perfs } = await fetch(`https://lichess.org/api/user/${user?.username}`).then((res) => res.json());
  const rating = perfs['puzzle']['rating']

  const puzzles = (await mongoose.connection.collection('testPuzzles')
    .find(
      { PuzzleId: {$nin: exceptions}, Rating: { $gt: rating - RATING_RADIUS, $lt: rating + RATING_RADIUS } },
      {limit: BATCH_SIZE}
    )
    .toArray())
    .map(p => {
      let {_id: _, ...rest} = p;
      return rest as any as Puzzle;
    }) // TODO(sm3421): lmao
  console.log("Puzzles");
  console.log(puzzles.map(p => p.PuzzleId))
  return puzzles;
}

export async function GET(request: NextRequest): Promise<Response>  {
  await dbConnect()
  const { user } = await validateRequest();
  if (!user) return new Response('Unauthorized', { status: 401 });

  let url = request.nextUrl;
  let exceptionsQuery = url.searchParams.get('exceptions');
  let exceptions = exceptionsQuery ? exceptionsQuery.split(',') : [];

  const puzzles = await getPuzzleBatch(user, exceptions);

  // Placeholder code to return a puzzle list
  return new Response(JSON.stringify({puzzles: puzzles}));
}
