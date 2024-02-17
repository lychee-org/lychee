'use client';
import { Puzzle } from "@/types/lichess-api";
import React, { useState, useMemo, useEffect } from "react";
import PuzzleBoard from "./puzzle-board";
import Rating from "@/rating/GlickoV2Rating";

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
  submitNextPuzzle: (success: boolean, prv: Rating): Promise<Rating> => { throw new Error() },
  getNextPuzzle: () => { },
})

const PuzzleMode: React.FC<PuzzleModeProps> = ({ initialPuzzleBatch }) => {

  /** PUZZLE CODE */
  const [puzzleBatch, setPuzzleBatch] = useState<Array<Puzzle>>(initialPuzzleBatch);
  const [puzzle, setPuzzle] = useState<Puzzle | undefined>(puzzleBatch[0]);
  if (!puzzleBatch) return "All done!"

  // submit the puzzle success/failure to the server
  const submitNextPuzzle = async (success: boolean, prv: Rating): Promise<Rating> =>
    fetch(`/api/puzzle/submit`, {
      method: 'POST',
      body: JSON.stringify({ puzzle_: puzzleBatch[0], success_: success, prv_: prv })
    }).then(response => response.text()).then(s => JSON.parse(s) as Rating)

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
      <PuzzleContext.Provider value={{ submitNextPuzzle, getNextPuzzle }}>
        <PuzzleBoard puzzle={puzzle} />
      </PuzzleContext.Provider>
    </div>
  )
}
export default PuzzleMode;
