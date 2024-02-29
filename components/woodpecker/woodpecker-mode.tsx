'use client';

import { Puzzle } from "@/types/lichess-api";
import React, { CSSProperties, useState } from "react";
import PuzzleBoard from "../puzzle-ui/puzzle-board";
import { PuzzleContext, RatingHolder, wrapperStyle } from "../puzzle-ui/puzzle-mode";

interface WoodpeckerModeProps {
  initialPuzzles: Puzzle[],
  initialRating: RatingHolder,
  callback: () => void
}

const WoodPeckerMode: React.FC<WoodpeckerModeProps> = ({ initialPuzzles, initialRating, callback }) => {
  const [puzzle, setPuzzle] = useState<Puzzle | undefined>(initialPuzzles[0]);
  const [puzzles, setPuzzles] = useState<Puzzle[]>(initialPuzzles);

  const submitNextPuzzle = (_success: boolean, _prv: RatingHolder): Promise<RatingHolder> => 
    Promise.resolve(_prv);

  const getNextPuzzle = () => {
    if (puzzles.length === 1) {
      callback();
      return
    }
    setPuzzle(puzzles[1]);
    setPuzzles(puzzles.slice(1));
  }

  return (
    <div style={wrapperStyle as CSSProperties}>
      <PuzzleContext.Provider value={{ submitNextPuzzle, getNextPuzzle }}>
        <PuzzleBoard puzzle={puzzle} initialRating={initialRating} />
      </PuzzleContext.Provider>
    </div>
  )
}

export default WoodPeckerMode;