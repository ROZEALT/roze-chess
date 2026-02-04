import { useState, useMemo } from 'react';
import { Chess, Square } from 'chess.js';
import { ChessPiece3D } from './ChessPiece3D';
import { useAuth } from '@/contexts/AuthContext';

const boardThemes: Record<string, { light: string; dark: string }> = {
  green: { light: '#e8d5b0', dark: '#4a7c4e' },
  brown: { light: '#d4b896', dark: '#8b5a2b' },
  blue: { light: '#c4d4dc', dark: '#5a7a8a' },
  purple: { light: '#d8d0e0', dark: '#6a5a8a' },
  gray: { light: '#c8c8c8', dark: '#606060' },
};

interface ChessBoard3DProps {
  fen: string;
  playerColor: 'w' | 'b';
  onMove: (from: Square, to: Square) => boolean;
  isGameOver: boolean;
  turn: 'w' | 'b';
}

const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const ranks = ['1', '2', '3', '4', '5', '6', '7', '8'];

export const ChessBoard3D = ({ fen, playerColor, onMove, isGameOver, turn }: ChessBoard3DProps) => {
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [validMoves, setValidMoves] = useState<Square[]>([]);
  const { settings } = useAuth();
  
  // Get theme colors from settings
  const theme = boardThemes[settings?.board_theme || 'green'] || boardThemes.green;
  const highlightMoves = settings?.highlight_moves ?? true;
  
  const chess = useMemo(() => new Chess(fen), [fen]);
  
  const getValidMoves = (square: Square): Square[] => {
    const moves = chess.moves({ square, verbose: true });
    return moves.map((move) => move.to as Square);
  };
  
  const squareToPosition = (square: Square): [number, number, number] => {
    const file = files.indexOf(square[0]);
    const rank = parseInt(square[1]) - 1;
    
    // Flip board based on player color
    const x = playerColor === 'w' ? file - 3.5 : 3.5 - file;
    const z = playerColor === 'w' ? 3.5 - rank : rank - 3.5;
    
    return [x, 0, z];
  };
  
  const positionToSquare = (x: number, z: number): Square | null => {
    let file: number, rank: number;
    
    if (playerColor === 'w') {
      file = Math.round(x + 3.5);
      rank = Math.round(3.5 - z);
    } else {
      file = Math.round(3.5 - x);
      rank = Math.round(z + 3.5);
    }
    
    if (file < 0 || file > 7 || rank < 0 || rank > 7) return null;
    return `${files[file]}${ranks[rank]}` as Square;
  };
  
  const handleSquareClick = (square: Square) => {
    if (isGameOver || turn !== playerColor) return;
    
    const piece = chess.get(square);
    
    // If clicking on own piece, select it
    if (piece && piece.color === playerColor) {
      if (selectedSquare === square) {
        setSelectedSquare(null);
        setValidMoves([]);
      } else {
        setSelectedSquare(square);
        setValidMoves(getValidMoves(square));
      }
      return;
    }
    
    // If a piece is selected and clicking a valid move square
    if (selectedSquare && validMoves.includes(square)) {
      const success = onMove(selectedSquare, square);
      if (success) {
        setSelectedSquare(null);
        setValidMoves([]);
      }
      return;
    }
    
    // Clear selection
    setSelectedSquare(null);
    setValidMoves([]);
  };
  
  const handleBoardClick = (e: any) => {
    e.stopPropagation();
    const point = e.point;
    const square = positionToSquare(point.x, point.z);
    if (square) {
      handleSquareClick(square);
    }
  };
  
  // Build pieces from FEN
  const pieces: { square: Square; type: string; color: 'w' | 'b' }[] = [];
  for (let rank = 0; rank < 8; rank++) {
    for (let file = 0; file < 8; file++) {
      const square = `${files[file]}${ranks[rank]}` as Square;
      const piece = chess.get(square);
      if (piece) {
        pieces.push({ square, type: piece.type, color: piece.color });
      }
    }
  }

  return (
    <group>
      {/* Board base - darker wood */}
      <mesh position={[0, -0.15, 0]} receiveShadow>
        <boxGeometry args={[9, 0.3, 9]} />
        <meshStandardMaterial color="#3d2817" />
      </mesh>
      
      {/* Board squares */}
      {files.map((file, fileIndex) =>
        ranks.map((rank, rankIndex) => {
          const square = `${file}${rank}` as Square;
          const isLight = (fileIndex + rankIndex) % 2 === 1;
          const pos = squareToPosition(square);
          const isValidMove = highlightMoves && validMoves.includes(square);
          const isSelected = highlightMoves && selectedSquare === square;
          
          // Use theme colors
          let color = isLight ? theme.light : theme.dark;
          if (isSelected) color = '#d4a824';
          else if (isValidMove) color = '#6acd6a';
          
          return (
            <mesh
              key={square}
              position={[pos[0], 0.01, pos[2]]}
              rotation={[-Math.PI / 2, 0, 0]}
              onClick={handleBoardClick}
              receiveShadow
            >
              <planeGeometry args={[1, 1]} />
              <meshStandardMaterial color={color} />
            </mesh>
          );
        })
      )}
      
      {/* Valid move indicators */}
      {validMoves.map((square) => {
        const pos = squareToPosition(square);
        const hasPiece = chess.get(square);
        
        return (
          <mesh
            key={`indicator-${square}`}
            position={[pos[0], 0.02, pos[2]]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            {hasPiece ? (
              <ringGeometry args={[0.35, 0.45, 32]} />
            ) : (
              <circleGeometry args={[0.15, 32]} />
            )}
            <meshStandardMaterial 
              color={hasPiece ? '#ff6b6b' : '#4CAF50'} 
              transparent 
              opacity={0.8} 
            />
          </mesh>
        );
      })}
      
      {/* Chess pieces */}
      {pieces.map(({ square, type, color }) => (
        <ChessPiece3D
          key={square}
          type={type}
          color={color}
          position={squareToPosition(square)}
          isSelected={selectedSquare === square}
          isValidMove={validMoves.includes(square)}
          onClick={() => handleSquareClick(square)}
        />
      ))}
    </group>
  );
};
