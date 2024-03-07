'use client';

import { Puzzle } from '@/types/lichess-api';
import React, { CSSProperties, useState } from 'react';
import PuzzleBoard from '../puzzle-ui/puzzle-board';
import {
  PuzzleContext,
  PuzzleModeProps,
  RatingHolder,
  wrapperStyle,
} from '../puzzle-ui/puzzle-mode';
import { PuzzleWithUserRating } from '@/app/api/puzzle/nextPuzzle/nextFor';

interface ThemeModeProps {
  initialPuzzle: Puzzle;
  initialRating: RatingHolder;
  group: string[];
}

const ThemeMode: React.FC<ThemeModeProps> = ({
  initialPuzzle,
  initialRating,
  group,
}) => {
  const [puzzle, setPuzzle] = useState<Puzzle>(initialPuzzle);
  const [rating, setRating] = useState<RatingHolder>(initialRating);

  // TODO: Handle when no more puzzles!

  // submit the puzzle success/failure to the server
  const submitNextPuzzle = (
    success: boolean,
    prv: RatingHolder
  ): Promise<RatingHolder> =>
    fetch(`/api/puzzle/submit`, {
      method: 'POST',
      body: JSON.stringify({ puzzle_: puzzle, success_: success, prv_: prv, themeGroupStr: group }),
    })
      .then((response) => response.text())
      .then((s) => JSON.parse(s) as RatingHolder);

  // get the next puzzle
  const getNextPuzzle = () => {
    fetch(`/api/puzzle/nextPuzzle`, {
      method: 'POST',
      body: JSON.stringify({ themeGroupStr: group }),
    })
      .then((response) => response.text())
      .then((s) => JSON.parse(s) as PuzzleWithUserRating)
      .then((response) => {
        setPuzzle(response.puzzle);
        setRating(response.rating);
      });
  };

  return (
    <div style={wrapperStyle as CSSProperties}>
      <PuzzleContext.Provider value={{ submitNextPuzzle, getNextPuzzle }}>
        <PuzzleBoard puzzle={puzzle} initialRating={rating} />
      </PuzzleContext.Provider>
    </div>
  );
};

export default ThemeMode;
