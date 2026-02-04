import { useState, useEffect, useCallback, useRef } from 'react';
import { Chess, Square } from 'chess.js';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Database } from '@/integrations/supabase/types';

type TimeControl = Database['public']['Enums']['time_control'];
type GameStatus = Database['public']['Enums']['game_status'];

interface OnlineGameState {
  id: string;
  fen: string;
  turn: 'w' | 'b';
  playerColor: 'w' | 'b' | null;
  whiteTimeRemaining: number;
  blackTimeRemaining: number;
  status: GameStatus;
  isGameOver: boolean;
  isCheck: boolean;
  isCheckmate: boolean;
  isDraw: boolean;
  result: string | null;
  roomCode: string | null;
  opponentId: string | null;
  moves: string[];
}

const TIME_CONTROL_MS: Record<TimeControl, number> = {
  bullet_1: 60000,
  bullet_2: 120000,
  blitz_3: 180000,
  blitz_5: 300000,
  rapid_10: 600000,
  rapid_15: 900000,
};

export const useOnlineGame = () => {
  const { user, profile } = useAuth();
  const [gameState, setGameState] = useState<OnlineGameState | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chessRef = useRef<Chess>(new Chess());
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const generateRoomCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const getRatingForTimeControl = (timeControl: TimeControl): number => {
    if (!profile) return 1200;
    if (timeControl.startsWith('bullet')) return profile.rating_bullet || 1200;
    if (timeControl.startsWith('blitz')) return profile.rating_blitz || 1200;
    return profile.rating_rapid || 1200;
  };

  const updateGameState = useCallback((game: Chess, dbGame: any) => {
    const playerColor = dbGame.white_player_id === user?.id ? 'w' : 
                        dbGame.black_player_id === user?.id ? 'b' : null;
    
    setGameState({
      id: dbGame.id,
      fen: game.fen(),
      turn: game.turn() as 'w' | 'b',
      playerColor,
      whiteTimeRemaining: dbGame.white_time_remaining,
      blackTimeRemaining: dbGame.black_time_remaining,
      status: dbGame.status,
      isGameOver: game.isGameOver() || dbGame.status === 'completed',
      isCheck: game.isCheck(),
      isCheckmate: game.isCheckmate(),
      isDraw: game.isDraw(),
      result: dbGame.result,
      roomCode: dbGame.room_code,
      opponentId: playerColor === 'w' ? dbGame.black_player_id : dbGame.white_player_id,
      moves: dbGame.moves || [],
    });
  }, [user?.id]);

  const joinQueue = async (timeControl: TimeControl) => {
    if (!user) return;
    setIsSearching(true);
    setError(null);

    try {
      // Check for existing opponent in queue
      const { data: opponent } = await supabase
        .from('matchmaking_queue')
        .select('*')
        .eq('time_control', timeControl)
        .neq('user_id', user.id)
        .order('joined_at', { ascending: true })
        .limit(1)
        .maybeSingle();

      if (opponent) {
        // Match found - create game
        const timeMs = TIME_CONTROL_MS[timeControl];
        const whitePlayerId = Math.random() > 0.5 ? user.id : opponent.user_id;
        const blackPlayerId = whitePlayerId === user.id ? opponent.user_id : user.id;

        const { data: game, error: gameError } = await supabase
          .from('online_games')
          .insert({
            white_player_id: whitePlayerId,
            black_player_id: blackPlayerId,
            status: 'active',
            time_control: timeControl,
            white_time_remaining: timeMs,
            black_time_remaining: timeMs,
          })
          .select()
          .single();

        if (gameError) throw gameError;

        // Remove opponent from queue
        await supabase.from('matchmaking_queue').delete().eq('user_id', opponent.user_id);
        
        chessRef.current = new Chess();
        updateGameState(chessRef.current, game);
        setIsSearching(false);
      } else {
        // No opponent - join queue
        const rating = getRatingForTimeControl(timeControl);
        await supabase.from('matchmaking_queue').upsert({
          user_id: user.id,
          time_control: timeControl,
          rating,
        });
      }
    } catch (err: any) {
      setError(err.message);
      setIsSearching(false);
    }
  };

  const leaveQueue = async () => {
    if (!user) return;
    await supabase.from('matchmaking_queue').delete().eq('user_id', user.id);
    setIsSearching(false);
  };

  const createPrivateRoom = async (timeControl: TimeControl) => {
    if (!user) return null;
    setError(null);

    try {
      const timeMs = TIME_CONTROL_MS[timeControl];
      const roomCode = generateRoomCode();

      const { data: game, error: gameError } = await supabase
        .from('online_games')
        .insert({
          white_player_id: user.id,
          status: 'waiting',
          time_control: timeControl,
          white_time_remaining: timeMs,
          black_time_remaining: timeMs,
          room_code: roomCode,
          is_private: true,
        })
        .select()
        .single();

      if (gameError) throw gameError;

      chessRef.current = new Chess();
      updateGameState(chessRef.current, game);
      return roomCode;
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  };

  const joinPrivateRoom = async (roomCode: string) => {
    if (!user) return false;
    setError(null);

    try {
      const { data: game, error: fetchError } = await supabase
        .from('online_games')
        .select('*')
        .eq('room_code', roomCode.toUpperCase())
        .eq('status', 'waiting')
        .maybeSingle();

      if (fetchError) throw fetchError;
      if (!game) {
        setError('Room not found or game already started');
        return false;
      }

      if (game.white_player_id === user.id) {
        setError('You cannot join your own game');
        return false;
      }

      const { data: updatedGame, error: updateError } = await supabase
        .from('online_games')
        .update({
          black_player_id: user.id,
          status: 'active',
        })
        .eq('id', game.id)
        .select()
        .single();

      if (updateError) throw updateError;

      chessRef.current = new Chess();
      updateGameState(chessRef.current, updatedGame);
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  };

  const makeMove = async (source: Square, target: Square): Promise<boolean> => {
    if (!gameState || !user) return false;
    if (gameState.playerColor !== gameState.turn) return false;
    if (gameState.status !== 'active') return false;

    try {
      const move = chessRef.current.move({ from: source, to: target, promotion: 'q' });
      if (!move) return false;

      const newMoves = [...(gameState.moves || []), move.san];
      const isGameOver = chessRef.current.isGameOver();
      let result = null;
      let status: GameStatus = 'active';

      if (isGameOver) {
        status = 'completed';
        if (chessRef.current.isCheckmate()) {
          result = gameState.turn === 'w' ? 'white_wins' : 'black_wins';
        } else {
          result = 'draw';
        }
      }

      const { error: updateError } = await supabase
        .from('online_games')
        .update({
          fen: chessRef.current.fen(),
          moves: newMoves,
          current_turn: chessRef.current.turn(),
          status,
          result,
          last_move_at: new Date().toISOString(),
        })
        .eq('id', gameState.id);

      if (updateError) {
        chessRef.current.undo();
        return false;
      }

      return true;
    } catch {
      return false;
    }
  };

  const resign = async () => {
    if (!gameState || !user) return;

    const result = gameState.playerColor === 'w' ? 'black_wins' : 'white_wins';
    const winnerId = gameState.playerColor === 'w' 
      ? gameState.opponentId 
      : user.id;

    await supabase
      .from('online_games')
      .update({
        status: 'completed',
        result,
        winner_id: winnerId,
      })
      .eq('id', gameState.id);
  };

  const leaveGame = () => {
    setGameState(null);
    chessRef.current = new Chess();
  };

  // Subscribe to matchmaking queue for matches
  useEffect(() => {
    if (!user || !isSearching) return;

    const channel = supabase
      .channel('matchmaking')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'online_games',
          filter: `black_player_id=eq.${user.id}`,
        },
        (payload) => {
          const game = payload.new as any;
          chessRef.current = new Chess(game.fen);
          updateGameState(chessRef.current, game);
          setIsSearching(false);
          supabase.from('matchmaking_queue').delete().eq('user_id', user.id);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'online_games',
          filter: `white_player_id=eq.${user.id}`,
        },
        (payload) => {
          const game = payload.new as any;
          if (game.status === 'active') {
            chessRef.current = new Chess(game.fen);
            updateGameState(chessRef.current, game);
            setIsSearching(false);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, isSearching, updateGameState]);

  // Subscribe to game updates (including when opponent joins private room)
  useEffect(() => {
    if (!gameState?.id) return;

    const channel = supabase
      .channel(`game-${gameState.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'online_games',
          filter: `id=eq.${gameState.id}`,
        },
        (payload) => {
          const game = payload.new as any;
          console.log('Game update received:', game);
          chessRef.current = new Chess(game.fen);
          updateGameState(chessRef.current, game);
        }
      )
      .subscribe((status) => {
        console.log('Game subscription status:', status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [gameState?.id, updateGameState]);

  // Timer effect
  useEffect(() => {
    if (!gameState || gameState.status !== 'active' || gameState.isGameOver) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setGameState(prev => {
        if (!prev) return null;
        const isWhiteTurn = prev.turn === 'w';
        const newWhiteTime = isWhiteTurn ? prev.whiteTimeRemaining - 100 : prev.whiteTimeRemaining;
        const newBlackTime = !isWhiteTurn ? prev.blackTimeRemaining - 100 : prev.blackTimeRemaining;

        if (newWhiteTime <= 0 || newBlackTime <= 0) {
          // Time ran out
          if (prev.playerColor === prev.turn) {
            supabase.from('online_games').update({
              status: 'completed',
              result: prev.turn === 'w' ? 'black_wins' : 'white_wins',
            }).eq('id', prev.id);
          }
        }

        return {
          ...prev,
          whiteTimeRemaining: Math.max(0, newWhiteTime),
          blackTimeRemaining: Math.max(0, newBlackTime),
        };
      });
    }, 100);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState?.id, gameState?.status, gameState?.turn]);

  return {
    gameState,
    isSearching,
    error,
    joinQueue,
    leaveQueue,
    createPrivateRoom,
    joinPrivateRoom,
    makeMove,
    resign,
    leaveGame,
  };
};
