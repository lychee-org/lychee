import { dbConnect } from '@/lib/db';
import { Puzzle } from '@/types/lichess-api';
import mongoose from 'mongoose';
import { validateRequest } from '@/lib/auth';
import PuzzleBoard from '@/components/puzzle-board';

const RATING_RADIUS = 300

export default async function TestBoard() {
  await dbConnect()
  const { user } = await validateRequest();
  const { perfs } = await fetch(`https://lichess.org/api/user/${user?.username}`).then((res) => res.json());
  const rating = perfs['puzzle']['rating']
  console.log(rating) // TODO(sm3421): Remove

  const puzzles = (await mongoose.connection.collection('testPuzzles')
    .find({ Rating: { $gt: rating - RATING_RADIUS, $lt: rating + RATING_RADIUS } })
    .toArray())
    .map(p => p as any as Puzzle) // TODO(sm3421): lmao

  console.log(puzzles[0].Moves);
  console.log(puzzles[1].Moves);
  return <PuzzleBoard puzzles={puzzles} />;
}
