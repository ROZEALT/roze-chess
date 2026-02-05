-- Add points column to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS points integer NOT NULL DEFAULT 0;

-- Create points_history table to track point transactions
CREATE TABLE public.points_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  amount integer NOT NULL,
  reason text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on points_history
ALTER TABLE public.points_history ENABLE ROW LEVEL SECURITY;

-- Users can view their own points history
CREATE POLICY "Users can view own points history"
ON public.points_history
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own points (will be validated by trigger)
CREATE POLICY "Users can insert own points"
ON public.points_history
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create function to update points on profiles when points_history changes
CREATE OR REPLACE FUNCTION public.update_profile_points()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET points = points + NEW.amount
  WHERE user_id = NEW.user_id;
  RETURN NEW;
END;
$$;

-- Trigger to update points when history is inserted
CREATE TRIGGER on_points_history_insert
AFTER INSERT ON public.points_history
FOR EACH ROW
EXECUTE FUNCTION public.update_profile_points();

-- Create daily_login_tracker table to prevent multiple daily bonuses
CREATE TABLE public.daily_login_tracker (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  last_login_date date NOT NULL DEFAULT CURRENT_DATE
);

-- Enable RLS on daily_login_tracker
ALTER TABLE public.daily_login_tracker ENABLE ROW LEVEL SECURITY;

-- Users can view their own login tracker
CREATE POLICY "Users can view own login tracker"
ON public.daily_login_tracker
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own login tracker
CREATE POLICY "Users can insert own login tracker"
ON public.daily_login_tracker
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own login tracker
CREATE POLICY "Users can update own login tracker"
ON public.daily_login_tracker
FOR UPDATE
USING (auth.uid() = user_id);