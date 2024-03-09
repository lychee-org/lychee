import { Puzzle } from '@/types/lichess-api';
import { Chess } from 'chess.js';
import React, { useMemo } from 'react';
import { Chessboard } from 'react-chessboard';
import { CustomPieces, Piece } from 'react-chessboard/dist/chessboard/types';

function StaticBoard({ puzzle }: { puzzle: Puzzle }) {
  const fen = puzzle.FEN;
  const side = fen.split(' ')[1] === 'w' ? 'b' : 'w';
  const game = new Chess(fen);
  game.move(puzzle.Moves.split(' ')[0]);

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

  return (
    <Chessboard
      boardOrientation={side === 'w' ? 'white' : 'black'}
      position={game.fen()}
      arePiecesDraggable={false}
      customBoardStyle={{
        borderRadius: '4px',
      }}
      customPieces={customPieces}
    />
  );
}

export default React.memo(StaticBoard);
