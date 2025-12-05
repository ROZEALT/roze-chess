import { useState } from 'react';
import { Square } from 'chess.js';
import { useChessGame, Difficulty } from '@/hooks/useChessGame';
import { Header } from '@/components/Header';
import { ChessBoard } from '@/components/ChessBoard';
import { GameControls } from '@/components/GameControls';
import { MoveHistory } from '@/components/MoveHistory';
import { CapturedPieces } from '@/components/CapturedPieces';
import { GameStatus } from '@/components/GameStatus';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const { gameState, playerColor, makeMove, resetGame, flipBoard, undoMove } = useChessGame(difficulty);
  const { toast } = useToast();

  const handlePieceDrop = (source: Square, target: Square): boolean => {
    if (gameState.turn !== playerColor) return false;
    
    const success = makeMove(source, target);
    if (!success) {
      toast({
        title: "Invalid Move",
        description: "That move is not allowed.",
        variant: "destructive",
      });
    }
    return success;
  };

  const handleNewGame = () => {
    resetGame();
    toast({
      title: "New Game",
      description: `Playing against ${difficulty} bot.`,
    });
  };

  const handleResign = () => {
    toast({
      title: "Game Resigned",
      description: "Better luck next time!",
      variant: "destructive",
    });
    resetGame();
  };

  const handleDifficultyChange = (d: Difficulty) => {
    setDifficulty(d);
    resetGame();
    toast({
      title: "Difficulty Changed",
      description: `Now playing against ${d} bot.`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-[1fr_350px] gap-6 max-w-6xl mx-auto">
          {/* Main Board Area */}
          <div className="space-y-4">
            <GameStatus
              turn={gameState.turn}
              playerColor={playerColor}
              isGameOver={gameState.isGameOver}
              isCheck={gameState.isCheck}
              isCheckmate={gameState.isCheckmate}
              isDraw={gameState.isDraw}
              isStalemate={gameState.isStalemate}
            />
            
            <div className="flex justify-center">
              <div className="w-full max-w-[600px]">
                <ChessBoard
                  fen={gameState.fen}
                  playerColor={playerColor}
                  onPieceDrop={handlePieceDrop}
                  isGameOver={gameState.isGameOver}
                />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <GameControls
              onNewGame={handleNewGame}
              onFlipBoard={flipBoard}
              onUndo={undoMove}
              onResign={handleResign}
              isGameOver={gameState.isGameOver}
              difficulty={difficulty}
              onDifficultyChange={handleDifficultyChange}
            />
            
            <CapturedPieces capturedPieces={gameState.capturedPieces} />
            
            <MoveHistory moves={gameState.moveHistory} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
