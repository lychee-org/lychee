import React, { useState, useEffect, useContext } from 'react';
import './move-viewer.css';

type Side = 'w' | 'b';

export const MoveNavigationContext = React.createContext({
  currentIndex: 0,
  moves: ['...'],
  side: 'w' as Side
});

const MoveViewer = () => {
  const renderMoves = () => {
    const rows = []
    for (let i = 0; i < moves.length; i+=2) {
       let row = []
       row.push(<td key={i}className={`moveFirstChild ${i === currentIndex ? 'highlighted' : ''}`}>{moves[i]} </td>)
       row.push(<td key={i + 1}className={`moveSecondChild ${i + 1 === currentIndex ? 'highlighted' : ''}`}>{i + 1 < moves.length ? moves[i + 1] : ""} </td>)
       rows.push(<tr>{row}</tr>);
     }
    return rows;
 }

  let {currentIndex, moves, side: _} = useContext(MoveNavigationContext);

  return (
    <div className="move-viewer">
      {renderMoves()}
    </div>
  );
};

export default MoveViewer;
