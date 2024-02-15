import React, { useState, useEffect, useContext } from 'react';
import './move-viewer.css';

type Side = 'w' | 'b';

export const MoveNavigationContext = React.createContext({
  currentIndex: 0,
  moves: ['...'],
  side: 'w' as Side
});

const MoveViewer = () => {

  let {currentIndex, moves, side: _} = useContext(MoveNavigationContext);
  moves = ["...", ...moves]

  return (
    <div className="move-viewer">
      {moves.map((move, index) => (
        <div
          key={index}
          className={`move ${index === currentIndex ? 'highlighted' : ''}`}
        >
          {move}
        </div>
      ))}
    </div>
  );
};

export default MoveViewer;
