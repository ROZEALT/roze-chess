import { Button } from '@/components/ui/button';
import { RotateCcw, RefreshCw, Flag, Undo2 } from 'lucide-react';
import { Difficulty } from '@/hooks/useChessGame';

interface GameControlsProps {
  onNewGame: () => void;
  onFlipBoard: () => void;
  onUndo: () => void;
  onResign: () => void;
  isGameOver: boolean;
  difficulty: Difficulty;
  onDifficultyChange: (d: Difficulty) => void;
}

const difficulties: { value: Difficulty; label: string; rating: string }[] = [
  { value: 'beginner', label: 'Beginner', rating: '400' },
  { value: 'easy', label: 'Easy', rating: '800' },
  { value: 'medium', label: 'Medium', rating: '1200' },
  { value: 'hard', label: 'Hard', rating: '1600' },
];

export const GameControls = ({
  onNewGame,
  onFlipBoard,
  onUndo,
  onResign,
  isGameOver,
  difficulty,
  onDifficultyChange,
}: GameControlsProps) => {
  return (
    <div className="chess-card p-4 space-y-4">
      <h3 className="font-heading font-semibold text-foreground">Game Controls</h3>
      
      <div className="grid grid-cols-2 gap-2">
        <Button variant="glow" onClick={onNewGame} className="w-full">
          <RefreshCw className="w-4 h-4" />
          New Game
        </Button>
        <Button variant="game" onClick={onFlipBoard}>
          <RotateCcw className="w-4 h-4" />
          Flip Board
        </Button>
        <Button variant="game" onClick={onUndo} disabled={isGameOver}>
          <Undo2 className="w-4 h-4" />
          Undo
        </Button>
        <Button variant="destructive" onClick={onResign} disabled={isGameOver}>
          <Flag className="w-4 h-4" />
          Resign
        </Button>
      </div>

      <div className="space-y-2">
        <label className="text-sm text-muted-foreground font-medium">Bot Difficulty</label>
        <div className="grid grid-cols-2 gap-2">
          {difficulties.map((d) => (
            <button
              key={d.value}
              onClick={() => onDifficultyChange(d.value)}
              className={`p-2 rounded-lg text-sm font-medium transition-all ${
                difficulty === d.value
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              <div>{d.label}</div>
              <div className="text-xs opacity-70">~{d.rating}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
