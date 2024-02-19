'use client';

import { Puzzle } from "@/types/lichess-api";
import { buttonStyle } from "../puzzle-ui/controls/reset-puzzle-button";
import { RatingHolder } from "../puzzle-ui/puzzle-mode";
import { useState } from "react";
import WoodPeckerMode from "./woodpecker-mode";

interface Props {
  rating: RatingHolder
}

const randomShuffle = (arr: any[]) => {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

const WoodpeckerLoader: React.FC<Props> = ({ rating }) => {
  const [puzzles, setPuzzles] = useState<Puzzle[]>([]);

  const newBatch = async () => {
    // This will find puzzles, persisting them in AllRound and in LastBatch.
    // TODO: which of these do we want to do on (1) now, (2) mode completion, (3) puzzle completion? 
    // (Should just be the callback to WoodPeckerMode for (2), and submitNextPuzzle within the mode for (3))
    await fetch(`/api/puzzle/nextBatch`, {
      method: 'GET'
    }).then(response => response.text()).then(s => JSON.parse(s) as Puzzle[]).then(response => {
      setPuzzles(response);
    })
  }

  const sameReview = async () => {
    // We need not persist anything since the batch is the same as before!
    await fetch(`/api/puzzle/lastBatch`, {
      method: 'GET'
    }).then(response => response.text()).then(s => JSON.parse(s) as Puzzle[]).then(response => {
      console.log(`response: ${response}`)
      if (response.length === 0) {
        console.log("No puzzles to review.");
        return;
      }
      randomShuffle(response);
      setPuzzles(response);
    })
  }

  const similarReview = async () => {
    // This will find similar puzzles, persisting them in AllRound and in LastBatch.
    await fetch(`/api/puzzle/similarBatch`, {
      method: 'GET'
    }).then(response => response.text()).then(s => JSON.parse(s) as Puzzle[]).then(response => {
      console.log(`response: ${response}`)
      if (response.length === 0) {
        console.log("No puzzles to review.");
        return;
      }
      // TODO: uncomment! Just for debugging.
      // randomShuffle(response);
      setPuzzles(response);
    })
  }

  return (
    puzzles.length === 0 ?
    <div>
    <button style={buttonStyle} onClick={newBatch}>New batch</button>
    <button style={buttonStyle} onClick={similarReview}>Review similar puzzles to previous batch</button>
    <button style={buttonStyle} onClick={sameReview}>Review same puzzles as previous batch</button>
    </div>
    :
    <WoodPeckerMode initialPuzzles={puzzles} initialRating={rating} callback={() => setPuzzles([])} />
  )
}

export default WoodpeckerLoader;
