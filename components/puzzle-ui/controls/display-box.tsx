import { CrossCircledIcon, CheckCircledIcon } from '@radix-ui/react-icons';
import { useContext } from 'react';
import { PuzzleContext } from '../puzzle-mode';
import './display-box.css';

const DisplayBox = ({
  solved,
  lastMoveWrong,
  linePos,
  side,
  viewSolution,
}: {
  solved: Boolean;
  lastMoveWrong: Boolean;
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
      <button
        className='buttonstyle bg-controller-dark hover:bg-controller-light'
        onClick={viewSolution}
      >
        View Solution
      </button>
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
      <button
        className='buttonstyle bg-controller-dark hover:bg-controller-light'
        onClick={getNextPuzzle}
      >
        Next Puzzle
      </button>
    </div>
  );
  let sideInfo = (
    <div className='icon-container'>
      <div className='text-wrapper'>
        Your turn: Find the best move for {side === 'w' ? 'white' : 'black'}
      </div>
    </div>
  );

  let guideText;
  if (solved) {
    guideText = solvedDiv;
  } else if (lastMoveWrong) {
    guideText = wrongDiv;
  } else if (linePos < 3) guideText = sideInfo;
  else guideText = correctDiv;

  return guideText;
};

export default DisplayBox;
