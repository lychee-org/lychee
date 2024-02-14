'use client';

import { Puzzle } from '@/types/lichess-api';
import { Chess, Square } from 'chess.js';
import { useEffect, useMemo, useState } from 'react';
import { Chessboard } from 'react-chessboard';
import {
  CustomPieces,
  CustomSquareStyles,
  Piece,
} from 'react-chessboard/dist/chessboard/types';

const buttonStyle = {
  cursor: 'pointer',
  padding: '10px 20px',
  margin: '10px 10px 0px 0px',
  borderRadius: '6px',
  backgroundColor: '#f0d9b5',
  border: 'none',
  boxShadow: '0 2px 5px rgba(0, 0, 0, 0.5)',
};

const boardWrapper = {
  width: `70vw`,
  maxWidth: '70vh',
  margin: '3rem auto',
};

function useEffectAllDepsChange(fn: any, deps: any) {
  const [changeTarget, setChangeTarget] = useState(deps);

  useEffect(() => {
    setChangeTarget((prev: any[]) => {
      if (prev.every((dep, i) => dep !== deps[i])) {
        return deps;
      }

      return prev;
    });
  }, [deps]);

  useEffect(fn, changeTarget);
}

export default function PuzzleBoard({ puzzles }: { puzzles: Array<Puzzle>; }) {
  const [solved, setSolved] = useState<number>(0);
  const [puzzle, setPuzzle] = useState<Puzzle>(puzzles[solved]);
  const [game, setGame] = useState<Chess>(new Chess(puzzle.FEN));
  const [fen, setFen] = useState(game.fen());
  const [rightClickedSquares, setRightClickedSquares] = useState<CustomSquareStyles>({});
  const [optionSquares, setOptionSquares] = useState<CustomSquareStyles>({});
  const [line, setLine] = useState(puzzle.Moves.split(' '));
  const [side, setSide] = useState(puzzle.FEN.split(' ')[1] === 'w' ? 'b' : 'w');
  const [linePos, setLinePos] = useState(0);

  useEffect(() => { setPuzzle(puzzles[solved]); }, [solved]);
  useEffect(() => {
    setGame(new Chess(puzzle.FEN));
    setFen(puzzle.FEN);
    setLine(puzzle.Moves.split(' '));
    setSide(puzzle.FEN.split(' ')[1] === 'w' ? 'b' : 'w');
    setRightClickedSquares({});
    setOptionSquares({});
  }, [puzzle]);
  // Wait till all are updated. Otherwise bot will move prematurely.
  useEffectAllDepsChange(() => { setLinePos(0); }, [game, fen, line, side, rightClickedSquares, optionSquares]);

  // TODO.
  const reset = () => {
    setPuzzle(puzzles[solved]);
    setGame(new Chess(puzzle.FEN));
    setFen(game.fen());
    setRightClickedSquares({});
    setOptionSquares({});
    setLine(puzzle.Moves.split(' '));
    setSide(puzzle.FEN.split(' ')[1] === 'w' ? 'b' : 'w');
    setLinePos(0);
  };

  const pieces: Piece[] = [
    'wP',
    'wN',
    'wB',
    'wR',
    'wQ',
    'wK',
    'bP',
    'bN',
    'bB',
    'bR',
    'bQ',
    'bK',
  ];

  const customPieces = useMemo(() => {
    const pieceComponents: CustomPieces = {};
    pieces.forEach((piece) => {
      pieceComponents[piece] = ({ squareWidth }: { squareWidth: number }) => (
        <div
          style={{
            width: squareWidth,
            height: squareWidth,
            backgroundImage: `url(https://images.chesscomfiles.com/chess-themes/pieces/neo/150/${piece.toLowerCase()}.png)`,
            backgroundSize: '100%',
          }}
        />
      );
    });
    return pieceComponents;
  }, []);

  const botMove = () => {
    // verify last move by user was correct according to line.
    // if it was incorrect then undo the move
    if (linePos > 0 && game.history({ verbose: true }).pop()?.lan !== line[linePos - 1]) {
      game.undo();
      setFen(game.fen());
      setLinePos((prev) => prev - 1);
      return;
    }
    // if it was correct bot move the next move in the line
    if (linePos < line.length) {
      game.move(line[linePos]);
      setFen(game.fen());
      setLinePos((prev) => prev + 1);
    } else {
      console.log("Done!");
      setSolved(previous => previous + 1);
    }
  };

  const lastMoveHighlight = () => {
    const moves = game.history({ verbose: true });
    const lastMove = moves[moves.length - 1];
    if (lastMove) {
      return {
        [lastMove.from]: {
          background: 'rgba(0, 255, 0, 0.4)',
        },
        [lastMove.to]: {
          background: 'rgba(0, 255, 0, 0.4)',
        },
      };
    }
  };

  const onDrop = (sourceSquare: Square, targetSquare: Square, piece: Piece) => {
    try {
      game.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: piece[1].toLowerCase() ?? 'q',
      });
      setFen(game.fen());
      setOptionSquares({});
      setLinePos((prev) => prev + 1);
      return true;
    } catch {
      return false;
    }
  };

  const getMoveOptions = (square: Square) => {
    if (!game.get(square) || game.get(square).color !== side) {
      setOptionSquares({});
      return false;
    }
    const moves = game.moves({
      square,
      verbose: true,
    });
    const newSquares: { [key: string]: { background: string; borderRadius?: string }; } = {};
    moves.map((move) => {
      newSquares[move.to] = {
        background:
          game.get(move.to) &&
            game.get(move.to).color !== game.get(square).color
            ? 'radial-gradient(circle, rgba(0,0,0,.1) 85%, transparent 85%)'
            : 'radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)',
        borderRadius: '50%',
      };
      return move;
    });
    newSquares[square] = {
      background: 'rgba(255, 255, 0, 0.4)',
    };
    setOptionSquares(newSquares);
    return true;
  };

  const onPieceDragBegin = (_: Piece, sourceSquare: Square) => {
    setRightClickedSquares({});
    getMoveOptions(sourceSquare);
  };

  const onSquareClick = (square: Square) => {
    setRightClickedSquares({});
    getMoveOptions(square);
  };

  const onSquareRightClick = (square: Square) => {
    const colour = 'rgba(0, 0, 255, 0.4)';
    if (square in rightClickedSquares) {
      delete rightClickedSquares[square];
      setRightClickedSquares({ ...rightClickedSquares });
    } else {
      setRightClickedSquares({
        ...rightClickedSquares,
        [square]: { backgroundColor: colour },
      });
    }
  };

  const onPromotionCheck = (sourceSquare: Square, targetSquare: Square, _: Piece) => {
    const moves = game.moves({
      square: sourceSquare,
      verbose: true,
    });
    const foundMove = moves.find((m) => m.from === sourceSquare && m.to === targetSquare);
    return !!foundMove &&
      ((foundMove.color === 'w' &&
        foundMove.piece === 'p' &&
        targetSquare[1] === '8') ||
        (foundMove.color === 'b' &&
          foundMove.piece === 'p' &&
          targetSquare[1] === '1'));
  }

  // move bot after user
  useEffect(() => {
    if (linePos % 2 === 0) {
      const timeout = setTimeout(botMove, 300);
      return () => {
        clearTimeout(timeout);
      };
    }
  }, [linePos]);

  return (
    <div style={boardWrapper}>
      Solved = {solved}
      <Chessboard
        animationDuration={200}
        boardOrientation={side === 'w' ? 'white' : 'black'}
        position={fen}
        isDraggablePiece={({ piece }) => piece[0] === side}
        onPieceDragBegin={onPieceDragBegin}
        onPieceDrop={onDrop}
        onSquareClick={onSquareClick}
        onSquareRightClick={onSquareRightClick}
        onPromotionCheck={onPromotionCheck}
        customBoardStyle={{
          borderRadius: '4px',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
        }}
        customSquareStyles={{
          ...optionSquares,
          ...lastMoveHighlight(),
          ...rightClickedSquares,
        }}
        customPieces={customPieces}
      />
      <button style={buttonStyle} onClick={reset}>
        Reset Puzzle
      </button>
    </div>
  );
}
