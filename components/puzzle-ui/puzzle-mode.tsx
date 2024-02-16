'use client';
import { Puzzle } from "@/types/lichess-api";
import React, { useState } from "react";
import PuzzleBoard from "./puzzle-board";

const MIN_LOCAL_BATCH_LEN = 5;

interface PuzzleModeProps {
  initialPuzzleBatch: Array<Puzzle>
}

export const wrapperStyle = {
  width: `70vw`,
  maxWidth: '70vh',
  margin: '3rem auto',
}
export const EVENTS = { // grouped by the intended emitter
  PuzzleBoard: {
    PUZZLE_SOLVED: "puzzleSolved",
    INCORRECT_MOVE: "puzzleIncorrect",
    CORRECT_MOVE: "puzzleCorrect"
  },
  Controller: {
    FIRST_MOVE: "firstMove",
    PREV_MOVE: "prevMove",
    NEXT_MOVE: "nextMove",
    LAST_MOVE: "lastMove"
  }
}

export const PuzzleContext = React.createContext({
  submitNextPuzzle: (success: boolean) => {},
  getNextPuzzle: () => {},
})

const PuzzleMode: React.FC<PuzzleModeProps> = ({initialPuzzleBatch}) => {

  /** PUZZLE CODE */
  const [puzzleBatch, setPuzzleBatch] = useState<Array<Puzzle>>(initialPuzzleBatch);
  const [puzzle, setPuzzle] = useState<Puzzle | undefined>(puzzleBatch[0]);
  if (!puzzleBatch) return "All done!"

  // submit the puzzle success/failure to the server
  const submitNextPuzzle = (success: boolean) => {
    fetch(`/api/puzzle/submit`, {
      method: 'POST',
      body: JSON.stringify({ puzzleId: puzzleBatch[0]?.PuzzleId, success: success })
    });
  }

  // get the next puzzle
  const getNextPuzzle = () => {
    setPuzzle(puzzleBatch[1]);
    setPuzzleBatch(puzzleBatch.slice(1));
    if (puzzleBatch.length < MIN_LOCAL_BATCH_LEN) {
      const alreadyBatched = puzzleBatch;
      fetch(`/api/puzzle/nextbatch?exceptions=${alreadyBatched}`)
      .then((res) => res.json())
      .then((res) => res.puzzles as Array<Puzzle>)
      .then((puzzles: Array<Puzzle>) => {
        setPuzzleBatch([...puzzleBatch, ...puzzles]);
      });
    }
  }
  
  return (
    <div style={wrapperStyle}>
      <PuzzleContext.Provider value={{submitNextPuzzle, getNextPuzzle}}>
        <PuzzleBoard puzzle={puzzle}/>
      </PuzzleContext.Provider>
    </div>
  )
}
export default PuzzleMode;