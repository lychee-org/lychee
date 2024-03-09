'use client';
import { Puzzle } from '@/types/lichess-api';
import React, { useState, useEffect } from 'react';
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
  group: string[];
}

export const PuzzleContext = React.createContext({
  submitNextPuzzle: (
    _success: boolean,
    _prv: RatingHolder,
    _time: number
  ): Promise<RatingHolder> => {
    throw new Error();
  },
  getNextPuzzle: () => {},
});

const PuzzleMode: React.FC<PuzzleModeProps> = ({
  initialPuzzle,
  initialRating,
  group,
}) => {
  /** PUZZLE CODE */
  const [puzzle, setPuzzle] = useState<Puzzle>(initialPuzzle);
  const [rating, setRating] = useState<RatingHolder>(initialRating);
  const [similar, setSimilar] = useState<Puzzle[] | undefined>([]);
  const [loading, setLoading] = useState(false);

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
    prv: RatingHolder,
    time: number
  ): Promise<RatingHolder> =>
    fetch(`/api/puzzle/submit`, {
      method: 'POST',
      body: JSON.stringify({
        puzzle_: puzzle,
        success_: success,
        prv_: prv,
        themeGroupStr: group,
        time: time,
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
        setSimilar(response.similar);
      })
      .finally(() => setLoading(false));
  };

  return (
    <PuzzleContext.Provider value={{ submitNextPuzzle, getNextPuzzle }}>
      <PuzzleBoard puzzle={puzzle} initialRating={rating} loading={loading} similar={similar} />
    </PuzzleContext.Provider>
  );
};

export default PuzzleMode;
