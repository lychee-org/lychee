import { RatingHolder } from '@/components/puzzle-ui/puzzle-mode';
import { AllRoundColl } from '@/models/AllRoundColl';
import { getExistingUserRating, getThemeRatings } from '@/src/rating/getRating';
import { Puzzle } from '@/types/lichess-api';
import { User } from 'lucia';
import mongoose from 'mongoose';
import sm2RandomThemeFromRatingMap from '../../../../src/sm2';
import frequentiallyRandomTheme, { isIrrelevant } from './themeGenerator';
import Rating from '@/src/rating/GlickoV2Rating';
import { ActivePuzzleColl } from '@/models/ActivePuzzle';
import { booleanWithProbability } from '@/lib/utils';
import { nextLeitnerReview } from '@/src/LeitnerIntance';
import { similarBatchForCompromised } from '../similarBatch/similarBatchFor';
import { computeSimilarityCache, findSimilarityInstance, SimilarityInstance, findSimilarUndoPuzzle } from '@/src/similarityCache';
import { SimilarityColl } from '@/models/SimilarityColl';
import { findPuzzlebyId } from '@/src/similarityCache';

const MAX_REPS: number = 20;
const MAX_COMPROMISE: number = 3;

const LEITNER_PROBABILITY: number = 0.8; // TODO: Decrease this.
const MIN_CANDIDATES: number = 10; // TODO: Increase this.

export type PuzzleWithUserRating = {
  puzzle: Puzzle;
  rating: RatingHolder;
};

export const getUserSolvedPuzzleIDs = async (user: User): Promise<string[]> => {
  const doc = await AllRoundColl.findOne({ username: user.username });
  if (!doc) {
    throw new Error(
      'AllRound collection not populated with user, should happen on first login'
    );
  }
  return doc.solved;
};

export const puzzleFromDocument = (document: any): Puzzle => {
  let { _id: _, ...rest } = document;
  return rest as any as Puzzle;
};

// Clamp rating between 400 and 2700, similar to
// https://github.com/clarkerubber/lila/blob/1651e001c4e2794a6b6804860fc729401a670469/modules/puzzle/src/main/Selector.scala#L63
export const clampRating = (glicko: number): number =>
  Math.max(400, Math.min(2700, glicko));

// We compute the radius (`ratingFlex`) as in
// https://github.com/lichess-org/lila/blob/e6ce7245b528035ba9bc6ee37ae34799728cdc19/modules/puzzle/src/main/PuzzlePath.scala#L43
// except, since we don't use paths, we allow for a larger initial radius by compromoie = 1, scaling by a factor of 3/4;
export const radiusForRating = (rating: number, compromise: number): number =>
  0.75 * compromise * (100 + Math.abs(1500 - rating) / 4);

const nextPuzzleForThemeAndRating = async (
  theme: string,
  rawRating: number,
  exceptions: any,
  compromise: number = 1
): Promise<Puzzle | undefined> => {
  if (compromise > MAX_COMPROMISE) {
    return undefined;
  }
  const rating = compromise > 1 ? rawRating : clampRating(rawRating);
  const radius = radiusForRating(rating, compromise);
  console.log(`radius = ${radius}, theme = ${theme}, rating = ${rating}`);
  const p = await mongoose.connection.collection('testPuzzles').findOne({
    PuzzleId: { $nin: exceptions },
    Rating: {
      $gt: rating - radius,
      $lt: rating + radius,
    },
    // TODO: Improve this. Maybe transform testPuzzles to not have this annoying
    // space-separated string of themes?
    Themes: { $regex: new RegExp('\\b' + theme + '\\b', 'i') },
  });
  // No puzzle found; increase compromise.
  if (p === null) {
    return await nextPuzzleForThemeAndRating(
      theme,
      rating,
      exceptions,
      compromise + 1
    );
  }
  return puzzleFromDocument(p);
};

const nextPuzzleRepetitions = async (
  rating: number,
  reps: number,
  ratingMap: Map<string, Rating>,
  exceptions: any
): Promise<Puzzle> => {
  if (reps == MAX_REPS) {
    throw new Error('Maximum repetitions reached during puzzle selection');
  }
  let theme = frequentiallyRandomTheme();
  // If the theme is not in the rating map, let's try to use it.
  // Otherwise, let's run probabilistic SM2 on the rating map.
  const useSpacedRep = ratingMap.has(theme);
  if (useSpacedRep) {
    theme = sm2RandomThemeFromRatingMap(ratingMap);
  }
  const p = await nextPuzzleForThemeAndRating(theme, rating, exceptions);
  if (p) {
    if (isIrrelevant(theme)) {
      throw new Error(
        'Irrelevant theme found - incorrect/no filtering has occured.'
      );
    }
    console.log(
      `Found theme ${theme} ${useSpacedRep ? 'through SM2' : 'frequentially'} after ${reps} reps.`
    );
    return p;
  }
  return await nextPuzzleRepetitions(rating, reps + 1, ratingMap, exceptions);
};
 
const nextPuzzleFor = async (
  user: User,
  woodpecker: boolean = false
): Promise<PuzzleWithUserRating> =>
  getExistingUserRating(user).then(async (userRating) => {
    const rating = {
      rating: userRating.rating,
      ratingDeviation: userRating.ratingDeviation,
      volatility: userRating.volatility,
      numberOfResults: userRating.numberOfResults,
    };

    if (!woodpecker) {
      const activePuzzle = await ActivePuzzleColl.findOne({
        username: user.username,
      });
      if (activePuzzle) {
        console.log('Found active puzzle');
        return {
          puzzle: JSON.parse(activePuzzle.puzzle) as Puzzle,
          rating: rating,
        };
      }
    }

    // TODO: Iterate to better handle repeat avoidance.
    const exceptions: string[] = await getUserSolvedPuzzleIDs(user);

    if (!woodpecker && booleanWithProbability(LEITNER_PROBABILITY)) {
      console.log('Trying to use Leitner...');
      const puzzleToReview = await nextLeitnerReview(user);
      if (puzzleToReview) {
        console.log(
          `Worked! Puzzle Id: ${puzzleToReview.PuzzleId} from Leitner, tags: ${puzzleToReview.hierarchy_tags}`
        );
        // Find the corresponding record in Similarity table.
        let instance: SimilarityInstance | undefined = await findSimilarityInstance(puzzleToReview.PuzzleId);
        let similarPuzzleId: String;

        if (!instance) {
          const similarPuzzles = await computeSimilarityCache(puzzleToReview);
          const instanceCreated = {  
            puzzleId: puzzleToReview.PuzzleId,
            cache: similarPuzzles
          }
          await SimilarityColl.create(instanceCreated);
          instance = instanceCreated;
        } 
        similarPuzzleId = await findSimilarUndoPuzzle(instance, user.username);
        
        let similarPuzzle: Puzzle | undefined;
        if (similarPuzzleId == "Whole cache has been solved.") {
          [similarPuzzle] = await similarBatchForCompromised(
            user.username,
            [puzzleToReview],
            clampRating(rating.rating),
            exceptions,
            MIN_CANDIDATES // TODO: Increase this, or maybe start compromise at 2 instead, to use wider similarity radius? Unsure.
          );
        } else {
          similarPuzzle = await findPuzzlebyId(similarPuzzleId);
          similarPuzzle = similarPuzzle as Puzzle;
        }
        
        console.log(
          `Got similar puzzle with tags ${similarPuzzle.hierarchy_tags} and line ${similarPuzzle.Moves}`
        );
        // TODO: If puzzle == similar puzzle or no similar puzzle?
        await ActivePuzzleColl.updateOne(
          { username: user.username },
          {
            username: user.username,
            puzzle: JSON.stringify(similarPuzzle),
            isReview: true,
            reviewee: JSON.stringify(puzzleToReview),
          },
          { upsert: true }
        );
        return {
          puzzle: similarPuzzle,
          rating: rating,
        };
      }
    }

    // NB: The persisted rating map may contain irrelevant themes, but we don't
    // want to include these for nextPuzzle / SM2, so we filter them out below.
    const ratingMap = await getThemeRatings(user, true);
    const puzzle = await nextPuzzleRepetitions(
      rating.rating,
      0,
      ratingMap,
      exceptions
    );
    console.log(
      `Got puzzle with themes ${puzzle.Themes} and rating ${puzzle.Rating} and line ${puzzle.Moves}`
    );

    if (!woodpecker) {
      await ActivePuzzleColl.updateOne(
        { username: user.username },
        {
          username: user.username,
          puzzle: JSON.stringify(puzzle),
          isReview: false,
        },
        { upsert: true }
      );
    }

    return {
      puzzle: puzzle,
      rating: rating,
    };
  });

export default nextPuzzleFor;
