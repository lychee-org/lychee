import { Puzzle } from "@/types/lichess-api";
import { Popover, PopoverContent, PopoverTrigger } from '../../ui/popover';
import React from "react";
import StaticBoard from "../static-board";
import { Button } from "@/components/ui/button";

const hintMode = ( similar: Puzzle[] ) => {
  return (
    <React.Fragment>
      <p className='text-sm'>View a similar puzzle:</p>
      <Popover>
        <PopoverTrigger asChild>
          <Button size='sm'>Show</Button>
        </PopoverTrigger>
        <PopoverContent className={`p-2 ${!similar ? 'w-fit' : ''}`}>
          {similar && similar.length > 0 ? (
            similar.map((p) => (
              <StaticBoard key={p.PuzzleId} puzzle={p} />
            ))
          ) : (
            <p className='text-center'>Non review puzzle</p>
          )}
        </PopoverContent>
      </Popover>
    </React.Fragment>
  );
};

const noHintMode = () => <p className="text-sm"><i>No hints available</i></p>

const solvedMode = (puzzle: Puzzle) => {
  const openAnalysisBoard = () => {
    // window.open(
    //   `https://lichess.org/analysis/${puzzle.FEN}`,
    //   '_blank'
    // )
    window.open(
      `https://lichess.org/training/${puzzle.PuzzleId}`,
      '_blank'
    )
  }
  return (
    <React.Fragment>
      <p className='text-sm'>View in Lichess:</p>
      <Button size="sm" onClick={openAnalysisBoard}>Analyse</Button>
    </React.Fragment>
  );
}

const PuzzleHintBox = ({ similar, puzzle, solved }: { similar?: Puzzle[] , puzzle: Puzzle, solved: boolean }) => {
  const mode = () => {
    if (similar && similar.length > 0) {
      return hintMode(similar);
    } else if (solved) {
      return solvedMode(puzzle);
    } 
    return noHintMode();
  };
  return (
    <div className='flex bg-controller rounded-lg p-2 pl-4 justify-between items-center'>
      {mode()}
    </div>
  )
}

export default PuzzleHintBox;
