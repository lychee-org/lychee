'use client';
import { Puzzle } from "@/types/lichess-api";
import React, { useEffect, useState } from "react";
import PuzzleBoard from "./puzzle-board";
import { UserInfo } from "@/app/api/user/info/route";
import UserContext from "../auth/usercontext";

const MIN_LOCAL_BATCH_LEN = 5;

interface PuzzleModeProps {
  initialPuzzleBatch: Array<Puzzle>,
  userInfo?: UserInfo
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

const PuzzleMode: React.FC<PuzzleModeProps> = ({initialPuzzleBatch, userInfo}) => {
  /** GET USER CONTEXT */
  const [user, setUser] = useState<UserInfo | null>(null);
  useEffect(() => {
    if (!userInfo)
      fetch(`/api/user/info`)
      .then(res => res.json())
      .then(res => setUser(res))
    else setUser(userInfo);
  }, []);

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
    if (puzzleBatch.length < MIN_LOCAL_BATCH_LEN) {
      const alreadyBatched = puzzleBatch.map(p=>p.PuzzleId);
      fetch(`/api/puzzle/nextbatch?exceptions=${alreadyBatched}`)
        .then((res) => res.json())
        .then((res) => res.puzzles as Array<Puzzle>)
        .then((puzzles: Array<Puzzle>) => {
          console.log(puzzles);
          setPuzzleBatch([...puzzleBatch, ...puzzles]);
        });
    }
    setPuzzle(puzzleBatch[1]);
    setPuzzleBatch(puzzleBatch.slice(1));
  }
  
  return (
    <div style={wrapperStyle}>
      <UserContext.Provider value={user}>
        <PuzzleContext.Provider value={{submitNextPuzzle, getNextPuzzle}}>
          <PuzzleBoard puzzle={puzzle}/>
        </PuzzleContext.Provider>
      </UserContext.Provider>
    </div>
  )
}
export default PuzzleMode;