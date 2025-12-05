import { cn } from '@/lib/utils';

interface GameStatusProps {
  turn: 'w' | 'b';
  playerColor: 'w' | 'b';
  isGameOver: boolean;
  isCheck: boolean;
  isCheckmate: boolean;
  isDraw: boolean;
  isStalemate: boolean;
}

export const GameStatus = ({
  turn,
  playerColor,
  isGameOver,
  isCheck,
  isCheckmate,
  isDraw,
  isStalemate,
}: GameStatusProps) => {
  const getStatus = () => {
    if (isCheckmate) {
      const winner = turn === 'w' ? 'Black' : 'White';
      return { text: `Checkmate! ${winner} wins`, type: 'checkmate' };
    }
    if (isStalemate) return { text: 'Stalemate - Draw', type: 'draw' };
    if (isDraw) return { text: 'Draw', type: 'draw' };
    if (isCheck) return { text: 'Check!', type: 'check' };
    
    const isYourTurn = turn === playerColor;
    return {
      text: isYourTurn ? 'Your turn' : 'Bot thinking...',
      type: isYourTurn ? 'your-turn' : 'opponent-turn',
    };
  };

  const status = getStatus();

  return (
    <div
      className={cn(
        'chess-card p-4 text-center transition-all',
        status.type === 'checkmate' && 'border-destructive bg-destructive/10',
        status.type === 'check' && 'border-yellow-500 bg-yellow-500/10 animate-pulse-glow',
        status.type === 'your-turn' && 'border-primary bg-primary/5',
        status.type === 'opponent-turn' && 'opacity-75'
      )}
    >
      <div className="flex items-center justify-center gap-3">
        <div
          className={cn(
            'w-4 h-4 rounded-full',
            turn === 'w' ? 'bg-white border border-border' : 'bg-gray-800'
          )}
        />
        <span
          className={cn(
            'font-heading font-semibold text-lg',
            status.type === 'checkmate' && 'text-destructive',
            status.type === 'check' && 'text-yellow-500',
            status.type === 'your-turn' && 'text-primary',
            status.type === 'opponent-turn' && 'text-muted-foreground'
          )}
        >
          {status.text}
        </span>
      </div>
      
      {!isGameOver && (
        <p className="text-sm text-muted-foreground mt-1">
          Playing as {playerColor === 'w' ? 'White' : 'Black'}
        </p>
      )}
    </div>
  );
};
