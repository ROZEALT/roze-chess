import { useState, useCallback, useEffect } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess, Square } from 'chess.js';
import { CheckCircle, XCircle, RotateCcw, Lightbulb, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

interface Puzzle {
  id: number;
  fen: string;
  solution: string[];
  theme: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;
}

const puzzles: Puzzle[] = [
  {
    id: 1,
    fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4',
    solution: ['h5f7'],
    theme: 'Checkmate',
    difficulty: 'Easy',
    description: 'Scholar\'s Mate - Find the checkmate!'
  },
  {
    id: 2,
    fen: 'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4',
    solution: ['f3g5'],
    theme: 'Fork',
    difficulty: 'Easy',
    description: 'Find the knight fork!'
  },
  {
    id: 3,
    fen: '6k1/5ppp/8/8/8/8/5PPP/4R1K1 w - - 0 1',
    solution: ['e1e8'],
    theme: 'Back Rank',
    difficulty: 'Easy',
    description: 'Back rank checkmate in one!'
  },
  {
    id: 4,
    fen: 'r2qk2r/ppp2ppp/2n1bn2/2b1p3/4P3/2NP1N2/PPP2PPP/R1BQKB1R w KQkq - 0 6',
    solution: ['f1b5'],
    theme: 'Pin',
    difficulty: 'Medium',
    description: 'Pin the knight to the king!'
  },
  {
    id: 5,
    fen: '2rq1rk1/pp2ppbp/2n2np1/3p4/3P4/2NBPN2/PP3PPP/R1BQ1RK1 w - - 0 10',
    solution: ['c3b5'],
    theme: 'Discovery',
    difficulty: 'Medium',
    description: 'Find the strong knight move!'
  },
  {
    id: 6,
    fen: 'r1b1k2r/ppppqppp/2n2n2/2b1p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R w KQkq - 4 5',
    solution: ['c4f7'],
    theme: 'Sacrifice',
    difficulty: 'Medium',
    description: 'Sacrifice to expose the king!'
  },
  {
    id: 7,
    fen: '1k1r4/pp1b1R2/3q2pp/4p3/2B5/4Q3/PPP2PPP/2K5 b - - 0 1',
    solution: ['d6d1', 'c1d1', 'd7g4'],
    theme: 'Deflection',
    difficulty: 'Hard',
    description: 'Find the winning queen sacrifice!'
  },
];

const DailyPuzzle = () => {
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState(0);
  const [game, setGame] = useState<Chess>(new Chess());
  const [moveIndex, setMoveIndex] = useState(0);
  const [solved, setSolved] = useState(false);
  const [failed, setFailed] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [puzzlesSolved, setPuzzlesSolved] = useState(0);

  const currentPuzzle = puzzles[currentPuzzleIndex];

  const initializePuzzle = useCallback(() => {
    const newGame = new Chess(currentPuzzle.fen);
    setGame(newGame);
    setMoveIndex(0);
    setSolved(false);
    setFailed(false);
    setShowHint(false);
  }, [currentPuzzle]);

  useEffect(() => {
    initializePuzzle();
  }, [initializePuzzle]);

  const makeAMove = useCallback((sourceSquare: Square, targetSquare: Square): boolean => {
    if (solved || failed) return false;

    const move = `${sourceSquare}${targetSquare}`;
    const expectedMove = currentPuzzle.solution[moveIndex];

    // Check if move matches expected solution
    if (move === expectedMove || move === expectedMove.substring(0, 4)) {
      try {
        const gameCopy = new Chess(game.fen());
        gameCopy.move({
          from: sourceSquare,
          to: targetSquare,
          promotion: expectedMove.length === 5 ? expectedMove[4] as 'q' | 'r' | 'b' | 'n' : 'q'
        });
        setGame(gameCopy);

        const nextMoveIndex = moveIndex + 1;

        // Check if puzzle is complete
        if (nextMoveIndex >= currentPuzzle.solution.length) {
          setSolved(true);
          setPuzzlesSolved(prev => prev + 1);
          toast({
            title: "Correct!",
            description: "You solved the puzzle!",
          });
        } else {
          // Make opponent's response move after a delay
          setMoveIndex(nextMoveIndex);
          setTimeout(() => {
            const opponentMove = currentPuzzle.solution[nextMoveIndex];
            if (opponentMove) {
              const afterOpponent = new Chess(gameCopy.fen());
              afterOpponent.move({
                from: opponentMove.substring(0, 2) as Square,
                to: opponentMove.substring(2, 4) as Square,
                promotion: opponentMove.length === 5 ? opponentMove[4] as 'q' | 'r' | 'b' | 'n' : 'q'
              });
              setGame(afterOpponent);
              setMoveIndex(nextMoveIndex + 1);

              if (nextMoveIndex + 1 >= currentPuzzle.solution.length) {
                setSolved(true);
                setPuzzlesSolved(prev => prev + 1);
                toast({
                  title: "Correct!",
                  description: "You solved the puzzle!",
                });
              }
            }
          }, 500);
        }
        return true;
      } catch {
        return false;
      }
    } else {
      // Wrong move
      setFailed(true);
      toast({
        title: "Incorrect",
        description: "That's not the best move. Try again!",
        variant: "destructive",
      });
      return false;
    }
  }, [game, currentPuzzle, moveIndex, solved, failed]);

  const onDrop = (sourceSquare: Square, targetSquare: Square): boolean => {
    return makeAMove(sourceSquare, targetSquare);
  };

  const nextPuzzle = () => {
    setCurrentPuzzleIndex((prev) => (prev + 1) % puzzles.length);
  };

  const getHintSquare = (): string => {
    if (moveIndex < currentPuzzle.solution.length) {
      return currentPuzzle.solution[moveIndex].substring(0, 2);
    }
    return '';
  };

  // Determine board orientation based on whose turn it is
  const boardOrientation = game.turn() === 'w' ? 'white' : 'black';

  return (
    <div className="chess-card p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-heading font-semibold text-xl text-foreground">Daily Puzzle</h2>
          <p className="text-sm text-muted-foreground">{currentPuzzle.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
            currentPuzzle.difficulty === 'Easy' ? 'bg-green-500/20 text-green-500' :
            currentPuzzle.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-500' :
            'bg-red-500/20 text-red-500'
          }`}>
            {currentPuzzle.difficulty}
          </span>
          <span className="text-xs px-2 py-1 rounded-full bg-primary/20 text-primary font-medium">
            {currentPuzzle.theme}
          </span>
        </div>
      </div>

      <div className="relative rounded-lg overflow-hidden mb-4">
        <Chessboard
          position={game.fen()}
          onPieceDrop={onDrop}
          boardOrientation={boardOrientation}
          customBoardStyle={{
            borderRadius: '8px',
          }}
          customDarkSquareStyle={{ backgroundColor: 'hsl(var(--primary) / 0.8)' }}
          customLightSquareStyle={{ backgroundColor: 'hsl(var(--secondary))' }}
          customSquareStyles={showHint && !solved && !failed ? {
            [getHintSquare()]: { backgroundColor: 'rgba(255, 255, 0, 0.4)' }
          } : {}}
        />

        {/* Overlay for solved/failed states */}
        {(solved || failed) && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
            <div className="text-center">
              {solved ? (
                <>
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-3" />
                  <p className="font-heading font-bold text-xl text-foreground">Puzzle Solved!</p>
                  <p className="text-muted-foreground">Great job!</p>
                </>
              ) : (
                <>
                  <XCircle className="w-16 h-16 text-destructive mx-auto mb-3" />
                  <p className="font-heading font-bold text-xl text-foreground">Try Again</p>
                  <p className="text-muted-foreground">That wasn't the best move</p>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <p className="text-sm text-muted-foreground">
            {game.turn() === 'w' ? 'White' : 'Black'} to move
          </p>
          <span className="text-xs text-muted-foreground">•</span>
          <p className="text-sm text-primary font-medium">{puzzlesSolved} solved today</p>
        </div>

        <div className="flex items-center gap-2">
          {!solved && !failed && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowHint(!showHint)}
            >
              <Lightbulb className="w-4 h-4 mr-1" />
              Hint
            </Button>
          )}
          
          {failed && (
            <Button
              variant="outline"
              size="sm"
              onClick={initializePuzzle}
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              Retry
            </Button>
          )}

          {solved && (
            <Button
              variant="glow"
              size="sm"
              onClick={nextPuzzle}
            >
              Next Puzzle
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DailyPuzzle;
