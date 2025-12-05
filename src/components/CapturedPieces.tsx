interface CapturedPiecesProps {
  capturedPieces: { white: string[]; black: string[] };
}

const pieceSymbols: Record<string, { white: string; black: string }> = {
  p: { white: '♙', black: '♟' },
  n: { white: '♘', black: '♞' },
  b: { white: '♗', black: '♝' },
  r: { white: '♖', black: '♜' },
  q: { white: '♕', black: '♛' },
};

const pieceValues: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9 };

export const CapturedPieces = ({ capturedPieces }: CapturedPiecesProps) => {
  const calculateScore = (pieces: string[]) =>
    pieces.reduce((sum, p) => sum + (pieceValues[p] || 0), 0);

  const whiteScore = calculateScore(capturedPieces.white);
  const blackScore = calculateScore(capturedPieces.black);
  const advantage = whiteScore - blackScore;

  return (
    <div className="chess-card p-4 space-y-3">
      <h3 className="font-heading font-semibold text-foreground">Captured Pieces</h3>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">White captured:</span>
          <div className="flex gap-0.5 text-2xl">
            {capturedPieces.white.map((p, i) => (
              <span key={i} className="animate-scale-in">
                {pieceSymbols[p]?.black || p}
              </span>
            ))}
            {capturedPieces.white.length === 0 && (
              <span className="text-sm text-muted-foreground">—</span>
            )}
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Black captured:</span>
          <div className="flex gap-0.5 text-2xl">
            {capturedPieces.black.map((p, i) => (
              <span key={i} className="animate-scale-in">
                {pieceSymbols[p]?.white || p}
              </span>
            ))}
            {capturedPieces.black.length === 0 && (
              <span className="text-sm text-muted-foreground">—</span>
            )}
          </div>
        </div>
      </div>

      {advantage !== 0 && (
        <div className="pt-2 border-t border-border">
          <span className="text-sm">
            <span className="text-muted-foreground">Advantage: </span>
            <span className={advantage > 0 ? 'text-primary font-semibold' : 'text-foreground font-semibold'}>
              {advantage > 0 ? `White +${advantage}` : `Black +${Math.abs(advantage)}`}
            </span>
          </span>
        </div>
      )}
    </div>
  );
};
