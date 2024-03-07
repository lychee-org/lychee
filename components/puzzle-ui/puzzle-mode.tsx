'use client';
import { Puzzle } from '@/types/lichess-api';
import React, { CSSProperties, useState, useEffect } from 'react';
import PuzzleBoard from './puzzle-board';
import { PuzzleWithUserRating } from '@/app/api/puzzle/nextPuzzle/nextFor';

export type RatingHolder = {
  rating: number;
  ratingDeviation: number;
  volatility: number;
  numberOfResults: number;
};

interface PuzzleModeProps {
  initialPuzzle: Puzzle;
  initialRating: RatingHolder;
}

export const wrapperStyle = {
  width: '60vw',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  margin: '3rem auto',
};

export const PuzzleContext = React.createContext({
  submitNextPuzzle: (
    _success: boolean,
    _prv: RatingHolder
  ): Promise<RatingHolder> => {
    throw new Error();
  },
  getNextPuzzle: () => {},
});

const PuzzleMode: React.FC<PuzzleModeProps> = ({
  initialPuzzle,
  initialRating,
}) => {
  /** PUZZLE CODE */
  const [puzzle, setPuzzle] = useState<Puzzle>(initialPuzzle);
  const [rating, setRating] = useState<RatingHolder>(initialRating);

  // TODO: Handle when no more puzzles!
  useEffect(() => {
    fetch(`/api/puzzle/computeBatch`, {
      method: 'POST',
      body: JSON.stringify({ puzzleId: puzzle.PuzzleId }),
    }).then(() => console.log('Computed similarity cachee of last puzzle'));
  }, [puzzle]);

  // submit the puzzle success/failure to the server
  const submitNextPuzzle = (
    success: boolean,
    prv: RatingHolder
  ): Promise<RatingHolder> =>
    fetch(`/api/puzzle/submit`, {
      method: 'POST',
      body: JSON.stringify({ puzzle_: puzzle, success_: success, prv_: prv }),
    })
      .then((response) => response.text())
      .then((s) => JSON.parse(s) as RatingHolder);

  // get the next puzzle
  const getNextPuzzle = () => {
    fetch(`/api/puzzle/nextPuzzle`, {
      method: 'GET',
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

export default PuzzleMode;
