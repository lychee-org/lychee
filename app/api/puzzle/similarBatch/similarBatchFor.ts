import { User } from 'lucia';
import lastBatchFor from '../lastBatch/lastBatchFor';
import { Puzzle } from '@/types/lichess-api';
import {
  getUserSolvedPuzzleIDs,
  LOWER_RADIUS,
  puzzleFromDocument,
  UPPER_RADIUS,
} from '../nextPuzzle/nextFor';
import { AllRoundColl } from '@/models/AllRoundColl';
import { LastBatchColl } from '@/models/LastBatch';
import { getExistingUserRating } from '@/src/rating/getRating';
import mongoose from 'mongoose';
import similarity_distance from '@/src/similarity';

// Returns empty array if no last batch is found.
const similarBatchFor = async (user: User): Promise<Puzzle[]> => {
  const lastBatch = await lastBatchFor(user);
  if (lastBatch.length === 0) {
    return lastBatch; // Let's exit early to avoid an unnecessary read.
  }

  const solvedArray = await getUserSolvedPuzzleIDs(user);
  const solvedSet = new Set(solvedArray);
  const { rating } = await getExistingUserRating(user);

  // For efficiency, let's compute all non-solved puzzles in the radius.
  // Observe that the solved array should update to avoid repeats in
  // the batch. We will handle this manually later.
  const candidates = (
    await mongoose.connection
      .collection('testPuzzles')
      .find({
        PuzzleId: { $nin: solvedArray },
        Rating: {
          $gt: rating - LOWER_RADIUS,
          $lt: rating + UPPER_RADIUS,
        },
      })
      .toArray()
  ).map(puzzleFromDocument);
  console.log(`Found ${candidates.length} candidates.`);

  const ret = lastBatch.map((puzzle) => {
    let min_distance = Infinity,
      closest_puzzle = puzzle;
    candidates.forEach((candidate) => {
      if (solvedSet.has(candidate.PuzzleId)) {
        return;
      }
      const distance = similarity_distance(
        puzzle.hierarchy_tags,
        candidate.hierarchy_tags
      );
      if (distance < min_distance) {
        min_distance = distance;
        closest_puzzle = candidate;
      }
    });
    console.log(
      `Found ${closest_puzzle.hierarchy_tags} for ${puzzle.hierarchy_tags} with distance ${min_distance}$`
    );
    solvedSet.add(closest_puzzle.PuzzleId);
    solvedArray.push(closest_puzzle.PuzzleId); // Let's write to AllRound in one go later instead.
    return closest_puzzle;
  });

  // Persist in both LastBatch and AllRound.
  console.log(`Persisting ${solvedArray} for ${user.username}...`);
  await AllRoundColl.updateOne(
    { username: user.username },
    { $set: { solved: solvedArray } }
  );
  await LastBatchColl.updateOne(
    { username: user.username },
    { batch: ret },
    { upsert: true }
  );

  return ret;
};

export default similarBatchFor;
