import { Puzzle } from "@/types/lichess-api";
import { User } from "lucia";
import mongoose from "mongoose";

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
  return puzzles;
}