import { AllRoundColl } from "@/models/AllRoundColl";
import { RoundColl } from "@/models/RoundColl";
import { Puzzle } from "@/types/lichess-api";
import { User } from "lucia";

const addRound = async (user: User, puzzle: Puzzle): Promise<void> => {
  // TODO:

  // Insert this round into the round DB. Currently, this is unused.
  // await RoundColl.create({
  //   roundId: `${user.username}+${puzzle.PuzzleId}`,
  // });

  await AllRoundColl.updateOne(
    { username: user.username },
    {
      // Append puzzle ID to the array of solved IDs.
      $addToSet: { solved: puzzle.PuzzleId },
    }
  );
}

export default addRound;
