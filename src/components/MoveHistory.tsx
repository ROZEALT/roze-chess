import { Move } from 'chess.js';
import { ScrollArea } from '@/components/ui/scroll-area';

interface MoveHistoryProps {
  moves: Move[];
}

export const MoveHistory = ({ moves }: MoveHistoryProps) => {
  const movePairs: { number: number; white?: string; black?: string }[] = [];
  
  for (let i = 0; i < moves.length; i += 2) {
    movePairs.push({
      number: Math.floor(i / 2) + 1,
      white: moves[i]?.san,
      black: moves[i + 1]?.san,
    });
  }

  return (
    <div className="chess-card p-4 h-full">
      <h3 className="font-heading font-semibold text-foreground mb-3">Move History</h3>
      <ScrollArea className="h-[200px] pr-4">
        {movePairs.length === 0 ? (
          <p className="text-muted-foreground text-sm">No moves yet</p>
        ) : (
          <div className="space-y-1">
            {movePairs.map((pair) => (
              <div
                key={pair.number}
                className="flex items-center text-sm font-mono animate-fade-in"
              >
                <span className="w-8 text-muted-foreground">{pair.number}.</span>
                <span className="w-16 text-foreground font-medium">{pair.white || ''}</span>
                <span className="w-16 text-foreground font-medium">{pair.black || ''}</span>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};
