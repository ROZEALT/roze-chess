import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Zap, Clock, Timer, Users, Copy, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';

type TimeControl = Database['public']['Enums']['time_control'];

interface TimeControlOption {
  value: TimeControl;
  label: string;
  time: string;
  icon: React.ReactNode;
  category: 'bullet' | 'blitz' | 'rapid';
}

const TIME_CONTROLS: TimeControlOption[] = [
  { value: 'bullet_1', label: '1 min', time: '1+0', icon: <Zap className="h-4 w-4" />, category: 'bullet' },
  { value: 'bullet_2', label: '2 min', time: '2+0', icon: <Zap className="h-4 w-4" />, category: 'bullet' },
  { value: 'blitz_3', label: '3 min', time: '3+0', icon: <Timer className="h-4 w-4" />, category: 'blitz' },
  { value: 'blitz_5', label: '5 min', time: '5+0', icon: <Timer className="h-4 w-4" />, category: 'blitz' },
  { value: 'rapid_10', label: '10 min', time: '10+0', icon: <Clock className="h-4 w-4" />, category: 'rapid' },
  { value: 'rapid_15', label: '15 min', time: '15+0', icon: <Clock className="h-4 w-4" />, category: 'rapid' },
];

interface OnlineGameLobbyProps {
  onQuickMatch: (timeControl: TimeControl) => void;
  onCreateRoom: (timeControl: TimeControl) => Promise<string | null>;
  onJoinRoom: (code: string) => Promise<boolean>;
  isSearching: boolean;
  onCancelSearch: () => void;
  roomCode: string | null;
}

export const OnlineGameLobby = ({
  onQuickMatch,
  onCreateRoom,
  onJoinRoom,
  isSearching,
  onCancelSearch,
  roomCode,
}: OnlineGameLobbyProps) => {
  const [selectedTimeControl, setSelectedTimeControl] = useState<TimeControl>('blitz_5');
  const [joinCode, setJoinCode] = useState('');
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [createdRoomCode, setCreatedRoomCode] = useState<string | null>(roomCode);
  const { toast } = useToast();

  const handleQuickMatch = () => {
    onQuickMatch(selectedTimeControl);
  };

  const handleCreateRoom = async () => {
    setIsCreatingRoom(true);
    const code = await onCreateRoom(selectedTimeControl);
    if (code) {
      setCreatedRoomCode(code);
      toast({
        title: "Room Created",
        description: `Share code: ${code}`,
      });
    }
    setIsCreatingRoom(false);
  };

  const handleJoinRoom = async () => {
    if (!joinCode.trim()) return;
    const success = await onJoinRoom(joinCode);
    if (!success) {
      toast({
        title: "Failed to Join",
        description: "Room not found or game already started.",
        variant: "destructive",
      });
    }
  };

  const copyRoomCode = () => {
    if (createdRoomCode) {
      navigator.clipboard.writeText(createdRoomCode);
      toast({ title: "Copied!", description: "Room code copied to clipboard." });
    }
  };

  if (isSearching) {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="pt-6 text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <h3 className="text-xl font-semibold mb-2">Searching for opponent...</h3>
          <p className="text-muted-foreground mb-4">
            {TIME_CONTROLS.find(tc => tc.value === selectedTimeControl)?.label} game
          </p>
          <Button variant="outline" onClick={onCancelSearch}>
            Cancel
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (createdRoomCode) {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Waiting for Opponent
          </CardTitle>
          <CardDescription>Share this code with a friend</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-muted rounded-lg p-4 text-center">
              <span className="text-3xl font-mono font-bold tracking-widest">
                {createdRoomCode}
              </span>
            </div>
            <Button variant="outline" size="icon" onClick={copyRoomCode}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Waiting for player to join...</span>
          </div>
          <Button variant="outline" className="w-full" onClick={() => setCreatedRoomCode(null)}>
            Cancel
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Select Time Control</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2 mb-4">
            {['bullet', 'blitz', 'rapid'].map((category) => (
              <div key={category} className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground capitalize text-center">
                  {category}
                </h4>
                {TIME_CONTROLS.filter(tc => tc.category === category).map((tc) => (
                  <Button
                    key={tc.value}
                    variant={selectedTimeControl === tc.value ? 'default' : 'outline'}
                    className="w-full"
                    onClick={() => setSelectedTimeControl(tc.value)}
                  >
                    {tc.icon}
                    <span className="ml-2">{tc.time}</span>
                  </Button>
                ))}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="quick" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="quick">Quick Match</TabsTrigger>
          <TabsTrigger value="private">Private Room</TabsTrigger>
        </TabsList>

        <TabsContent value="quick">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Quick Match
              </CardTitle>
              <CardDescription>
                Find an opponent automatically based on your rating
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" size="lg" onClick={handleQuickMatch}>
                Find Opponent
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="private">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Private Room
              </CardTitle>
              <CardDescription>
                Create a room or join with a code
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                className="w-full" 
                size="lg" 
                onClick={handleCreateRoom}
                disabled={isCreatingRoom}
              >
                {isCreatingRoom ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Create Room
              </Button>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">or</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Input
                  placeholder="Enter room code"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  maxLength={6}
                  className="font-mono text-center uppercase"
                />
                <Button onClick={handleJoinRoom} disabled={!joinCode.trim()}>
                  Join
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
