'use client';
import { Puzzle } from "@/types/lichess-api";
import React, { useState, useMemo, useEffect } from "react";
import PuzzleBoard from "./puzzle-board";
import { PuzzleWithUserRating } from "@/app/api/puzzle/nextPuzzle/nextFor";

export type RatingHolder = {
  rating: number,
  ratingDeviation: number,
  volatility: number,
  numberOfResults: number
}

interface PuzzleModeProps {
  initialPuzzle: Puzzle,
  initialRating: RatingHolder
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
  submitNextPuzzle: (success: boolean, prv: RatingHolder): Promise<RatingHolder> => { throw new Error() },
  getNextPuzzle: () => { },
})

const PuzzleMode: React.FC<PuzzleModeProps> = ({ initialPuzzle, initialRating }) => {
  /** PUZZLE CODE */
  const [puzzle, setPuzzle] = useState<Puzzle>(initialPuzzle);
  const [rating, setRating] = useState<RatingHolder>(initialRating);

  // TODO: handle when no more puzzles.

  // submit the puzzle success/failure to the server
  const submitNextPuzzle = (success: boolean, prv: RatingHolder): Promise<RatingHolder> =>
    fetch(`/api/puzzle/submit`, {
      method: 'POST',
      body: JSON.stringify({ puzzle_: puzzle, success_: success, prv_: prv })
    }).then(response => response.text()).then(s => JSON.parse(s) as RatingHolder)

  // get the next puzzle
  const getNextPuzzle = () => {
    fetch(`/api/puzzle/nextPuzzle`, {
      method: 'GET'
    }).then(response => response.text()).then(s => JSON.parse(s) as PuzzleWithUserRating).then(response => {
      setPuzzle(response.puzzle);
      setRating(response.rating);
    })
  }

  return (
    <div style={wrapperStyle}>
      <PuzzleContext.Provider value={{ submitNextPuzzle, getNextPuzzle }}>
        <PuzzleBoard puzzle={puzzle} initialRating={rating} />
      </PuzzleContext.Provider>
    </div>
  )
}

export default PuzzleMode;
