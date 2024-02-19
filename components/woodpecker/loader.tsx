'use client';

import { Puzzle } from "@/types/lichess-api";
import { buttonStyle } from "../puzzle-ui/controls/reset-puzzle-button";
import { RatingHolder } from "../puzzle-ui/puzzle-mode";
import { useState } from "react";
import WoodPeckerMode from "./woodpecker-mode";

interface Props {
  rating: RatingHolder
}

const WoodpeckerLoader: React.FC<Props> = ({ rating }) => {
  const [puzzles, setPuzzles] = useState<Puzzle[]>([]);
  const onPress = () => {
    fetch(`/api/puzzle/nextPuzzles`, {
      method: 'GET'
    }).then(response => response.text()).then(s => JSON.parse(s) as Puzzle[]).then(response => {
      console.log(response);
      setPuzzles(response);
    })
  }
  return (
    puzzles.length === 0 ?
    <button style={buttonStyle} onClick={onPress}>Start Pecking!</button>
    :
    <WoodPeckerMode initialPuzzles={puzzles} initialRating={rating} callback={() => setPuzzles([])} />
  )
}

export default WoodpeckerLoader;
