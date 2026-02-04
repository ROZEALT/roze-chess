import { useState, useMemo } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess, Square } from 'chess.js';
import { useAuth } from '@/contexts/AuthContext';

const boardThemes: Record<string, { light: string; dark: string }> = {
  green: { light: '#eeeed2', dark: '#769656' },
  brown: { light: '#f0d9b5', dark: '#b58863' },
  blue: { light: '#dee3e6', dark: '#8ca2ad' },
  purple: { light: '#e8e4f0', dark: '#8877b7' },
  gray: { light: '#e0e0e0', dark: '#888888' },
};

interface ChessBoardProps {
  fen: string;
  playerColor: 'w' | 'b';
  onPieceDrop: (sourceSquare: Square, targetSquare: Square) => boolean;
  isGameOver: boolean;
  turn: 'w' | 'b';
}

export const ChessBoard = ({ fen, playerColor, onPieceDrop, isGameOver, turn }: ChessBoardProps) => {
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [validMoves, setValidMoves] = useState<Square[]>([]);
  const { settings } = useAuth();

  // Get theme colors from settings
  const theme = boardThemes[settings?.board_theme || 'green'] || boardThemes.green;
  const showCoordinates = settings?.show_coordinates ?? true;
  const highlightMoves = settings?.highlight_moves ?? true;

  // Create a temporary chess instance to calculate valid moves
  const chess = useMemo(() => new Chess(fen), [fen]);

  const getValidMoves = (square: Square): Square[] => {
    const moves = chess.moves({ square, verbose: true });
    return moves.map((move) => move.to as Square);
  };

  const handleSquareClick = (square: Square) => {
    if (isGameOver || turn !== playerColor) return;

    const piece = chess.get(square);

    // If clicking on own piece, select it
    if (piece && piece.color === playerColor) {
      if (selectedSquare === square) {
        // Deselect if clicking same square
        setSelectedSquare(null);
        setValidMoves([]);
      } else {
        // Select new piece
        setSelectedSquare(square);
        setValidMoves(getValidMoves(square));
      }
      return;
    }

    // If a piece is selected and clicking a valid move square, make the move
    if (selectedSquare && validMoves.includes(square)) {
      const success = onPieceDrop(selectedSquare, square);
      if (success) {
        setSelectedSquare(null);
        setValidMoves([]);
      }
      return;
    }

    // Click on empty square or opponent piece without selection - clear selection
    setSelectedSquare(null);
    setValidMoves([]);
  };

  // Reset selection when turn changes or game state changes
  useMemo(() => {
    setSelectedSquare(null);
    setValidMoves([]);
  }, [turn, isGameOver]);

  // Custom square styles for highlighting
  const customSquareStyles: Record<string, React.CSSProperties> = {};

  // Highlight selected square
  if (selectedSquare && highlightMoves) {
    customSquareStyles[selectedSquare] = {
      backgroundColor: 'rgba(255, 255, 0, 0.5)',
      boxShadow: 'inset 0 0 0 3px rgba(255, 200, 0, 0.8)',
    };
  }

  // Highlight valid moves
  if (highlightMoves) {
    validMoves.forEach((square) => {
      const piece = chess.get(square);
      if (piece) {
        // Capture move - red highlight
        customSquareStyles[square] = {
          background: 'radial-gradient(circle, transparent 65%, rgba(255, 80, 80, 0.8) 65%)',
        };
      } else {
        // Normal move - dot indicator
        customSquareStyles[square] = {
          background: 'radial-gradient(circle, rgba(129, 182, 76, 0.7) 25%, transparent 25%)',
        };
      }
    });
  }

  return (
    <div className="chess-card p-3 sm:p-4 glow-effect">
      <Chessboard
        position={fen}
        onPieceDrop={(source, target) => {
          setSelectedSquare(null);
          setValidMoves([]);
          return onPieceDrop(source as Square, target as Square);
        }}
        onSquareClick={handleSquareClick}
        boardOrientation={playerColor === 'w' ? 'white' : 'black'}
        arePiecesDraggable={!isGameOver && turn === playerColor}
        customBoardStyle={{
          borderRadius: '8px',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
        }}
        customDarkSquareStyle={{ backgroundColor: theme.dark }}
        customLightSquareStyle={{ backgroundColor: theme.light }}
        customSquareStyles={customSquareStyles}
        customDropSquareStyle={{
          boxShadow: 'inset 0 0 1px 6px rgba(129, 182, 76, 0.75)',
        }}
        showBoardNotation={showCoordinates}
      />
    </div>
  );
};
