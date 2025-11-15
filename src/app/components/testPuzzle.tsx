import React from "react";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import { Chess } from "chess.js";
import { shell } from "electron";
import { useEffect, useRef } from "react";

const queryClient = new QueryClient();

export default function TestPuzzle() {
  return (
    <QueryClientProvider client={queryClient}>
      <Puzzle />
    </QueryClientProvider>
  );
}

function Puzzle() {
  // fetch puzzle data
  // create chess game using puzzle data
  // display puzzle on chess board
  // if user makes incorrect move, don't update the board, and provide feedback
  // if user makes next correct move: update board, update display, and go to next move of puzzle
  // at the end of the puzzle, provide feedback that the puzzle is complete

  const { data, isLoading, isError } = useQuery({
    queryKey: ["puzzle"],
    queryFn: getNewPuzzle,
  });

  const handleOpenPuzzle = () => {
    const link = `https://lichess.org/training/${data.puzzle.id}`;
    window.electronAPI.openUrl(link)
  };

  if (isLoading) return <div>Loading...</div>;

  if (isError) return <div>Error!</div>;

  return (
    <button onClick={handleOpenPuzzle} className="border-amber-500">
      See puzzle
    </button>
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
