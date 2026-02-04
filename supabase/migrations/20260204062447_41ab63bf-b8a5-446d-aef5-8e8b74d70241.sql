-- Drop and recreate with a clearer policy
DROP POLICY IF EXISTS "Players can update their games" ON public.online_games;

-- Create update policy that properly handles:
-- 1. Existing players updating their active games
-- 2. New players joining waiting games as black_player
CREATE POLICY "Players can update their games"
ON public.online_games
FOR UPDATE
USING (
  -- Allow if you're already a player
  (auth.uid() = white_player_id) OR 
  (auth.uid() = black_player_id) OR
  -- Allow if game is waiting and has no black player (someone joining)
  (status = 'waiting' AND black_player_id IS NULL)
);