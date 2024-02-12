'use client';

import { useState } from 'react';
import PuzzleBoard from './puzzle-board';
import { Puzzle } from '@/types/lichess-api';

type Props = {
  puzzles: Array<Puzzle>;
};

const PuzzleMode: React.FC<Props> = ({ puzzles }) => {
  const [solved, setSolved] = useState<number>(0); // state??
  
  return (
    solved == puzzles.length ? 
    'All Done!' :
    <PuzzleBoard
      puzzle={puzzles[solved]}
      callback={() => {
        console.log("Puzzle Solved!")
        setSolved(previous => previous + 1)
        // console.log(puzzles[solved])
      }}
    />
  );
}

export default PuzzleMode;
