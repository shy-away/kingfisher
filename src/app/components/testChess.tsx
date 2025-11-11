import { Chess } from "chess.js";
import React, { useRef, useState } from "react";
import { Chessboard } from "react-chessboard";

export default function TestChess() {
  const chessGameRef = useRef(new Chess());
  const chessGame = chessGameRef.current;

  const [chessPosition, setChessPosition] = useState(chessGame.fen());

  function makeRandomMove() {
    const possibleMoves = chessGame.moves();
    return possibleMoves;
  }

  return <Chessboard />

  return (
    <>{makeRandomMove().map((e, i) => (<li key={i}>{e}</li>))}</>
  )
}
