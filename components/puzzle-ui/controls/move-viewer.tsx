import React, { useState, useEffect, useContext } from 'react';
import './move-viewer.css';

type Side = 'w' | 'b';

export const MoveNavigationContext = React.createContext({
  currentIndex: 0,
  moves: ['...'],
  side: 'w' as Side
});


const MoveViewer = () => {
  let {currentIndex, moves, side} = useContext(MoveNavigationContext);
  if(side === 'w') {
    moves = ["...", ...moves]
  }

  const renderMoves = () => {
    const rows = []
    for(let i = 0; i <= 4; i++) {
      rows.push(<tr className="move-table-row" key={`move-table-empty-row-${i}`}><td className="moveFirstChild"></td><td className="moveSecondChild"></td></tr>)
    }
    for (let i = 0; i < moves.length; i+=2) {
       let row = [];
       let key = `move-viewer-row-${i}`;
       row.push(<td key={i}className={`moveFirstChild ${i === currentIndex - (side === "w" ? 0 : 1) ? 'highlighted' : ''}`}>{moves[i]} </td>);
       row.push(<td key={i + 1}className={`moveSecondChild ${i + 1 === currentIndex - (side === "w" ? 0 : 1) ? 'highlighted' : ''}`}>{i + 1 < moves.length ? moves[i + 1] : ""}</td>);
       rows[i/2] = (<tr className="move-table-row" key={key}>{row}</tr>);
     }
    return rows;
 }

  return (
   <div className="scrollable-container" >
      <table className="move-viewer">
        <tbody>
          {renderMoves()}
        </tbody>
      </table>
   </div>
  );
};

export default MoveViewer;
