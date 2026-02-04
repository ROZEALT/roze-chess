-- Drop the existing update policy
DROP POLICY IF EXISTS "Players can update their games" ON public.online_games;

-- Create a new update policy that allows:
-- 1. Existing players to update their games
-- 2. Any authenticated user to join a waiting game (set themselves as black_player_id)
CREATE POLICY "Players can update their games"
ON public.online_games
FOR UPDATE
USING (
  (auth.uid() = white_player_id) OR 
  (auth.uid() = black_player_id) OR
  (status = 'waiting' AND black_player_id IS NULL)
)
WITH CHECK (
  -- Existing players can update
  (auth.uid() = white_player_id) OR 
  (auth.uid() = black_player_id) OR
  -- New players can only set themselves as black_player_id on waiting games
  (status = 'waiting' AND black_player_id IS NULL AND auth.uid() = black_player_id)
);