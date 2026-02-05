import { useState } from 'react';
 import { useRef, useEffect } from 'react';
import { Square } from 'chess.js';
 import { Link, useNavigate } from 'react-router-dom';
import { useChessGame, Difficulty } from '@/hooks/useChessGame';
import { ChessScene3D } from '@/components/3d/ChessScene3D';
import { GameControls } from '@/components/GameControls';
import { MoveHistory } from '@/components/MoveHistory';
import { CapturedPieces } from '@/components/CapturedPieces';
import { GameStatus } from '@/components/GameStatus';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
 import { usePoints } from '@/hooks/usePoints';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
 import { ArrowLeft, RotateCcw, Lock, Crown } from 'lucide-react';

const Play3D = () => {
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const { gameState, playerColor, makeMove, resetGame, flipBoard, undoMove } = useChessGame(difficulty);
  const { toast } = useToast();
  const { user } = useAuth();
   const { isPremium, addPoints } = usePoints();
   const navigate = useNavigate();
   const lastMoveCount = useRef(0);
 
   // Award points for making moves (every 5 moves)
   useEffect(() => {
     if (!isPremium) return; // Don't track if not premium
     
     const currentMoveCount = gameState.moveHistory.filter(m => 
       (playerColor === 'w' && m.color === 'w') || 
       (playerColor === 'b' && m.color === 'b')
     ).length;
     
     if (currentMoveCount > lastMoveCount.current && currentMoveCount % 5 === 0 && user) {
       addPoints('move_made');
     }
     lastMoveCount.current = currentMoveCount;
   }, [gameState.moveHistory, playerColor, addPoints, user, isPremium]);
 
   // Gate 3D mode for non-premium users
   if (!isPremium) {
     return (
       <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[60vh]">
         <Lock className="w-16 h-16 text-muted-foreground mb-6" />
         <h1 className="text-2xl font-bold mb-2">3D Chess is a Premium Feature</h1>
         <p className="text-muted-foreground mb-6 text-center max-w-md">
           Upgrade to Vault Chess+ to access immersive 3D chess, custom themes, and more!
         </p>
         <div className="flex gap-3">
           <Link to="/play">
             <Button variant="outline">
               <ArrowLeft className="w-4 h-4 mr-2" />
               Play 2D Instead
             </Button>
           </Link>
           <Button variant="glow" onClick={() => navigate('/settings')}>
             <Crown className="w-4 h-4 mr-2" />
             Learn More
           </Button>
         </div>
       </div>
     );
   }

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
        <Link to="/play">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            2D Board
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">3D Chess</h1>
        <div className="text-sm text-muted-foreground">
          Drag to rotate • Scroll to zoom
        </div>
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
            <ChessScene3D
              fen={gameState.fen}
              playerColor={playerColor}
              onMove={handlePieceDrop}
              isGameOver={gameState.isGameOver}
              turn={gameState.turn}
            />
          </div>
          
          <div className="flex justify-center">
            <Button variant="outline" onClick={flipBoard} size="sm">
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset Camera View
            </Button>
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

export default Play3D;
