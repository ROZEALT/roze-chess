import { Chessboard } from 'react-chessboard';
import { Square } from 'chess.js';

interface ChessBoardProps {
  fen: string;
  playerColor: 'w' | 'b';
  onPieceDrop: (sourceSquare: Square, targetSquare: Square) => boolean;
  isGameOver: boolean;
}

export const ChessBoard = ({ fen, playerColor, onPieceDrop, isGameOver }: ChessBoardProps) => {
  return (
    <div className="chess-card p-3 sm:p-4 glow-effect">
      <Chessboard
        position={fen}
        onPieceDrop={(source, target) => onPieceDrop(source as Square, target as Square)}
        boardOrientation={playerColor === 'w' ? 'white' : 'black'}
        arePiecesDraggable={!isGameOver}
        customBoardStyle={{
          borderRadius: '8px',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
        }}
        customDarkSquareStyle={{ backgroundColor: '#769656' }}
        customLightSquareStyle={{ backgroundColor: '#eeeed2' }}
        customDropSquareStyle={{
          boxShadow: 'inset 0 0 1px 6px rgba(129, 182, 76, 0.75)',
        }}
      />
    </div>
  );
};
