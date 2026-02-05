 import { Crown, Sparkles, Palette, Box, Users } from 'lucide-react';
 import {
   Dialog,
   DialogContent,
   DialogDescription,
   DialogFooter,
   DialogHeader,
   DialogTitle,
 } from '@/components/ui/dialog';
 import { Button } from '@/components/ui/button';
 import { usePoints } from '@/hooks/usePoints';
 
 interface PremiumUpgradeDialogProps {
   open: boolean;
   onOpenChange: (open: boolean) => void;
 }
 
 const PremiumUpgradeDialog = ({ open, onOpenChange }: PremiumUpgradeDialogProps) => {
   const { points, purchasePremium, PREMIUM_COST } = usePoints();
   const canAfford = points >= PREMIUM_COST;
 
   const handlePurchase = async () => {
     const success = await purchasePremium();
     if (success) {
       onOpenChange(false);
     }
   };
 
   const features = [
     { icon: Box, label: '3D Chess Mode', description: 'Play chess in immersive 3D' },
     { icon: Users, label: 'Create Clubs', description: 'Build your chess community' },
     { icon: Palette, label: 'Custom Themes', description: 'Pick board themes & piece sets' },
   ];
 
   return (
     <Dialog open={open} onOpenChange={onOpenChange}>
       <DialogContent className="sm:max-w-md">
         <DialogHeader>
           <DialogTitle className="flex items-center gap-2 text-xl">
             <Crown className="w-6 h-6 text-yellow-500" />
             Vault Chess+
           </DialogTitle>
           <DialogDescription>
             Unlock premium features for {PREMIUM_COST} points
           </DialogDescription>
         </DialogHeader>
         
         <div className="space-y-4 py-4">
           <div className="flex items-center justify-between p-3 rounded-lg bg-secondary">
             <span className="text-sm text-muted-foreground">Your Points</span>
             <span className={`font-bold text-lg ${canAfford ? 'text-primary' : 'text-destructive'}`}>
               {points} / {PREMIUM_COST}
             </span>
           </div>
 
           <div className="space-y-3">
             {features.map((feature) => (
               <div key={feature.label} className="flex items-start gap-3 p-3 rounded-lg border border-border">
                 <feature.icon className="w-5 h-5 text-primary mt-0.5" />
                 <div>
                   <p className="font-medium text-foreground">{feature.label}</p>
                   <p className="text-sm text-muted-foreground">{feature.description}</p>
                 </div>
               </div>
             ))}
           </div>
 
           {!canAfford && (
             <div className="p-3 rounded-lg bg-muted text-sm text-muted-foreground">
               <Sparkles className="w-4 h-4 inline mr-2" />
               Earn points by winning games, making moves, adding friends, and logging in daily!
             </div>
           )}
         </div>
 
         <DialogFooter>
           <Button variant="outline" onClick={() => onOpenChange(false)}>
             Maybe Later
           </Button>
           <Button 
             variant="glow"
             onClick={handlePurchase}
             disabled={!canAfford}
           >
             <Crown className="w-4 h-4 mr-2" />
             Unlock for {PREMIUM_COST} pts
           </Button>
         </DialogFooter>
       </DialogContent>
     </Dialog>
   );
 };
 
 export default PremiumUpgradeDialog;