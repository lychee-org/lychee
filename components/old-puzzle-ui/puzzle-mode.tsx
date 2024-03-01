'use client';

import React, { useState, useEffect } from 'react';
import PuzzleBoard from './puzzle-board';
import { Puzzle } from '@/types/lichess-api';

type Props = {
  initialPuzzleBatch: Array<Puzzle>;
  puzzleSuccessCallback?: (puzzleId: string) => void;
  puzzleFailCallback?: (puzzleId: string) => void;
};

const MINIMUM_PUZZLES = 5;

export const PuzzleContext = React.createContext<Puzzle | undefined>(undefined);

const PuzzleMode: React.FC<Props> = ({ initialPuzzleBatch }) => {
  const [puzzleBatch, setPuzzleBatch] = useState(initialPuzzleBatch.slice(1));
  const [nextPuzzle, setNextPuzzle] = useState(initialPuzzleBatch[0]);

  const puzzleSubmit = (puzzleId: string, success: boolean) => {
    fetch(`/api/puzzle/submit`, {
      method: 'POST',
      body: JSON.stringify({ puzzleId, success }),
    });
  };

  const getNewPuzzles = () => {
    const alreadyBatched = [
      nextPuzzle.PuzzleId,
      ...puzzleBatch.map((p) => p.PuzzleId),
    ];
    fetch(`/api/puzzle/nextbatch?exceptions=${alreadyBatched}`)
      .then((res) => res.json())
      .then((res) => res.puzzles as Array<Puzzle>)
      .then((puzzles: Array<Puzzle>) => {
        setPuzzleBatch([...puzzleBatch, ...puzzles]);
      });
  };

  useEffect(() => {
    if (puzzleBatch.length <= MINIMUM_PUZZLES) getNewPuzzles();
  });

  if (!nextPuzzle) {
    return 'All Done!';
  }
  return (
    <PuzzleContext.Provider value={nextPuzzle}>
      <PuzzleBoard
        nextPuzzleCallback={() => {
          setNextPuzzle(puzzleBatch[0]);
          setPuzzleBatch(puzzleBatch.slice(1));
        }}
        puzzleSubmitCallback={puzzleSubmit}
      />
    </PuzzleContext.Provider>
  );
};

export default PuzzleMode;
