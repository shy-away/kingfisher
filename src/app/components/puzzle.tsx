import React from "react";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import { Chess } from "chess.js";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Chessboard } from "react-chessboard";
import Chessground from "./chessground";

const queryClient = new QueryClient();

export default function Puzzle() {
  return (
    <QueryClientProvider client={queryClient}>
      <PuzzleWindow />
    </QueryClientProvider>
  );
}

function PuzzleWindow() {
  // fetch puzzle data
  // create chess game using puzzle data
  // display puzzle on chess board
  // if user makes incorrect move, don't update the board, and provide feedback
  // if user makes next correct move: update board, update display, and go to next move of puzzle
  // at the end of the puzzle, provide feedback that the puzzle is complete

  const {
    data,
    isLoading,
    isError,
    error: puzzleFetchError,
    refetch: refetchNewPuzzle,
    isFetching: puzzleIsFetching,
  } = useQuery({
    queryKey: ["puzzle"],
    queryFn: getNewPuzzle,
    staleTime: Infinity,
  });

  const handleOpenPuzzle = () => {
    const link = `https://lichess.org/training/${data.puzzle.id}`;
    window.electronAPI.openUrl(link);
  };

  const handleGetNewPuzzle = () => {
    refetchNewPuzzle();
  };

  return isLoading ? (
    <Spinner />
  ) : isError ? (
    <div>Error: {puzzleFetchError.message}</div>
  ) : (
    <div>
      <h2>Puzzle PGN:</h2>
      <p>{JSON.stringify(data.game.pgn)}</p>
      <div id="chessgroundContainer" style={{width: "100%", height: "100%"}}>
        <Chessground contained={false} />
      </div>
      <Button
        variant="outline"
        onClick={handleOpenPuzzle}
        className="border-amber-500"
      >
        See puzzle on Lichess
      </Button>
      <Button disabled={puzzleIsFetching} onClick={handleGetNewPuzzle}>
        Get new puzzle{puzzleIsFetching && <Spinner />}
      </Button>
    </div>
  );
}

async function getNewPuzzle() {
  const response = await fetch(
    "https://lichess.org/api/puzzle/next?difficulty=easiest"
  );
  const data = await response.json();
  console.log(data);
  return data;
}
