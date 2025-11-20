import { Key, useEffect } from "react";
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
import { MoveMetadata } from "@lichess-org/chessground/types";

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

  const chessGameRef = useRef(new Chess());
  const chessGame = chessGameRef.current;

  const [chessPosition, setChessPosition] = useState(chessGame.fen());
  const [viewOnly, setViewOnly] = useState(true);

  const updateChessPosition = () => {
    setChessPosition(chessGame.fen());
  };

  useEffect(() => {
    if (!puzzleData) return;

    setViewOnly(true);

    const puzzlePgn: string = puzzleData.game.pgn;
    const puzzlePgnArr: string[] = puzzlePgn.split(" ");

    // TODO: find better fix than `?? ""` for addressing type issue
    const lastMove = puzzlePgnArr.at(-1) ?? "";

    chessGame.loadPgn(puzzlePgnArr.slice(0, -1).join(" "));
    updateChessPosition();

    setTimeout(() => {
      chessGame.move(lastMove);
      updateChessPosition();
      setViewOnly(false);
    }, 1000);
  }, [puzzleData]);

  const handleOpenPuzzle = () => {
    const link = `https://lichess.org/training/${puzzleData?.puzzle.id}`;
    window.electronAPI.openUrl(link);
  };

  const handleGetNewPuzzle = () => {
    refetchNewPuzzle();
  };

  const handleMove = (orig: Key, dest: Key, metadata: MoveMetadata): void => {
    console.log("Origin:", orig);
    console.log("Destination:", dest);
    console.log("Metadata:", metadata);
  }

  // TODO: find better solution for type safety
  const { from: lastMoveFrom, to: lastMoveTo } = chessGame
    .history({ verbose: true })
    .at(-1) ?? {from: "e2", to: "e4"};

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
                viewOnly,
                fen: chessPosition,
                orientation:
                  puzzleData.puzzle.initialPly % 2 === 0 ? "black" : "white", // TODO: DRY this and next use of same expression
                lastMove: [lastMoveFrom, lastMoveTo],
                turnColor: chessGame.turn() === "w" ? "white" : "black",
                check: chessGame.inCheck(),
                movable: {
                  color: puzzleData.puzzle.initialPly % 2 === 0 ? "black" : "white",
                  events: {
                    after: handleMove
                  }
                }
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
