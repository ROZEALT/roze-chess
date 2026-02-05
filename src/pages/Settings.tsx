import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
 import { Settings as SettingsIcon, Palette, Volume2, MousePointer, Eye, Check, Crown, Lock, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
 import { usePoints } from '@/hooks/usePoints';
 import PremiumUpgradeDialog from '@/components/PremiumUpgradeDialog';

const boardThemes = [
  { id: 'green', name: 'Classic Green', light: '#eeeed2', dark: '#769656' },
  { id: 'brown', name: 'Wood Brown', light: '#f0d9b5', dark: '#b58863' },
  { id: 'blue', name: 'Ocean Blue', light: '#dee3e6', dark: '#8ca2ad' },
  { id: 'purple', name: 'Royal Purple', light: '#e8e4f0', dark: '#8877b7' },
  { id: 'gray', name: 'Slate Gray', light: '#e0e0e0', dark: '#888888' },
];

const pieceSets = [
  { id: 'neo', name: 'Neo' },
  { id: 'classic', name: 'Classic' },
  { id: 'wood', name: 'Wood' },
  { id: 'metal', name: 'Metal' },
  { id: 'glass', name: 'Glass' },
];

const Settings = () => {
  const { user, settings, updateSettings } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
   const { isPremium, points, PREMIUM_COST } = usePoints();
   const [showUpgrade, setShowUpgrade] = useState(false);

  const [localSettings, setLocalSettings] = useState({
    board_theme: 'green',
    piece_set: 'neo',
    sounds_enabled: true,
    move_confirmation: false,
    premove_enabled: true,
    show_coordinates: true,
    highlight_moves: true,
  });

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    if (settings) {
      setLocalSettings(settings);
    }
  }, [user, settings, navigate]);

  const handleSave = async () => {
    await updateSettings(localSettings);
    toast({
      title: 'Settings Saved',
      description: 'Your preferences have been updated.',
    });
  };

  const updateLocal = (key: string, value: any) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <SettingsIcon className="w-8 h-8 text-primary" />
          <h1 className="font-heading font-bold text-3xl text-foreground">Settings</h1>
        </div>

        {/* Board Theme */}
        <div className="chess-card p-6 mb-6">
           <div className="flex items-center justify-between mb-4">
             <div className="flex items-center gap-3">
            <Palette className="w-5 h-5 text-primary" />
            <h2 className="font-heading font-semibold text-lg text-foreground">Board Theme</h2>
             </div>
             {!isPremium && (
               <span className="flex items-center gap-1 text-xs text-muted-foreground bg-secondary px-2 py-1 rounded">
                 <Lock className="w-3 h-3" /> Premium
               </span>
             )}
          </div>
           <div className={`grid grid-cols-2 sm:grid-cols-3 gap-3 ${!isPremium ? 'opacity-50 pointer-events-none' : ''}`}>
            {boardThemes.map((theme) => (
              <button
                key={theme.id}
                onClick={() => updateLocal('board_theme', theme.id)}
                 className={`p-3 rounded-lg border-2 transition-all ${
                  localSettings.board_theme === theme.id
                    ? 'border-primary'
                    : 'border-transparent hover:border-border'
                }`}
                 disabled={!isPremium}
              >
                <div className="flex mb-2">
                  <div className="w-8 h-8 rounded-l" style={{ backgroundColor: theme.light }} />
                  <div className="w-8 h-8 rounded-r" style={{ backgroundColor: theme.dark }} />
                </div>
                <p className="text-sm text-foreground">{theme.name}</p>
                {localSettings.board_theme === theme.id && (
                  <Check className="w-4 h-4 text-primary mt-1" />
                )}
              </button>
            ))}
          </div>
           {!isPremium && (
             <Button variant="outline" size="sm" className="mt-3" onClick={() => setShowUpgrade(true)}>
               <Crown className="w-4 h-4 mr-2" />
               Unlock with Vault Chess+
             </Button>
           )}
        </div>

        {/* Piece Set */}
        <div className="chess-card p-6 mb-6">
           <div className="flex items-center justify-between mb-4">
             <div className="flex items-center gap-3">
            <MousePointer className="w-5 h-5 text-primary" />
            <h2 className="font-heading font-semibold text-lg text-foreground">Piece Set</h2>
             </div>
             {!isPremium && (
               <span className="flex items-center gap-1 text-xs text-muted-foreground bg-secondary px-2 py-1 rounded">
                 <Lock className="w-3 h-3" /> Premium
               </span>
             )}
          </div>
           <div className={`flex flex-wrap gap-2 ${!isPremium ? 'opacity-50 pointer-events-none' : ''}`}>
            {pieceSets.map((set) => (
              <button
                key={set.id}
                onClick={() => updateLocal('piece_set', set.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  localSettings.piece_set === set.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
                 disabled={!isPremium}
              >
                {set.name}
              </button>
            ))}
          </div>
           {!isPremium && (
             <Button variant="outline" size="sm" className="mt-3" onClick={() => setShowUpgrade(true)}>
               <Crown className="w-4 h-4 mr-2" />
               Unlock with Vault Chess+
             </Button>
           )}
        </div>

        {/* Sound Settings */}
        <div className="chess-card p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Volume2 className="w-5 h-5 text-primary" />
            <h2 className="font-heading font-semibold text-lg text-foreground">Sound</h2>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-foreground font-medium">Game Sounds</p>
              <p className="text-sm text-muted-foreground">Play sounds for moves and captures</p>
            </div>
            <Switch
              checked={localSettings.sounds_enabled}
              onCheckedChange={(checked) => updateLocal('sounds_enabled', checked)}
            />
          </div>
        </div>

        {/* Game Settings */}
        <div className="chess-card p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Eye className="w-5 h-5 text-primary" />
            <h2 className="font-heading font-semibold text-lg text-foreground">Game Preferences</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-foreground font-medium">Move Confirmation</p>
                <p className="text-sm text-muted-foreground">Require confirmation before moves</p>
              </div>
              <Switch
                checked={localSettings.move_confirmation}
                onCheckedChange={(checked) => updateLocal('move_confirmation', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-foreground font-medium">Premoves</p>
                <p className="text-sm text-muted-foreground">Queue moves in advance</p>
              </div>
              <Switch
                checked={localSettings.premove_enabled}
                onCheckedChange={(checked) => updateLocal('premove_enabled', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-foreground font-medium">Show Coordinates</p>
                <p className="text-sm text-muted-foreground">Display board coordinates</p>
              </div>
              <Switch
                checked={localSettings.show_coordinates}
                onCheckedChange={(checked) => updateLocal('show_coordinates', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-foreground font-medium">Highlight Moves</p>
                <p className="text-sm text-muted-foreground">Show legal moves when selecting a piece</p>
              </div>
              <Switch
                checked={localSettings.highlight_moves}
                onCheckedChange={(checked) => updateLocal('highlight_moves', checked)}
              />
            </div>
          </div>
        </div>

        <Button variant="glow" size="lg" className="w-full" onClick={handleSave}>
          Save Settings
        </Button>
         
         {/* Premium Upgrade Card */}
         {!isPremium && (
           <div className="chess-card p-6 mt-6 border-primary/30 bg-gradient-to-br from-card to-primary/5">
             <div className="flex items-center gap-3 mb-4">
               <Crown className="w-6 h-6 text-primary" />
               <h2 className="font-heading font-semibold text-lg text-foreground">Vault Chess+</h2>
             </div>
             <p className="text-sm text-muted-foreground mb-4">
               Unlock premium features including 3D chess, custom themes, piece sets, and the ability to create clubs.
             </p>
             <div className="flex items-center justify-between mb-4">
               <div className="flex items-center gap-2">
                 <Sparkles className="w-4 h-4 text-muted-foreground" />
                 <span className="text-sm">Your Points: <strong>{points}</strong></span>
               </div>
               <span className="text-sm text-muted-foreground">Cost: {PREMIUM_COST} pts</span>
             </div>
             <Button variant="glow" className="w-full" onClick={() => setShowUpgrade(true)}>
               <Crown className="w-4 h-4 mr-2" />
               Upgrade Now
             </Button>
           </div>
         )}
      </div>
       
       <PremiumUpgradeDialog open={showUpgrade} onOpenChange={setShowUpgrade} />
    </div>
  );
};

export default Settings;
