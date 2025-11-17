import { Chess } from "chess.js";
import React, { useRef, useState } from "react";
import { Chessboard, PieceDropHandlerArgs } from "react-chessboard";

export default function TestChess() {
  const chessGameRef = useRef(new Chess());
  const chessGame = chessGameRef.current;

  const [chessPosition, setChessPosition] = useState(chessGame.fen());

  const updateBoard = () => setChessPosition(chessGame.fen());

  function makeRandomMove() {
    const possibleMoves = chessGame.moves();

    if (chessGame.isGameOver()) {
      return;
    }

    const randomMove =
      possibleMoves[Math.floor(Math.random() * possibleMoves.length)];

    chessGame.move(randomMove);

    updateBoard();
  }

  function onPieceDrop({ sourceSquare, targetSquare }: PieceDropHandlerArgs) {
    if (!targetSquare) {
      return false;
    }

    try {
      chessGame.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: "q",
      });

      updateBoard();

      setTimeout(makeRandomMove, 500);

      return true;
    } catch {
      return false;
    }
  }

  const chessBoardOptions = {
    position: chessPosition,
    onPieceDrop,
    id: "play-vs-random",
  };

  return <Chessboard options={chessBoardOptions} />;
}
