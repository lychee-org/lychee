'use client';

import { useState } from 'react';
import PuzzleBoard from './puzzle-board';
import { Puzzle } from '@/types/lichess-api';

type Props = {
  puzzles: Array<Puzzle>;
};

const PuzzleMode: React.FC<Props> = ({ puzzles }) => {
  const [solved, setSolved] = useState<number>(0);

  return (
    solved == puzzles.length ? 
    'All Done!' : // TODO(sm3421): Handle this better.
    <PuzzleBoard
      puzzle={puzzles[solved]}
      callback={() => {
        console.log("Puzzle Solved!")
        setSolved(previous => previous + 1)
      }}
    />
  );
}

export default PuzzleMode;
