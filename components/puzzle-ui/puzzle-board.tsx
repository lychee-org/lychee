'use client';

import { Chess, Move, Square } from 'chess.js';
import { useContext, useEffect, useMemo, useState } from 'react';
import { PuzzleContext, RatingHolder } from './puzzle-mode';
import LoadingBoard from './loading-board';
import React from 'react';
import ChessboardWrapped from './chessboard-wrapped';
import ControlButtonBar, { PlaybackControllerContext } from './controls/control-bar-button';
import MoveViewer, { MoveNavigationContext } from './controls/move-viewer';
import { Puzzle } from '@/types/lichess-api';
import "./puzzle-board-ui.css";
import RatingComponent from './controls/rating';
import DisplayBox from './controls/display-box';

interface PuzzleBoardProps {
  puzzle?: Puzzle;
  initialRating: RatingHolder;
}
// set its props to be the puzzle object
const PuzzleBoard: React.FC<PuzzleBoardProps> = ({ puzzle, initialRating }) => {
  const { submitNextPuzzle: submitPuzzle, getNextPuzzle } = useContext(PuzzleContext);
  const line = puzzle?.Moves.split(' ') ?? [];
  const side = puzzle?.FEN.split(' ')[1] === 'w' ? 'b' : 'w';

  // game state
  const game = useMemo(() => new Chess(puzzle?.FEN), [puzzle]);
  const [fen, setFen] = useState(game.fen());
  const [linePos, setLinePos] = useState(0);

  // mode related state
  const [rendered, setRendered] = useState(false);
  const [solved, setSolved] = useState<boolean>(false); 
  const [playbackPos, setPlaybackPos] = useState(0);
  const [wrong, setWrong] = useState<boolean>(false);
  const [lastMoveWrong, setLastMoveWrong] = useState<boolean>(false);
  

  // extra playback state
  const [fens, setFens] = useState([game.fen()]);

  // user's rating
  const [rating, setRating] = useState<RatingHolder>(initialRating);

  // calculated modes
  const playbackMode = playbackPos !== linePos || solved;
  const inPlay = rendered && !playbackMode && !solved;
  const interactive = inPlay && linePos % 2 === 1;

  /** OVERALL RESET */
  const loadPuzzle = () => {
    if (puzzle) game.load(puzzle.FEN);
    setSolved(false);
    if (puzzle) setFens([puzzle.FEN]);
    if (puzzle) setFen(puzzle.FEN);
    setPlaybackPos(0);
    setLinePos(0);
    setWrong(false);
    setLastMoveWrong(false);
  };

  useEffect(() => {
    loadPuzzle();
  }, [puzzle])

  // memoized functions for playback
  // playback
  const firstMove = useMemo(() => (() => setPlaybackPos(0)), [setPlaybackPos]);
  const lastMove = useMemo(() => (() => setPlaybackPos(linePos)), [setPlaybackPos, linePos]);
  const nextMove = useMemo(() => (() => setPlaybackPos(pos => Math.min(linePos, pos + 1))), [setPlaybackPos, linePos, playbackPos]);
  const prevMove = useMemo(() => (() => setPlaybackPos(pos => Math.max(0, pos - 1))), [setPlaybackPos, playbackPos]);

  /** PLAYBACK MODE */
  useEffect(() => {
    if (playbackMode) setFen(fens[playbackPos]);
    else setFen(game.fen());
  }, [playbackMode, playbackPos, fens, linePos]);


  // MOVEMENT
  // try the bot's first move after rendering
  useEffect(() => {
    if (rendered && linePos === 0) {
      const timeout = setTimeout(botMove, 400);
      return () => clearTimeout(timeout);
    };
  });

  // bot move
  function botMove() {
    if (inPlay && linePos < line.length) {
      game.move(line[linePos]);
      setFen(game.fen());
      setLastMoveWrong(false);
      setFens(prev => [...prev, game.fen()]);
      setLinePos((prev) => prev + 1);
      setPlaybackPos((prev) => prev + 1);
    }
  }

  const playerMoveCallback = (from: Square, to: Square, promotion?: string) => {
    game.move({ from: from, to: to, promotion: promotion });
    console.log(game.fen());
    setFen(game.fen());
    setFens(prev => [...prev, game.fen()]);
    setLinePos(prev => prev + 1);
    setPlaybackPos((prev) => prev + 1);
  }

  /** HANDLE PLAYER MOVE VERIFICATION */
  function undoWrongMove() {
    if (submitPuzzle && !wrong) {
      submitPuzzle(false, rating).then(r => setRating(r));
      setWrong(true);
    }
    game.undo();
    setFen(game.fen());
    setLastMoveWrong(true);
    setFens(prev => prev.slice(0, -1));
    setLinePos(prev => prev - 1);
    setPlaybackPos(prev => prev - 1);
  }

  // player moved correctly
  function correctMove() {
    const timeout = setTimeout(botMove, 300); // start up the bot's move
    return () => clearTimeout(timeout);
  }

  // player finished puzzle
  function finishedGame() {
    if (submitPuzzle && !wrong) {
      submitPuzzle(true, rating).then(r => setRating(r))
    }
    setSolved(true);
  }

  useEffect(() => {
    if (inPlay && !interactive && linePos > 0) {
      if (game.history({ verbose: true }).pop()?.lan !== line[linePos - 1])
        setTimeout(undoWrongMove, 300);
      else if (linePos >= line.length) finishedGame();
      else return correctMove(); // there's a timeout here so we should return it
      return;
    }
  });

  if (!puzzle) return < LoadingBoard />;

  /** VIEW SOLUTION / GIVE UP */
  const viewSolution = () => {
    if (rendered && !solved) {
      if (!wrong) {
        submitPuzzle(false, rating).then(r => setRating(r));
      }
      setWrong(true);
      setSolved(true);

      // set the line position to the end maintaining the playback position
      setLinePos(line.length);

      // update the game
      let newFens: Array<string> = [];
      line.slice(playbackPos).forEach(move => {
        game.move(move);
        newFens.push(game.fen());
      });
      setFens([...fens, ...newFens]);

      // move the game forward by 1
      setPlaybackPos(prev=>prev+1);
    }
  }

  /** PUZZLE LOGIC **/
  // RENDERED CALLBACK
  const renderedCallback = () => {
    if (!rendered) setRendered(true);
    return {};
  }

  // last move for highlighting
  const lastMoveToHighlight: Move | undefined = game.history({ verbose: true }).find((_, i) => i === playbackPos - 1); 

  return (
    <div className="chessboard-container">
      <div className="chessboard">
        <ChessboardWrapped
          side={side}
          fen={fen}
          lastMove={lastMoveToHighlight}
          interactive={interactive}
          updateGame={interactive ? playerMoveCallback : (() => { })}
          renderedCallback={rendered ? (() => { return; }) : renderedCallback}
        />
      </div>
      <div className="control-panel">
        <div className="rating-container bg-card"><RatingComponent rating={rating.rating} /></div>
        <div className='move-viewer-container'>
            <div className='fromGameHeader bg-controller hover:bg-controller-light'>Puzzle #{puzzle.PuzzleId}</div> 
            <MoveNavigationContext.Provider value={{currentIndex: playbackPos, moves: game.history(), side}}>
              <MoveViewer />
            </MoveNavigationContext.Provider> 
            <PlaybackControllerContext.Provider value={{firstMove, prevMove, nextMove, lastMove}}>
              <ControlButtonBar />
            </PlaybackControllerContext.Provider>
        </div>
        <div className='displayBox bg-card'>
          <DisplayBox lastMoveWrong={lastMoveWrong} solved={solved} linePos={linePos} side={side} viewSolution={viewSolution}/>
        </div>
      </div>
      <div>
      </div>  
    </div>
  );
};

export default React.memo(PuzzleBoard);
