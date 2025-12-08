-- Create enum for game status
CREATE TYPE public.game_status AS ENUM ('waiting', 'active', 'completed', 'abandoned');

-- Create enum for time controls
CREATE TYPE public.time_control AS ENUM ('bullet_1', 'bullet_2', 'blitz_3', 'blitz_5', 'rapid_10', 'rapid_15');

-- Create online games table
CREATE TABLE public.online_games (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    white_player_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    black_player_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    status game_status NOT NULL DEFAULT 'waiting',
    time_control time_control NOT NULL DEFAULT 'rapid_10',
    fen TEXT NOT NULL DEFAULT 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    pgn TEXT,
    moves JSONB DEFAULT '[]'::jsonb,
    white_time_remaining INTEGER NOT NULL DEFAULT 600000,
    black_time_remaining INTEGER NOT NULL DEFAULT 600000,
    current_turn TEXT DEFAULT 'w',
    winner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    result TEXT,
    room_code TEXT UNIQUE,
    is_private BOOLEAN DEFAULT false,
    last_move_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create matchmaking queue table
CREATE TABLE public.matchmaking_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    time_control time_control NOT NULL,
    rating INTEGER NOT NULL DEFAULT 1200,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.online_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matchmaking_queue ENABLE ROW LEVEL SECURITY;

-- RLS policies for online_games
CREATE POLICY "Anyone can view active games"
ON public.online_games FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can create games"
ON public.online_games FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = white_player_id OR auth.uid() = black_player_id OR white_player_id IS NULL);

CREATE POLICY "Players can update their games"
ON public.online_games FOR UPDATE
TO authenticated
USING (auth.uid() = white_player_id OR auth.uid() = black_player_id);

-- RLS policies for matchmaking_queue
CREATE POLICY "Users can view queue"
ON public.matchmaking_queue FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can join queue"
ON public.matchmaking_queue FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave queue"
ON public.matchmaking_queue FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Enable realtime for both tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.online_games;
ALTER PUBLICATION supabase_realtime ADD TABLE public.matchmaking_queue;

-- Add updated_at trigger
CREATE TRIGGER update_online_games_updated_at
BEFORE UPDATE ON public.online_games
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();