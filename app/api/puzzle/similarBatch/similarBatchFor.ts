import { User } from 'lucia';
import lastBatchFor from '../lastBatch/lastBatchFor';
import { Puzzle } from '@/types/lichess-api';
import {
  getUserSolvedPuzzleIDs,
  clampRating,
  radiusForRating,
  puzzleFromDocument,
} from '../nextPuzzle/nextFor';
import { AllRoundColl } from '@/models/AllRoundColl';
import { LastBatchColl } from '@/models/LastBatch';
import { getExistingUserRating } from '@/src/rating/getRating';
import mongoose from 'mongoose';
import similarity_distance from '@/src/similarity';

// TODO: A bit of conflict here; in theory we want a large number of puzzle candidates,
// but we also don't want to take into account those outside the user's rating range.
// A robust similarity algorithm would not class puzzles of substantially differing
// difficulties as similar though.

// We use a larger initial compromise (and so a larger initial radius)
// as we'd like more similarity candidates to choose from, and this is
// a batched mode, so more puzzle rating variance is acceptable.
const INITIAL_COMPROMISE = 2;
const MAX_COMPROMISE = 4;

export const similarBatchForCompromised = async (
  username: string,
  lastBatch: Puzzle[],
  clampedRating: number,
  solvedArray: string[],
  minBatchFactor: number = 2,
  persist: boolean = true,
  compromise: number = INITIAL_COMPROMISE
): Promise<Puzzle[]> => {
  // TODO: Handle no puzzles here.
  if (compromise == MAX_COMPROMISE) {
    console.log('Maximum compromise reached in similar batch retrieval.');
  }

  const radius = radiusForRating(clampedRating, compromise);
  console.log(`Radius for ${clampedRating} is ${radius}.`);

  // For efficiency, let's compute all non-solved puzzles in the radius.
  // Observe that the solved array should update to avoid repeats in
  // the batch. We will handle this manually later.
  const candidates = (
    await mongoose.connection
      .collection('testPuzzles')
      .find({
        PuzzleId: { $nin: solvedArray },
        Rating: {
          $gt: clampedRating - radius,
          $lt: clampedRating + radius,
        },
      })
      .toArray()
  ).map(puzzleFromDocument);

  console.log(`Found ${candidates.length} candidates.`);
  // If number of candidates is too small, let's increase the compromise factor.
  // TODO: Do this if similar puzzles are not sufficiently similar instead?
  if (
    compromise < MAX_COMPROMISE &&
    candidates.length < minBatchFactor * lastBatch.length
  ) {
    return await similarBatchForCompromised(
      username,
      lastBatch,
      clampedRating,
      solvedArray,
      compromise + 1
    );
  }

  const solvedSet = new Set(solvedArray);
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
      `Found ${closest_puzzle.hierarchy_tags} for ${puzzle.hierarchy_tags} with distance ${min_distance}`
    );
    solvedSet.add(closest_puzzle.PuzzleId);
    solvedArray.push(closest_puzzle.PuzzleId); // Let's write to rounds in one go later.

    // TODO: If closest puzzle is sufficiently far away (which may be determined by `min_distance`),
    // we should prefer repeating the puzzle (instead of providing a very un-"similar" puzzle).
    return closest_puzzle;
  });

  if (persist) {
    // Persist in both LastBatch and AllRound.
    // TODO: persist in Round, if we eventually use Round.
    console.log(`Persisting ${solvedArray} for ${username}...`);
    await AllRoundColl.updateOne(
      { username: username },
      { $set: { solved: solvedArray } }
    );
    await LastBatchColl.updateOne(
      { username: username },
      { batch: ret },
      { upsert: true }
    );
  }
  return ret;
};

// Returns empty array if no last batch is found.
const similarBatchFor = async (user: User): Promise<Puzzle[]> => {
  const lastBatch = await lastBatchFor(user);
  const batchSize = lastBatch.length;
  if (batchSize === 0) {
    return lastBatch; // Exit early.
  }
  const { rating } = await getExistingUserRating(user);
  const solvedArray = await getUserSolvedPuzzleIDs(user);
  return await similarBatchForCompromised(
    user.username,
    lastBatch,
    clampRating(rating),
    solvedArray
  );
};

export default similarBatchFor;
