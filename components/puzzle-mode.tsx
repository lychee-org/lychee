'use client';

import React, { useState, useEffect } from 'react';
import PuzzleBoard from './puzzle-board';
import { Puzzle } from '@/types/lichess-api';

type Props = {
  initialPuzzleBatch: Array<Puzzle>;
};

const MINIMUM_PUZZLES = 5;

const PuzzleMode: React.FC<Props> = ({ initialPuzzleBatch }) => {
  const [puzzleBatch, setPuzzleBatch] = useState(initialPuzzleBatch.slice(1));
  const [nextPuzzle, setNextPuzzle] = useState(initialPuzzleBatch[0]);
  console.log(puzzleBatch.length);

  const getNewPuzzles = () => {
    const alreadyBatched = [nextPuzzle.PuzzleId, ...puzzleBatch.map(p => p.PuzzleId)].join(',');
    fetch(`/api/nextpuzzlebatch?exceptions=${alreadyBatched}`)
      .then((res) => res.json())
      .then((res) => res.puzzles as Array<Puzzle>)
      .then((puzzles: Array<Puzzle>) => {
        setPuzzleBatch([...puzzleBatch, ...puzzles])
        console.log(puzzleBatch.length);
      });
  }

  useEffect(() => {
    if (puzzleBatch.length <= MINIMUM_PUZZLES) {
      getNewPuzzles();
    }
  })


  const PuzzleContext = React.createContext<Puzzle | undefined>(nextPuzzle);

  if (!nextPuzzle) {
    return 'All Done!';
  }
  return (
    <PuzzleContext.Provider value={nextPuzzle}>
    <PuzzleBoard
      puzzle={nextPuzzle}
      callback={() => {
        setNextPuzzle(puzzleBatch[0]);
        setPuzzleBatch(puzzleBatch.slice(1));
      }}
    />
    </PuzzleContext.Provider>
  );
}

export default PuzzleMode;
