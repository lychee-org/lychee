import React, { useState, useEffect, useContext } from 'react';
import './move-viewer.css';
import { cn } from '@/lib/utils';

type Side = 'w' | 'b';

export const MoveNavigationContext = React.createContext({
  currentIndex: 0,
  moves: ['...'],
  side: 'w' as Side
});


const MoveViewer = () => {
  let {currentIndex, moves, side} = useContext(MoveNavigationContext);
  if (side === 'w') {
    moves = ["...", ...moves]
  }

  const renderMoves = (minRows: number) => {
    const rows = [];
    let currentMove = currentIndex - (side === "w" ? 0 : 1);
    let createRow = (i: number, val1: string, val2: string) => {
      return (
        <tr className="move-table-row odd:bg-tablerow-dark even:bg-tablerow-light divide-solid divide-x-2 divide-tablerow-divide" key={`move-viewer-row-${Math.floor(i/2)}`}>
          <td className={cn("moveChild", i === currentMove ? "highlighted" : "")}>{val1}</td><td className={cn("moveChild", i + 1 === currentMove ? "highlighted" : "")}>{val2}</td>
        </tr>
      )
    }
    for (let i = 0; i < Math.max(moves.length, minRows); i+=2)
      rows[i/2] = createRow(i, (i < moves.length) ? moves[i] : "", (i + 1 < moves.length) ? moves[i + 1] : "");
    return rows;
  }

  return (
   <div className="scrollable-container" >
      <table className="move-viewer">
        <tbody>
          {renderMoves(8)}
        </tbody>
      </table>
   </div>
  );
};

export default MoveViewer;
