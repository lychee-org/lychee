import { CrossCircledIcon, CheckCircledIcon } from '@radix-ui/react-icons';
import { useContext, useState } from 'react';
import { PuzzleContext } from '../puzzle-mode';
import './display-box.css';
import { Button } from '@/components/ui/button';

const DisplayBox = ({
  loading,
  gaveUp,
  solved,
  lastMoveWrong,
  linePos,
  side,
  viewSolution,
}: {
  loading: boolean;
  gaveUp: boolean;
  solved: boolean;
  lastMoveWrong: boolean;
  linePos: number;
  side: string;
  viewSolution: () => void;
}) => {
  let wrongIcon = <CrossCircledIcon className='radix-icon' />;
  let correctIcon = <CheckCircledIcon className='radix-icon' />;
  const { getNextPuzzle } = useContext(PuzzleContext);

  let wrongDiv = (
    <div className='icon-container'>
      <div className='icon-wrapper text-red-500 text'>{wrongIcon}</div>
      <div className='text-wrapper'>Sorry, that&apos;s not it...</div>
      <Button variant={'secondary'} onClick={viewSolution}>
        View Solution
      </Button>
    </div>
  );
  let correctDiv = (
    <div className='icon-container'>
      <div className='icon-wrapper text-green-500'>{correctIcon}</div>
      <div className='text-wrapper'>Good job! Keep going...</div>
    </div>
  );
  let solvedDiv = (
    <div className='icon-container'>
      <div className='icon-wrapper text-green-500'>{correctIcon}</div>
      <div className='text-wrapper'>Amazing! You solved it</div>
      <Button variant={'default'} onClick={getNextPuzzle} disabled={loading}>
        {loading ? 'Loading...' : 'Next Puzzle'}
      </Button>
    </div>
  );
  let sideInfo = (
    <div className='icon-container'>
      <div className='font-bold'>Your turn</div>
      <div className=''>
        Find the best move for {side === 'w' ? 'white' : 'black'}
      </div>
    </div>
  );
  let gaveUpDiv = (
    <div className='icon-container'>
      <div className='icon-wrapper text-yellow-500'>{wrongIcon}</div>
      <div className='text-wrapper'>Here is the correct solution</div>
      <Button variant={'default'} onClick={getNextPuzzle} disabled={loading}>
        {loading ? 'Loading...' : 'Next Puzzle'}
      </Button>
    </div>
  );

  let guideText;
  if (solved) {
    if (gaveUp) {
      guideText = gaveUpDiv;
    } else {
      guideText = solvedDiv;
    }
  } else if (lastMoveWrong) {
    guideText = wrongDiv;
  } else if (linePos < 3) guideText = sideInfo;
  else guideText = correctDiv;

  return guideText;
};

export default DisplayBox;
