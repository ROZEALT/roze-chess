import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useOnlineGame } from '@/hooks/useOnlineGame';
import { OnlineGameLobby } from '@/components/OnlineGameLobby';
import { OnlineGameBoard } from '@/components/OnlineGameBoard';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

const Online = () => {
  const { user, loading } = useAuth();
  const {
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
  } = useOnlineGame();

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6 text-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Play Online</h1>
        <p className="text-muted-foreground">
          Challenge players from around the world in real-time matches
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6 max-w-2xl mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {gameState && gameState.status !== 'waiting' ? (
        <OnlineGameBoard
          gameState={gameState}
          onMove={makeMove}
          onResign={resign}
          onLeaveGame={leaveGame}
        />
      ) : (
        <OnlineGameLobby
          onQuickMatch={joinQueue}
          onCreateRoom={createPrivateRoom}
          onJoinRoom={joinPrivateRoom}
          isSearching={isSearching}
          onCancelSearch={leaveQueue}
          roomCode={gameState?.roomCode || null}
        />
      )}
    </div>
  );
};

export default Online;
