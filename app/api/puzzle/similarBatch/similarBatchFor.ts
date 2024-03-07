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

  // const batchSize = lastBatch.length;
  // if (batchSize === 0) {
  //   return lastBatch; // Exit early.
  // }
  // const { rating } = await getExistingUserRating(user);
  // const solvedArray = await getUserSolvedPuzzleIDs(user);
  // return await similarBatchForCompromised(
  //   user.username,
  //   lastBatch,
  //   clampRating(rating),
  //   solvedArray
  // );

  const puzzles = (
    await mongoose.connection.collection('testPuzzles').find().toArray()
  ).map(puzzleFromDocument);
  let n = puzzles.length;
  // let same = 0;
  let ans = 0, min_opts = 10000000, tot = 0;
  const m: Map<number, number> = new Map();

  n = 2000
  console.time('doSomething')

  for (let i = 0; i < n; ++i) {
    let cur = 0;
    let a: Array<number> = [];
    for (let j = 0; j < n; ++j) {
      if (j == i) continue;
      if (puzzles[i].Rating - 300 < puzzles[j].Rating && puzzles[j].Rating < puzzles[i].Rating + 100) {
        // The space separated list of themes for puzzle[i] must have one word in common with the
        // space separeted list of themes for puzzle[j]:
        const themes_i = puzzles[i].Themes.split(' ');
        const themes_j = puzzles[j].Themes.split(' ');
        if (themes_i.some((theme) => themes_j.includes(theme))) {
          ans++;
          cur++;
          tot += similarity_distance(puzzles[i].hierarchy_tags, puzzles[j].hierarchy_tags);
          // a.push(similarity_distance(puzzles[i].hierarchy_tags, puzzles[j].hierarchy_tags));
        }
      }
      // ans += similarity_distance(puzzles[i].hierarchy_tags, puzzles[j].hierarchy_tags);
      // if (puzzles[i].hierarchy_tags === puzzles[j].hierarchy_tags) {
        // same++;
      // }
    }
    // a.sort((x, y) => (x as number) - (y as number));
    // const len = Math.min(a.length, 10);
    // // Increment len in m:
    // m.set(len, (m.get(len) || 0) + 1);
    // if (i % 100 === 0) {
    //   // console.log(a.length);
    //   // console.log(a);
    //   console.log(i, a.slice(0, 10));
    // }
    // if (cur === 0) {
    //   console.log(puzzles[i].Themes);
    // }
    min_opts = Math.min(min_opts, cur);
  }

  console.timeEnd('doSomething')

  console.log(n, ans, min_opts, tot);
  // console.log(m);

  return lastBatch;
};

export default similarBatchFor;
