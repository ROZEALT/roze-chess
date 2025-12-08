import { useState, useEffect } from 'react';
import { Square } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Flag, ArrowLeft, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface OnlineGameBoardProps {
  gameState: {
    id: string;
    fen: string;
    turn: 'w' | 'b';
    playerColor: 'w' | 'b' | null;
    whiteTimeRemaining: number;
    blackTimeRemaining: number;
    status: string;
    isGameOver: boolean;
    isCheck: boolean;
    isCheckmate: boolean;
    isDraw: boolean;
    result: string | null;
    opponentId: string | null;
    moves: string[];
  };
  onMove: (source: Square, target: Square) => Promise<boolean>;
  onResign: () => void;
  onLeaveGame: () => void;
}

const formatTime = (ms: number): string => {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

export const OnlineGameBoard = ({
  gameState,
  onMove,
  onResign,
  onLeaveGame,
}: OnlineGameBoardProps) => {
  const { user } = useAuth();
  const [opponentName, setOpponentName] = useState<string>('Opponent');

  useEffect(() => {
    if (gameState.opponentId) {
      supabase
        .from('profiles')
        .select('username')
        .eq('user_id', gameState.opponentId)
        .maybeSingle()
        .then(({ data }) => {
          if (data?.username) {
            setOpponentName(data.username);
          }
        });
    }
  }, [gameState.opponentId]);

  const handleDrop = (source: string, target: string): boolean => {
    onMove(source as Square, target as Square);
    return true;
  };

  const isPlayerTurn = gameState.turn === gameState.playerColor;
  const playerTime = gameState.playerColor === 'w' 
    ? gameState.whiteTimeRemaining 
    : gameState.blackTimeRemaining;
  const opponentTime = gameState.playerColor === 'w' 
    ? gameState.blackTimeRemaining 
    : gameState.whiteTimeRemaining;

  const getResultText = () => {
    if (!gameState.isGameOver) return null;
    if (gameState.result === 'white_wins') {
      return gameState.playerColor === 'w' ? 'You Won!' : 'You Lost';
    }
    if (gameState.result === 'black_wins') {
      return gameState.playerColor === 'b' ? 'You Won!' : 'You Lost';
    }
    return 'Draw';
  };

  return (
    <div className="grid lg:grid-cols-[1fr_300px] gap-6 max-w-5xl mx-auto">
      <div className="space-y-4">
        {/* Opponent Timer */}
        <Card className="bg-muted/50">
          <CardContent className="py-3 flex justify-between items-center">
            <span className="font-medium">{opponentName}</span>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span className={`font-mono text-lg ${opponentTime < 30000 ? 'text-destructive' : ''}`}>
                {formatTime(opponentTime)}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Game Status */}
        {gameState.isGameOver && (
          <Card className="bg-primary/10 border-primary">
            <CardContent className="py-4 text-center">
              <h3 className="text-2xl font-bold">{getResultText()}</h3>
              {gameState.isCheckmate && <p className="text-muted-foreground">Checkmate</p>}
              {gameState.isDraw && <p className="text-muted-foreground">Draw</p>}
            </CardContent>
          </Card>
        )}

        {/* Chess Board */}
        <div className="w-full max-w-[600px] mx-auto">
          <Chessboard
            position={gameState.fen}
            onPieceDrop={handleDrop}
            boardOrientation={gameState.playerColor === 'b' ? 'black' : 'white'}
            arePiecesDraggable={!gameState.isGameOver && isPlayerTurn}
            customBoardStyle={{
              borderRadius: '8px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            }}
          />
        </div>

        {/* Player Timer */}
        <Card className={isPlayerTurn ? 'border-primary bg-primary/10' : 'bg-muted/50'}>
          <CardContent className="py-3 flex justify-between items-center">
            <span className="font-medium">You</span>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span className={`font-mono text-lg ${playerTime < 30000 ? 'text-destructive' : ''}`}>
                {formatTime(playerTime)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Side Panel */}
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Game Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {!gameState.isGameOver && (
              <Button 
                variant="destructive" 
                className="w-full" 
                onClick={onResign}
              >
                <Flag className="h-4 w-4 mr-2" />
                Resign
              </Button>
            )}
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={onLeaveGame}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {gameState.isGameOver ? 'Back to Lobby' : 'Leave Game'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Move History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-64 overflow-y-auto">
              <div className="grid grid-cols-3 gap-1 text-sm">
                {gameState.moves.reduce((pairs: string[][], move, index) => {
                  if (index % 2 === 0) {
                    pairs.push([move]);
                  } else {
                    pairs[pairs.length - 1].push(move);
                  }
                  return pairs;
                }, []).map((pair, index) => (
                  <div key={index} className="contents">
                    <span className="text-muted-foreground">{index + 1}.</span>
                    <span className="font-mono">{pair[0]}</span>
                    <span className="font-mono">{pair[1] || ''}</span>
                  </div>
                ))}
              </div>
              {gameState.moves.length === 0 && (
                <p className="text-muted-foreground text-center">No moves yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Turn</span>
              <Badge variant={isPlayerTurn ? 'default' : 'secondary'}>
                {isPlayerTurn ? 'Your Turn' : "Opponent's Turn"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
