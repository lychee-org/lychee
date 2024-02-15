import React, { Dispatch, ReactNode, SetStateAction } from 'react';
import MoveViewer from './move-viewer';
import ControlButtonBar from './control-bar-button';

interface ControlBarProps {
  moves: string[];
  currentIndex: number;
  setIndex: Dispatch<SetStateAction<number>>;
  display?: ReactNode | undefined;
}

const ControlBar: React.FC<ControlBarProps> = ({moves, currentIndex, setIndex, display}) => {
  const firstMove = () => {setIndex(0);}
  const prevMove = () => {setIndex(Math.max(0, currentIndex - 1));}
  const nextMove = () => {setIndex(Math.min(currentIndex + 1, moves.length - 1));}
  const lastMove = () => {setIndex(moves.length - 1);}

  return (
    <div className="control-bar">
      <MoveViewer moves={moves} currentIndex={currentIndex} />
      <ControlButtonBar firstMove={firstMove} prevMove={prevMove} nextMove={nextMove} lastMove={lastMove} />
      <div className="text-space">
        {display}
      </div>
    </div>
  );
};

export default ControlBar;
