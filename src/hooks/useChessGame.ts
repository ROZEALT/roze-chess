import { useState, useCallback, useEffect } from 'react';
import { Chess, Square, Move } from 'chess.js';

export type Difficulty = 'beginner' | 'easy' | 'medium' | 'hard';

interface GameState {
  fen: string;
  turn: 'w' | 'b';
  isGameOver: boolean;
  isCheck: boolean;
  isCheckmate: boolean;
  isDraw: boolean;
  isStalemate: boolean;
  moveHistory: Move[];
  capturedPieces: { white: string[]; black: string[] };
}

export const useChessGame = (difficulty: Difficulty = 'easy') => {
  const [game] = useState(new Chess());
  const [gameState, setGameState] = useState<GameState>(getGameState(game));
  const [playerColor, setPlayerColor] = useState<'w' | 'b'>('w');

  function getGameState(chess: Chess): GameState {
    const history = chess.history({ verbose: true });
    const capturedPieces = { white: [] as string[], black: [] as string[] };
    
    history.forEach((move) => {
      if (move.captured) {
        if (move.color === 'w') {
          capturedPieces.white.push(move.captured);
        } else {
          capturedPieces.black.push(move.captured);
        }
      }
    });

    return {
      fen: chess.fen(),
      turn: chess.turn(),
      isGameOver: chess.isGameOver(),
      isCheck: chess.isCheck(),
      isCheckmate: chess.isCheckmate(),
      isDraw: chess.isDraw(),
      isStalemate: chess.isStalemate(),
      moveHistory: history,
      capturedPieces,
    };
  }

  const updateGameState = useCallback(() => {
    setGameState(getGameState(game));
  }, [game]);

  const makeMove = useCallback(
    (from: Square, to: Square, promotion?: string): boolean => {
      try {
        const move = game.move({
          from,
          to,
          promotion: promotion || 'q',
        });
        if (move) {
          updateGameState();
          return true;
        }
      } catch {
        return false;
      }
      return false;
    },
    [game, updateGameState]
  );

  const getAIMove = useCallback((): Move | null => {
    const moves = game.moves({ verbose: true });
    if (moves.length === 0) return null;

    switch (difficulty) {
      case 'beginner':
        // Random moves
        return moves[Math.floor(Math.random() * moves.length)];
      
      case 'easy':
        // Prefer captures, otherwise random
        const captures = moves.filter((m) => m.captured);
        if (captures.length > 0 && Math.random() > 0.3) {
          return captures[Math.floor(Math.random() * captures.length)];
        }
        return moves[Math.floor(Math.random() * moves.length)];
      
      case 'medium':
        // Simple evaluation: prioritize captures by piece value
        const pieceValues: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
        const scored = moves.map((m) => ({
          move: m,
          score: m.captured ? pieceValues[m.captured] + Math.random() : Math.random() * 0.5,
        }));
        scored.sort((a, b) => b.score - a.score);
        return scored[0].move;
      
      case 'hard':
        // Better evaluation with some lookahead simulation
        const hardScored = moves.map((m) => {
          let score = Math.random() * 0.3;
          const pieceVals: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
          
          if (m.captured) score += pieceVals[m.captured] * 2;
          if (m.san.includes('+')) score += 1.5; // Check
          if (m.san.includes('#')) score += 100; // Checkmate
          
          // Center control bonus
          if (['d4', 'd5', 'e4', 'e5'].includes(m.to)) score += 0.5;
          
          // Development bonus in opening
          if (game.moveNumber() < 10 && ['n', 'b'].includes(m.piece)) score += 0.3;
          
          return { move: m, score };
        });
        hardScored.sort((a, b) => b.score - a.score);
        return hardScored[0].move;
      
      default:
        return moves[Math.floor(Math.random() * moves.length)];
    }
  }, [game, difficulty]);

  const makeAIMove = useCallback(() => {
    if (game.isGameOver()) return;
    
    const aiMove = getAIMove();
    if (aiMove) {
      setTimeout(() => {
        game.move(aiMove);
        updateGameState();
      }, 300 + Math.random() * 400);
    }
  }, [game, getAIMove, updateGameState]);

  const resetGame = useCallback(() => {
    game.reset();
    updateGameState();
  }, [game, updateGameState]);

  const flipBoard = useCallback(() => {
    setPlayerColor((prev) => (prev === 'w' ? 'b' : 'w'));
  }, []);

  const undoMove = useCallback(() => {
    game.undo();
    game.undo(); // Undo both player and AI move
    updateGameState();
  }, [game, updateGameState]);

  // AI makes move when it's its turn
  useEffect(() => {
    if (!gameState.isGameOver && gameState.turn !== playerColor) {
      makeAIMove();
    }
  }, [gameState.turn, gameState.isGameOver, playerColor, makeAIMove]);

  return {
    gameState,
    playerColor,
    makeMove,
    resetGame,
    flipBoard,
    undoMove,
    setPlayerColor,
  };
};
