'use client';

import { Puzzle } from '@/types/lichess-api';
import { Chess, Square, Piece as ChessjsPiece } from 'chess.js';
import { ReactNode, createRef, useEffect, useMemo, useState } from 'react';
import { Chessboard, ClearPremoves } from 'react-chessboard';
import {
  CustomPieces,
  CustomSquareStyles,
  Piece
} from 'react-chessboard/dist/chessboard/types';
import ControlBar from './controlbar/control-bar';
import { set } from 'mongoose';

const buttonStyle = {
  cursor: 'pointer',
  padding: '10px 20px',
  margin: '10px 10px 0px 0px',
  borderRadius: '6px',
  backgroundColor: '#f0d9b5',
  border: 'none',
  boxShadow: '0 2px 5px rgba(0, 0, 0, 0.5)',
};

const inputStyle = {
  padding: '10px 20px',
  margin: '10px 0 10px 0',
  borderRadius: '6px',
  border: 'none',
  boxShadow: '0 2px 5px rgba(0, 0, 0, 0.5)',
};

const boardWrapper = {
  width: `70vw`,
  maxWidth: '70vh',
  margin: '3rem auto',
};

const chessjs_piece_convert = (piece: ChessjsPiece) => (piece.color + piece.type.toUpperCase()) as Piece;

interface PuzzleBoardProps {
  puzzle: Puzzle;
  callback: () => void;
}

// set its props to be the puzzle object
const PuzzleBoard: React.FC<PuzzleBoardProps> = ({ puzzle, callback}) =>  {
  const game = useMemo(() => new Chess(puzzle.FEN), []);
  const [fen, setFen] = useState(game.fen());
  const [rightClickedSquares, setRightClickedSquares] =
    useState<CustomSquareStyles>({});
  const [optionSquares, setOptionSquares] = useState<CustomSquareStyles>({});
  const [interactedSquare, setInteractedSquare] = useState<CustomSquareStyles>({});
  const [moveFrom, setMoveFrom] = useState<Square | null>(null);
  const removePremoveRef = createRef<ClearPremoves>();
  let output: ReactNode | null = null;
  // some stuff for the control bar
  const [moveViewerMove, setMoveViewerMove] = useState(0);
  const [fens, setFens] = useState([game.fen()]);
  const [displayText, setDisplayText] = useState('');

  // TODO(sm3421).
  const [line, setLine] = useState(puzzle.Moves.split(' '));
  const [side, setSide] = useState(puzzle.FEN.split(' ')[1] === 'w' ? 'b' : 'w');

  const [linePos, setLinePos] = useState(0);

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

  const hoveredSquareStyle: Record<string, string|number> = {
    background: "rgba(255, 255, 0, 0.4)",
  };

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

  function firstBotMove() {
    // hack that waits for the removePremoveRef to be defined
    // this works because the ref is defined after the most
    // computationally intensive part (diff checking) is done
    if (removePremoveRef.current === undefined) {
      // retry until ref is defined
      let timeout = setTimeout(() => {
        firstBotMove();
      }, 100);
      return () => clearTimeout(timeout);
    }
    let timeout = setTimeout(() => {
      game.move(line[linePos]);
      setFen(game.fen());
      setFens(prev=>[...prev, game.fen()]);
      setLinePos(1);
      setMoveViewerMove(1);
    }, 300);
    return () => clearTimeout(timeout);
  }

  useEffect(() => {
    if (moveViewerMove !== linePos) {
      setFen(fens[moveViewerMove]);
      setOptionSquares({});
      setInteractedSquare({});
      setMoveFrom(null);
    } else {
      setFen(game.fen());
    }
  })

  // move bot after user
  useEffect(() => {
    if (linePos === 0) {
      return firstBotMove();
    } else if (linePos % 2 === 0) {
      return verifyPlayerMove(() => {
        const timeout = setTimeout(botMove, 400);
        return () => clearTimeout(timeout);
      });
    }
  }, [linePos]);

  const loadPuzzle = () => {
    game.load(puzzle.FEN);
    setFen(game.fen());
    setOptionSquares({});
    setRightClickedSquares({});
    setSolved(false);
    setLine(puzzle.Moves.split(' '));
    setSide(puzzle.FEN.split(' ')[1] === 'w' ? 'b' : 'w');
    setLinePos(0);
    console.log(fen)
    console.log(line)
  };

  const [solved, setSolved] = useState<boolean>(false);

  function verifyPlayerMove(successCallback?: () => (() => void)) {
    // callback only executed if the move was correct
    // verify last move by user was correct according to line.
    // if it was incorrect then undo the move
    if (linePos > 0 && game.history({ verbose: true }).pop()?.lan !== line[linePos - 1]) {
      setDisplayText('Incorrect move');
      const timeout = setTimeout(() => {
        game.undo();
        setFen(game.fen());
        setLinePos(prev => prev - 1);
        setMoveViewerMove(prev => prev - 1);
      }, 300);
      return ()=>{ clearTimeout(timeout) };
    }
    setDisplayText('Nice! Keep going...');
    setFens(prev=>[...prev, game.fen()]);
    if (successCallback) successCallback();
    return ()=>{};
  }

  function botMove() {
    // if it was correct bot move the next move in the line
    if (linePos < line.length) {
      game.move(line[linePos]);
      setFen(game.fen());
      setFens(prev=>[...prev, game.fen()]);
      setLinePos((prev) => prev + 1);
      setMoveViewerMove(prev=>prev+1);
    } else {
      // This is weird and hacky and also causes puzzle skips.
      // TODO: fix this.
      setSolved(true);
      setDisplayText('Puzzle solved');
    }
  }

  function lastMoveHighlight() {
    const moves = game.history({ verbose: true });
    const lastMove = moves[moveViewerMove - 1];
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
  }

  function onDrop(sourceSquare: Square, targetSquare: Square, piece: Piece) {
    if (linePos !== moveViewerMove) return false;
    try {
      game.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: piece[1].toLowerCase() ?? 'q',
      });
      setFen(game.fen());
      setOptionSquares({});
      setLinePos((prev) => prev + 1);
      setMoveViewerMove(prev => prev + 1);
      setMoveFrom(null);
      setInteractedSquare({});
      return true;
    } catch {
      return false;
    }
  }

  function getMoveOptions(square: Square) {
    if (!game.get(square) || game.get(square).color !== side) {
      setOptionSquares({});
      return false;
    }

    const moves = game.moves({
      square,
      verbose: true,
    });

    const newSquares: {
      [key: string]: { background: string; borderRadius?: string };
    } = {};
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
  }

  function onPieceDragBegin(_: Piece, sourceSquare: Square) {
    if (linePos !== moveViewerMove) return;
    setMoveFrom(sourceSquare);
    setRightClickedSquares({});
    getMoveOptions(sourceSquare);
  }

  function onPieceDragEnd() {
    setInteractedSquare({});
  }

  function onDragOverSquare(square: Square) {
    if (square === moveFrom) {
      setInteractedSquare({});
      return;
    }
    let possible_squares = moveFrom ? game.moves({ square: moveFrom, verbose: true }).map((move) => move.to) : [];
    if (possible_squares.includes(square)) {
      setInteractedSquare({ [square]: hoveredSquareStyle });
    } else {
      setInteractedSquare({});
    }
  }

  function onSquareClick(square: Square) {
    setRightClickedSquares({});
    if (linePos !== moveViewerMove) return;
    if (moveFrom && square === moveFrom) {
      setMoveFrom(null);
      setOptionSquares({});
    } else if (moveFrom && onDrop(moveFrom, square, chessjs_piece_convert(game.get(moveFrom)))) {
      setMoveFrom(null);
    } else {
      getMoveOptions(square);
      if (game.get(square) && game.get(square).color === side && square !== moveFrom) setMoveFrom(square);
      else setMoveFrom(null);
    }
  }

  function onMouseOutSquare(square: Square) {
    setInteractedSquare({});
  }

  function onMouseOverSquare(square: Square) {
    if (square === moveFrom) {
      setInteractedSquare({});
      return;
    }
    let possible_squares = moveFrom ? game.moves({ square: moveFrom, verbose: true }).map((move) => move.to) : [];
    if (possible_squares.includes(square)) {
      setInteractedSquare({ [square]: hoveredSquareStyle });
    } else {
      setInteractedSquare({});
    }
  }

  function onSquareRightClick(square: Square) {
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
  }

  function onPromotionCheck(
    sourceSquare: Square,
    targetSquare: Square,
    piece: Piece
  ) {
    const moves = game.moves({
      square: sourceSquare,
      verbose: true,
    });
    const foundMove = moves.find(
      (m) => m.from === sourceSquare && m.to === targetSquare
    );
    // not a valid move
    if (!foundMove) {
      return false;
    }

    // valid, check if promotion move
    return (
      (foundMove.color === 'w' &&
        foundMove.piece === 'p' &&
        targetSquare[1] === '8') ||
      (foundMove.color === 'b' &&
        foundMove.piece === 'p' &&
        targetSquare[1] === '1')
    );
  }

  return (
    <div style={boardWrapper}>
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
        onPieceDragEnd={onPieceDragEnd}
        onDragOverSquare={onDragOverSquare}
        onMouseOverSquare={onMouseOverSquare}
        onMouseOutSquare={onMouseOutSquare}
        customBoardStyle={{
          borderRadius: '4px',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
        }}
        customSquareStyles={{
          ...optionSquares,
          ...lastMoveHighlight(),
          ...rightClickedSquares,
          ...interactedSquare
        }}
        customDropSquareStyle={{}}
        customPieces={customPieces}
        ref={removePremoveRef}
      />
      <button style={buttonStyle} onClick={solved ? callback : loadPuzzle}>
        {solved ? 'Next Puzzle' : 'Reset Puzzle'}
      </button>
      <ControlBar moves={["...", ...line.slice(0, linePos)]} currentIndex={moveViewerMove} setIndex={setMoveViewerMove} display={displayText} />
    </div>
  );
};

export default PuzzleBoard;
