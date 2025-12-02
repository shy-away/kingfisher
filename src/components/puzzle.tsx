import { useEffect } from "react";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import { Chess, Move, Square } from "chess.js";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import Chessground from "./chessground";
import { Key, Dests } from "@lichess-org/chessground/types";

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

  const chessGameRef = useRef<Chess>(new Chess());
  const chessGame: Chess = chessGameRef.current;

  const [chessPosition, setChessPosition] = useState<string>(chessGame.fen());
  const [puzzleSolution, setPuzzleSolution] = useState<string[]>([]);
  const [puzzleFeedback, setPuzzleFeedback] = useState<string>("Make a move...");
  const [puzzleColor, setPuzzleColor] = useState<"black" | "white" | undefined>(undefined);
  const [legalDestinations, setLegalDestinations] = useState<Dests | undefined>(undefined);
  const [lastMove, setLastMove] = useState<Key[] | undefined>(undefined);

  const updateChessPosition = () => {
    setChessPosition(chessGame.fen());

    // update what moves are legal
    const destsMap: Dests = new Map();
    const verboseLegalMoves: Move[] = chessGame.moves({ verbose: true })

    for (const entry of verboseLegalMoves) {
      const from: Key = entry.from;
      const to: Key = entry.to;

      if (!destsMap.has(from)) {
        destsMap.set(from, [to])
      } else {
        destsMap.set(from, [...destsMap.get(from)!, to])
      }
    }
    setLegalDestinations(destsMap);

    // set last moves array
    const { from: lastMoveFrom, to: lastMoveTo } = chessGame
      .history({ verbose: true })
      .at(-1)!;
    
    setLastMove([lastMoveFrom as Key, lastMoveTo as Key]);
  };

  useEffect(() => {
    if (!puzzleData) return;

    setPuzzleSolution(puzzleData.puzzle.solution);
    setPuzzleColor(puzzleData.puzzle.initialPly % 2 === 0 ? "black" : "white");

    const puzzlePgn: string = puzzleData.game.pgn;
    const puzzlePgnArr: string[] = puzzlePgn.split(" ");

    const lastMove = puzzlePgnArr.at(-1)!;

    chessGame.loadPgn(puzzlePgnArr.slice(0, -1).join(" "));
    updateChessPosition();

    setTimeout(() => {
      chessGame.move(lastMove);
      updateChessPosition();
    }, 1000);
  }, [puzzleData]);

  const handleOpenPuzzle = () => {
    const link = `https://lichess.org/training/${puzzleData?.puzzle.id}`;
    window.electronAPI.openUrl(link);
  };

  const handleGetNewPuzzle = () => {
    refetchNewPuzzle();
  };

  /**
   * if move is valid but not solution, provide feedback that the move was incorrect
   * 
   * if move is valid and is the next move of the solution, but not the last move, provide feedback that the move was correct and that the puzzle continues, and make the opponent's next move as provided
   * 
   * if move is valid and is the last move of the solution, provide feedback that the move was correct and the puzzle is done
   */
  const handleMove = (orig: Key, dest: Key): void => {
    let promotion: string = "";

    // if piece on origin square is a pawn, and if destination square is on rank 1 or 8, this is a promotion
    if (chessGame.get(orig as Square)?.type === "p" && /[abcdefgh][18]/.test(dest)) {
      promotion = "q"
    }

    const userMove: string = `${orig}${dest}${promotion}`;

    let msg: string = "";

    if (userMove !== puzzleSolution[0]) {
      msg += `${userMove} wasn't the solution. `
      setTimeout(() => {
        updateChessPosition();
      }, 500)
    } else {
      // correct move
      msg += `${userMove} was the solution. `
      chessGame.move(userMove);
      updateChessPosition();
      
      if (puzzleSolution.length > 1) {
        msg += "Keep going!"
        const puzzleOpponentMove = puzzleSolution[1];
        setPuzzleSolution(prev => prev.slice(2))

        setTimeout(() => {
          chessGame.move(puzzleOpponentMove);
          updateChessPosition();
        }, 1000)
      } else {
        // last move of puzzle
        msg += "You've solved the puzzle."
      }
    }

    setPuzzleFeedback(msg);

    // TODO: validate differently if puzzle ends in checkmate
  }

  return isLoading ? (
    <Spinner />
  ) : isError ? (
    <div>Error: {puzzleFetchError.message}</div>
  ) : (
    <div>
      <p id="puzzle-feedback">{puzzleFeedback}</p>
      {puzzleData && (
        <>
          <div
            id="chessgroundContainer"
            style={{ width: "500px", height: "500px" }}
          >
            <Chessground
              contained={true}
              config={{
                fen: chessPosition,
                orientation: puzzleColor,
                lastMove: lastMove,
                turnColor: chessGame.turn() === "w" ? "white" : "black",
                check: chessGame.inCheck(),
                movable: {
                  free: false,
                  color: puzzleColor,
                  dests: legalDestinations,
                },
                events: {
                  move: handleMove
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
