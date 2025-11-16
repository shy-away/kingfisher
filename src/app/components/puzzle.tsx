import { useEffect } from "react";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import { Chess } from "chess.js";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import Chessground from "./chessground";

interface PuzzleData {
  game: {
    clock: string;
    id: string;
    perf: {
      key: string;
      name: string;
    };
    pgn: string;
    players: Array<{
      color: string;
      flair: string;
      id: string;
      name: string;
      rating: number;
    }>;
  };
  puzzle: {
    id: string;
    initialPly: number;
    plays: number;
    rating: number;
    solution: Array<string>;
    themes: Array<string>;
  };
}

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

  const chessGameRef = useRef(new Chess());
  const chessGame = chessGameRef.current;

  const [chessPosition, setChessPosition] = useState(chessGame.fen());

  const {
    data: puzzleData,
    isLoading,
    isError,
    error: puzzleFetchError,
    refetch: refetchNewPuzzle,
    isFetching: puzzleIsFetching,
  } = useQuery<PuzzleData | undefined>({
    queryKey: ["puzzle"],
    queryFn: getNewPuzzle,
    staleTime: Infinity,
  });

  useEffect(() => {
    if (!puzzleData) return;

    chessGame.loadPgn(puzzleData.game.pgn);
    setChessPosition(chessGame.fen());
  }, [puzzleData]);

  const handleOpenPuzzle = () => {
    const link = `https://lichess.org/training/${puzzleData?.puzzle.id}`;
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
      {puzzleData && (
        <>
          <h2>Puzzle PGN:</h2>
          <p>{JSON.stringify(puzzleData.game.pgn)}</p>
          <div
            id="chessgroundContainer"
            style={{ width: "500px", height: "500px" }}
          >
            <Chessground
              contained={true}
              config={{
                fen: chessPosition,
                orientation:
                  puzzleData.puzzle.initialPly % 2 === 0 ? "black" : "white",
              }}
            />
          </div>
        </>
      )}
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
  return data;
}
