'use client';

import { Chess, Square } from 'chess.js';
import { get } from 'http';
import { useMemo, useState } from 'react';
import { Chessboard } from 'react-chessboard';
import { Piece, PromotionPieceOption } from 'react-chessboard/dist/chessboard/types';

const buttonStyle = {
  cursor: "pointer",
  padding: "10px 20px",
  margin: "10px 10px 0px 0px",
  borderRadius: "6px",
  backgroundColor: "#f0d9b5",
  border: "none",
  boxShadow: "0 2px 5px rgba(0, 0, 0, 0.5)",
};

const inputStyle = {
  padding: "10px 20px",
  margin: "10px 0 10px 0",
  borderRadius: "6px",
  border: "none",
  boxShadow: "0 2px 5px rgba(0, 0, 0, 0.5)",
};

const boardWrapper = {
  width: `70vw`,
  maxWidth: "70vh",
  margin: "3rem auto",
};

export default function App() {
  const game = useMemo(() => new Chess(), []);
  const [fen, setFen] = useState(game.fen());
  const [rightClickedSquares, setRightClickedSquares] = useState<{ [key: string]: { backgroundColor?: string } | undefined }>({});
  const [optionSquares, setOptionSquares] = useState({});

  function onDrop(sourceSquare: Square, targetSquare: Square, piece: Piece) {
    try {
      game.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: piece[1].toLowerCase() ?? "q",
      });
      setFen(game.fen());
      setTimeout(makeRandomMove, 300); // timeout to delay move
      return true;
    } catch {
      return false;
    }
  }

  function getMoveOptions(square: Square) {
    if (!game.get(square) || game.get(square).color !== "w") {
      setOptionSquares({});
      return false;
    }

    const moves = game.moves({
      square,
      verbose: true,
    });

    const newSquares: { [key: string]: { background: string; borderRadius?: string } } = {};
    moves.map((move) => {
      newSquares[move.to] = {
        background:
          game.get(move.to) &&
            game.get(move.to).color !== game.get(square).color
            ? "radial-gradient(circle, rgba(0,0,0,.1) 85%, transparent 85%)"
            : "radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)",
        borderRadius: "50%",
      };
      return move;
    });
    newSquares[square] = {
      background: "rgba(255, 255, 0, 0.4)",
    };
    setOptionSquares(newSquares);
    return true;
  }

  function onPieceDragBegin(_: Piece, sourceSquare: Square) {
    getMoveOptions(sourceSquare);
  }

  function makeRandomMove() {
    const possibleMoves = game.moves();

    // exit if the game is over
    if (game.isGameOver() || game.isDraw() || possibleMoves.length === 0)
      return;

    const randomIndex = Math.floor(Math.random() * possibleMoves.length);
    game.move(possibleMoves[randomIndex]);
    setFen(game.fen());
  }

  function onSquareClick(square: Square) {
    setRightClickedSquares({});
    getMoveOptions(square);
  }

  function onSquareRightClick(square: Square) {
    const colour = "rgba(0, 0, 255, 0.4)";
    const test = rightClickedSquares[square];
    setRightClickedSquares({
      ...rightClickedSquares,
      [square]:
        test &&
          test.backgroundColor === colour
          ? undefined
          : { backgroundColor: colour },
    });
  }

  function onPromotionCheck(sourceSquare: Square, targetSquare: Square, piece: Piece) {
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
      (foundMove.color === "w" &&
        foundMove.piece === "p" &&
        targetSquare[1] === "8") ||
      (foundMove.color === "b" &&
        foundMove.piece === "p" &&
        targetSquare[1] === "1")
    )
  }

  return (
    <div style={boardWrapper}>
      <Chessboard
        id="ClickToMove"
        animationDuration={200}
        position={fen}
        isDraggablePiece={({ piece }) => piece[0] === "w"}
        onPieceDragBegin={onPieceDragBegin}
        onPieceDrop={onDrop}
        onSquareClick={onSquareClick}
        onSquareRightClick={onSquareRightClick}
        onPromotionCheck={onPromotionCheck}
        customBoardStyle={{
          borderRadius: "4px",
          boxShadow: "0 2px 10px rgba(0, 0, 0, 0.5)",
        }}
        customSquareStyles={{
          ...optionSquares,
          ...rightClickedSquares,
        }}
      />
      <button
        style={buttonStyle}
        onClick={() => {
          game.reset();
          setFen(game.fen());
          setOptionSquares({});
          setRightClickedSquares({});
        }}
      >
        reset
      </button>
      <button
        style={buttonStyle}
        onClick={() => {
          game.undo();
          setFen(game.fen());
          setOptionSquares({});
          setRightClickedSquares({});
        }}
      >
        undo
      </button>
    </div>
  );
};

