import { useState } from 'react';
 import { useRef, useEffect, useCallback } from 'react';
import { Square } from 'chess.js';
import { Link } from 'react-router-dom';
import { useChessGame, Difficulty } from '@/hooks/useChessGame';
import { ChessBoard } from '@/components/ChessBoard';
import { GameControls } from '@/components/GameControls';
import { MoveHistory } from '@/components/MoveHistory';
import { CapturedPieces } from '@/components/CapturedPieces';
import { GameStatus } from '@/components/GameStatus';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
 import { usePoints } from '@/hooks/usePoints';
import { supabase } from '@/integrations/supabase/client';
import { Box } from 'lucide-react';

const Play = () => {
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const { gameState, playerColor, makeMove, resetGame, flipBoard, undoMove } = useChessGame(difficulty);
  const { toast } = useToast();
  const { user } = useAuth();
   const { addPoints } = usePoints();
   const lastMoveCount = useRef(0);
 
   // Award points for making moves (every 5 moves)
   useEffect(() => {
     const currentMoveCount = gameState.moveHistory.filter(m => 
       (playerColor === 'w' && m.color === 'w') || 
       (playerColor === 'b' && m.color === 'b')
     ).length;
     
     if (currentMoveCount > lastMoveCount.current && currentMoveCount % 5 === 0 && user) {
       addPoints('move_made');
     }
     lastMoveCount.current = currentMoveCount;
   }, [gameState.moveHistory, playerColor, addPoints, user]);

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

  const saveGame = async (result: 'win' | 'loss' | 'draw') => {
    if (!user) return;
    
    const botRatings: Record<Difficulty, number> = {
      beginner: 400,
      easy: 800,
      medium: 1200,
      hard: 1600,
    };

    await supabase.from('game_history').insert({
      user_id: user.id,
      opponent_type: 'bot',
      opponent_name: `${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Bot`,
      opponent_rating: botRatings[difficulty],
      result,
      time_control: 'rapid',
      user_color: playerColor === 'w' ? 'white' : 'black',
      moves_count: gameState.moveHistory.length,
    });
     
     // Award points for winning
     if (result === 'win') {
       await addPoints('game_won');
     }
  };

  const handleNewGame = () => {
    if (gameState.isGameOver && user) {
      const result = gameState.isCheckmate
        ? gameState.turn === playerColor ? 'loss' : 'win'
        : 'draw';
      saveGame(result);
    }
    resetGame();
    toast({
      title: "New Game",
      description: `Playing against ${difficulty} bot.`,
    });
  };

  const handleResign = () => {
    if (user) saveGame('loss');
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
    <div className="container mx-auto px-4 py-6">
      <div className="mb-4 flex items-center gap-4">
        <Link to="/play-3d">
          <Button variant="outline" size="sm">
            <Box className="h-4 w-4 mr-2" />
            3D Board
          </Button>
        </Link>
      </div>
      
      <div className="grid lg:grid-cols-[1fr_350px] gap-6 max-w-6xl mx-auto">
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
                turn={gameState.turn}
              />
            </div>
          </div>
        </div>

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
    </div>
  );
};

export default Play;
