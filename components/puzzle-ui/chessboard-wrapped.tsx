'use client';

import { Chess, Square, Piece as ChessjsPiece, Move } from 'chess.js';
import { createRef, useEffect, useMemo, useState } from 'react';
import { Chessboard, ClearPremoves } from 'react-chessboard';
import {
  CustomPieces,
  CustomSquareStyles,
  Piece
} from 'react-chessboard/dist/chessboard/types';

const boardWrapper = {
  width: `70vw`,
  maxWidth: '70vh',
  margin: '3rem auto',
};

/** SQUARE STYLES */
const SQUARE_STYLES = {
  // when cursor hovers over square selected piece can move to or piece hovers over square it can move to
  HOVERED_SQUARE: { background: 'rgba(255, 255, 0, 0.4)' },
  // to and from the last move made
  LAST_MOVE_FROM: { background: 'rgba(0, 255, 0, 0.4)' },
  LAST_MOVE_TO: { background: 'rgba(0, 255, 0, 0.4)' },
  // annotation squares
  ANNOTATE: { background: 'rgba(0, 0, 255, 0.4)' },
  // possible moves
  SELECTED_SQUARE: { background: 'rgba(255, 255, 0, 0.4)' },
  ATTACK_OPTION: { background: 'radial-gradient(circle, rgba(0,0,0,.1) 85%, transparent 85%)', borderRadius: '50%' },
  EMPTY_OPTION: { background: 'radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)', borderRadius: '50%' },
}

/** some constants for chess logic */

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

type Side = "w" | "b";

const chessjs_piece_convert = (piece: ChessjsPiece) => (piece.color + piece.type.toUpperCase()) as Piece;

interface ChessboardWrappedProps {
  side: Side;
  fen: string;
  lastMove?: Move;
  interactive: boolean;
  updateGame?: ((from: Square, to: Square, promotion?: string) => void); // expect this to be null or undefined if interactive
  renderedCallback?: () => void; // expect this to be null or undefined if the rendering has already been done
}

// set its props to be the puzzle object
const ChessboardWrapped: React.FC<ChessboardWrappedProps> = ({ side, fen, lastMove, interactive, updateGame, renderedCallback }) =>  {
  // some common attributes derived from game
  let newGame = new Chess();
  newGame.load(fen);
  let game = newGame;
  const turn = fen.split(' ')[1];

  /** POSITION STATES */
  const [rightClickedSquares, setRightClickedSquares] = useState<CustomSquareStyles>({});
  const [optionSquares, setOptionSquares] = useState<CustomSquareStyles>({});
  const [interactedSquare, setInteractedSquare] = useState<CustomSquareStyles>({});
  const [moveFrom, setMoveFrom] = useState<Square | null>(null);
  const removePremoveRef = createRef<ClearPremoves>();

  /** MAKING SURE PARENT COMPONENT KNOWS WHEN INITIAL BOARD IS RENDERED */
  const timeouts: Array<NodeJS.Timeout> = [];
  function tryTriggerRender() {
    if (renderedCallback) {
      if (removePremoveRef.current) {
        renderedCallback();
      } else {
        const timeout = setTimeout(tryTriggerRender, 300);
        timeouts.push(timeout);
      }
    }
  }
  useEffect(() => {
    if (renderedCallback) tryTriggerRender();
    return () => {timeouts.forEach(to=>clearTimeout(to))}
  }, [removePremoveRef, renderedCallback])

  /** MORE STYLING THAT NEED TO BE RENDERED */
  // custom board pieces
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
  
  function lastMoveHighlight() {
    if (lastMove) {
      return {
        [lastMove.from]: SQUARE_STYLES.LAST_MOVE_FROM,
        [lastMove.to]: SQUARE_STYLES.LAST_MOVE_TO,
      };
    }
  }

  function onMouseOutSquare(square: Square) {
    if (interactedSquare[square]) setInteractedSquare({});
  }

  function onSquareRightClick(square: Square) {
    if (square in rightClickedSquares) {
      delete rightClickedSquares[square];
      setRightClickedSquares({ ...rightClickedSquares });
    } else {
      setRightClickedSquares({
        ...rightClickedSquares,
        [square]: SQUARE_STYLES.ANNOTATE,
      });
    }
  }

  /** INTERACTIVE FUNCTIONS: DEALS WITH PLAYER INTERACTION */
  function getMoveOptions(square: Square) {
    if (!interactive || !game.get(square) || game.get(square).color !== turn) {
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
      newSquares[move.to] = game.get(move.to) && game.get(move.to).color !== game.get(square).color
            ? SQUARE_STYLES.ATTACK_OPTION
            : SQUARE_STYLES.EMPTY_OPTION;
      return move;
    });

    newSquares[square] = SQUARE_STYLES.SELECTED_SQUARE;
    setOptionSquares(newSquares);
    return true;
  }

  function onPieceDragBegin(_: Piece, sourceSquare: Square) {
    if (!interactive) return;
    setMoveFrom(sourceSquare);
    setRightClickedSquares({});
    getMoveOptions(sourceSquare);
  }

  function onPieceDragEnd() {
    if (!interactive) return;
    setInteractedSquare({});
  }

  function onDragOverSquare(square: Square) {
    if (!interactive) return;
    if (square === moveFrom) {
      setInteractedSquare({});
      return;
    }
    let possible_squares = moveFrom ? game.moves({ square: moveFrom, verbose: true }).map((move) => move.to) : [];
    if (possible_squares.includes(square)) {
      setInteractedSquare({ [square]: SQUARE_STYLES.HOVERED_SQUARE });
    } else {
      setInteractedSquare({});
    }
  }

  function onMouseOverSquare(square: Square) {
    if (!interactive) return;
    if (square === moveFrom) {
      setInteractedSquare({});
      return;
    }
    let possible_squares = moveFrom ? game.moves({ square: moveFrom, verbose: true }).map((move) => move.to) : [];
    if (possible_squares.includes(square)) {
      setInteractedSquare({ [square]: SQUARE_STYLES.HOVERED_SQUARE });
    } else if (moveFrom) {
      setInteractedSquare({});
    }
  }

  function onPromotionCheck(
    sourceSquare: Square,
    targetSquare: Square,
    piece: Piece
  ) {
    if (!interactive) return false;

    const moves = game.moves({
      square: sourceSquare,
      verbose: true,
    });
    const foundMove = moves.find(
      (m) => m.from === sourceSquare && m.to === targetSquare
    );
    // not a valid move
    if (!foundMove || foundMove.piece !== 'p') {
      return false;
    }

    // valid, check if promotion move
    return (
      (foundMove.color === 'w' &&
        targetSquare[1] === '8') ||
      (foundMove.color === 'b' &&
        targetSquare[1] === '1')
    );
  }

  /** FUNCTIONS THAT CAN ACTUALLY EXECUTE MOVES */
  function onDrop(sourceSquare: Square, targetSquare: Square, piece: Piece) {
    if (!interactive) return false;
    try {
      game.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: piece[1].toLowerCase() ?? 'q',
      });
      setOptionSquares({});
      setMoveFrom(null);
      setInteractedSquare({});
      if (updateGame) updateGame(sourceSquare, targetSquare, piece[1].toLowerCase() ?? 'q');
      return true;
    } catch {
      return false;
    }
  }

  function onSquareClick(square: Square) {
    setRightClickedSquares({});
    if (!interactive) return;
    if (moveFrom && square === moveFrom) {
      setMoveFrom(null);
      setOptionSquares({});
    } else if (moveFrom && onDrop(moveFrom, square, chessjs_piece_convert(game.get(moveFrom)))) { // TODO: update this
      setMoveFrom(null);
    } else {
      getMoveOptions(square);
      if (game.get(square) && game.get(square).color === turn && square !== moveFrom) setMoveFrom(square);
      else setMoveFrom(null);
    }
  }

  /** RETURNS MOSTLY A WRAPPED VERSION OF REACT-CHESSBOARD */
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
    </div>
  );
};

export default ChessboardWrapped;