 import { ReactNode, useState } from 'react';
 import { Crown, Lock } from 'lucide-react';
 import { Button } from '@/components/ui/button';
 import PremiumUpgradeDialog from './PremiumUpgradeDialog';
 import { usePoints } from '@/hooks/usePoints';
 
 interface PremiumGateProps {
   children: ReactNode;
   featureName: string;
   showOverlay?: boolean;
 }
 
 export const PremiumGate = ({ children, featureName, showOverlay = true }: PremiumGateProps) => {
   const { isPremium } = usePoints();
   const [showUpgrade, setShowUpgrade] = useState(false);
 
   if (isPremium) {
     return <>{children}</>;
   }
 
   if (!showOverlay) {
     return (
       <>
         <div onClick={() => setShowUpgrade(true)} className="cursor-pointer">
           {children}
         </div>
         <PremiumUpgradeDialog open={showUpgrade} onOpenChange={setShowUpgrade} />
       </>
     );
   }
 
   return (
     <>
       <div className="relative">
         <div className="opacity-50 pointer-events-none blur-sm">
           {children}
         </div>
         <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm rounded-lg">
           <Lock className="w-8 h-8 text-muted-foreground mb-3" />
           <p className="text-sm text-muted-foreground mb-3 text-center px-4">
             {featureName} requires Vault Chess+
           </p>
           <Button variant="glow" size="sm" onClick={() => setShowUpgrade(true)}>
             <Crown className="w-4 h-4 mr-2" />
             Unlock
           </Button>
         </div>
       </div>
       <PremiumUpgradeDialog open={showUpgrade} onOpenChange={setShowUpgrade} />
     </>
   );
 };
 
 export const PremiumButton = ({ 
   children, 
   onClick, 
   ...props 
 }: { children: ReactNode; onClick?: () => void } & React.ComponentProps<typeof Button>) => {
   const { isPremium } = usePoints();
   const [showUpgrade, setShowUpgrade] = useState(false);
 
   if (isPremium) {
     return <Button onClick={onClick} {...props}>{children}</Button>;
   }
 
   return (
     <>
       <Button onClick={() => setShowUpgrade(true)} {...props}>
         <Lock className="w-4 h-4 mr-2" />
         {children}
       </Button>
       <PremiumUpgradeDialog open={showUpgrade} onOpenChange={setShowUpgrade} />
     </>
   );
 };