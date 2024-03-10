import { Puzzle } from '@/types/lichess-api';
import { Chess, SQUARES, Square } from 'chess.js';
import React, { useMemo, useState } from 'react';
import { Chessboard } from 'react-chessboard';
import {
  CustomPieces,
  CustomSquareStyles,
  Piece,
} from 'react-chessboard/dist/chessboard/types';
import { SQUARE_STYLES } from './chessboard-wrapped';

function StaticBoard({ puzzle }: { puzzle: Puzzle }) {
  const fen = puzzle.FEN;
  const side = fen.split(' ')[1] === 'w' ? 'b' : 'w';
  const game = new Chess(fen);
  game.move(puzzle.Moves.split(' ')[0]);
  const lastMoveHighlight = useMemo(() => {
    // get last move from game
    const lastMove = game.history({ verbose: true }).pop();
    if (lastMove) {
      return {
        [lastMove.to]: {
          backgroundColor: 'rgba(0, 255, 0, 0.4)',
        },
        [lastMove.from]: {
          backgroundColor: 'rgba(0, 255, 0, 0.4)',
        },
      };
    }
  }, [game]);
  const [rightClickedSquares, setRightClickedSquares] =
    useState<CustomSquareStyles>({});

  const checkSquare = useMemo(() => {
    if (game.inCheck()) {
      for (let square of SQUARES) {
        if (
          game.get(square) &&
          game.get(square).type === 'k' &&
          game.get(square).color === side
        ) {
          return { [square]: SQUARE_STYLES.CHECKED_SQUARE };
        }
      }
    }
    return {};
  }, [game]);

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

  function onSquareClick(square: Square) {
    setRightClickedSquares({});
  }

  return (
    <Chessboard
      boardOrientation={side === 'w' ? 'white' : 'black'}
      position={game.fen()}
      arePiecesDraggable={false}
      customBoardStyle={{
        borderRadius: '4px',
      }}
      customPieces={customPieces}
      customSquareStyles={{
        ...lastMoveHighlight,
        ...rightClickedSquares,
        ...checkSquare,
      }}
      onSquareRightClick={onSquareRightClick}
      onSquareClick={onSquareClick}
    />
  );
}

export default React.memo(StaticBoard);
