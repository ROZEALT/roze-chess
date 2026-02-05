 import { useCallback } from 'react';
 import { supabase } from '@/integrations/supabase/client';
 import { useAuth } from '@/contexts/AuthContext';
 import { useToast } from '@/hooks/use-toast';
 
 export type PointsReason = 
   | 'daily_login'
   | 'game_won'
   | 'move_made'
   | 'friend_added'
   | 'premium_purchase';
 
 const POINTS_AMOUNTS: Record<PointsReason, number> = {
   daily_login: 10,
   game_won: 25,
   move_made: 1,
   friend_added: 15,
   premium_purchase: -300,
 };
 
 const PREMIUM_COST = 300;
 
 export const usePoints = () => {
   const { user, profile, refreshProfile } = useAuth();
   const { toast } = useToast();
 
   const addPoints = useCallback(async (reason: PointsReason): Promise<boolean> => {
     if (!user) return false;
 
     const amount = POINTS_AMOUNTS[reason];
 
     const { error } = await supabase
       .from('points_history')
       .insert({
         user_id: user.id,
         amount,
         reason,
       });
 
     if (error) {
       console.error('Error adding points:', error);
       return false;
     }
 
     await refreshProfile();
     return true;
   }, [user, refreshProfile]);
 
   const checkDailyLogin = useCallback(async (): Promise<void> => {
     if (!user) return;
 
     const today = new Date().toISOString().split('T')[0];
 
     const { data: tracker } = await supabase
       .from('daily_login_tracker')
       .select('last_login_date')
       .eq('user_id', user.id)
       .single();
 
     if (!tracker) {
       // First login ever - create tracker and award points
       await supabase
         .from('daily_login_tracker')
         .insert({ user_id: user.id, last_login_date: today });
       
       await addPoints('daily_login');
       toast({
         title: '🎉 Daily Bonus!',
         description: '+10 points for logging in today!',
       });
     } else if (tracker.last_login_date !== today) {
       // New day - update tracker and award points
       await supabase
         .from('daily_login_tracker')
         .update({ last_login_date: today })
         .eq('user_id', user.id);
       
       await addPoints('daily_login');
       toast({
         title: '🎉 Daily Bonus!',
         description: '+10 points for logging in today!',
       });
     }
   }, [user, addPoints, toast]);
 
   const purchasePremium = useCallback(async (): Promise<boolean> => {
     if (!user || !profile) return false;
 
     if ((profile.points ?? 0) < PREMIUM_COST) {
       toast({
         title: 'Not Enough Points',
         description: `You need ${PREMIUM_COST} points to unlock Vault Chess+. You have ${profile.points ?? 0}.`,
         variant: 'destructive',
       });
       return false;
     }
 
     // Deduct points
     const pointsSuccess = await addPoints('premium_purchase');
     if (!pointsSuccess) {
       toast({
         title: 'Error',
         description: 'Failed to process purchase. Please try again.',
         variant: 'destructive',
       });
       return false;
     }
 
     // Update premium status
     const { error } = await supabase
       .from('profiles')
       .update({ is_premium: true })
       .eq('user_id', user.id);
 
     if (error) {
       toast({
         title: 'Error',
         description: 'Failed to activate premium. Please contact support.',
         variant: 'destructive',
       });
       return false;
     }
 
     await refreshProfile();
     toast({
       title: '🎊 Welcome to Vault Chess+!',
       description: 'You now have access to premium features!',
     });
     return true;
   }, [user, profile, addPoints, refreshProfile, toast]);
 
   return {
     points: profile?.points ?? 0,
     isPremium: profile?.is_premium ?? false,
     addPoints,
     checkDailyLogin,
     purchasePremium,
     PREMIUM_COST,
   };
 };