import React, { useState, useEffect } from 'react';
import './move-viewer.css';

interface MoveViewerProps {
  moves: string[];
  currentIndex: number;
}

const MoveViewer: React.FC<MoveViewerProps> = ({ moves, currentIndex }) => {
  const [animatedIndex, setAnimatedIndex] = useState(currentIndex);

  useEffect(() => {
    setAnimatedIndex(currentIndex);
  }, [currentIndex]);

  return (
    <div className='move-viewer'>
      {moves.map((move, index) => (
        <div
          key={index}
          className={`move ${index === currentIndex ? 'highlighted' : ''} ${index === animatedIndex ? 'animated' : ''}`}
        >
          {move}
        </div>
      ))}
    </div>
  );
};

export default MoveViewer;
