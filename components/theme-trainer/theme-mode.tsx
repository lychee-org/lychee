'use client';

import { Puzzle } from '@/types/lichess-api';
import React, { useState } from 'react';
import PuzzleBoard from '../puzzle-ui/puzzle-board';
import {
  PuzzleContext,
  RatingHolder,
} from '../puzzle-ui/puzzle-mode';
import { PuzzleWithUserRating } from '@/app/api/puzzle/nextPuzzle/nextFor';

interface ThemeModeProps {
  initialPuzzle: Puzzle | undefined;
  initialRating: RatingHolder;
  group: string[];
}

const ThemeMode: React.FC<ThemeModeProps> = ({
  initialPuzzle,
  initialRating,
  group,
}) => {
  const [puzzle, setPuzzle] = useState<Puzzle | undefined>(initialPuzzle);
  const [rating, setRating] = useState<RatingHolder>(initialRating);
  const [loading, setLoading] = useState(false);

  // TODO: Handle when no more puzzles!

  // submit the puzzle success/failure to the server
  const submitNextPuzzle = (
    success: boolean,
    prv: RatingHolder,
    t: number
  ): Promise<RatingHolder> =>
    fetch(`/api/puzzle/submit`, {
      method: 'POST',
      body: JSON.stringify({
        puzzle_: puzzle,
        success_: success,
        prv_: prv,
        themeGroupStr: group,
        time: t,
      }),
    })
      .then((response) => response.text())
      .then((s) => JSON.parse(s) as RatingHolder);

  // get the next puzzle
  const getNextPuzzle = () => {
    setLoading(true);
    fetch(`/api/puzzle/nextPuzzle`, {
      method: 'POST',
      body: JSON.stringify({ themeGroupStr: group }),
    })
      .then((response) => response.text())
      .then((s) => JSON.parse(s) as PuzzleWithUserRating)
      .then((response) => {
        setPuzzle(response.puzzle);
        setRating(response.rating);
      })
      .finally(() => setLoading(false));
  };

  return (
    puzzle ? 
    <PuzzleContext.Provider value={{ submitNextPuzzle, getNextPuzzle }}>
      <PuzzleBoard puzzle={puzzle} initialRating={rating} loading={loading} />
    </PuzzleContext.Provider>
    :
    <div>
      No more puzzles in this group!
    </div>
  );
};

export default ThemeMode;
