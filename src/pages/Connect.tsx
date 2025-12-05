import { Users, MessageSquare, Trophy, UserPlus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';

const clubs = [
  { name: 'Beginners Club', members: '12.5K', activity: 'Very Active' },
  { name: 'Chess Strategy Masters', members: '8.2K', activity: 'Active' },
  { name: 'Speed Chess Enthusiasts', members: '5.1K', activity: 'Active' },
];

const Connect = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto chess-card p-8 text-center">
          <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="font-heading font-semibold text-xl text-foreground mb-2">
            Join the Community
          </h2>
          <p className="text-muted-foreground mb-6">
            Sign in to connect with other players, join clubs, and make friends.
          </p>
          <Link to="/auth">
            <Button variant="glow">Sign In to Continue</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-heading font-bold text-3xl text-foreground mb-2">Connect</h1>
        <p className="text-muted-foreground mb-8">Find friends, join clubs, and chat with the community.</p>

        {/* Search */}
        <div className="chess-card p-4 mb-8">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search players..." className="pl-10" />
            </div>
            <Button variant="glow">Search</Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Friends */}
          <div className="chess-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <UserPlus className="w-5 h-5 text-primary" />
                <h2 className="font-heading font-semibold text-lg text-foreground">Friends</h2>
              </div>
              <span className="text-sm text-muted-foreground">0 online</span>
            </div>
            <div className="bg-secondary rounded-lg p-8 text-center">
              <UserPlus className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground mb-1">No friends yet</p>
              <p className="text-sm text-muted-foreground">Search for players to add friends</p>
            </div>
          </div>

          {/* Messages */}
          <div className="chess-card p-5">
            <div className="flex items-center gap-3 mb-4">
              <MessageSquare className="w-5 h-5 text-primary" />
              <h2 className="font-heading font-semibold text-lg text-foreground">Messages</h2>
            </div>
            <div className="bg-secondary rounded-lg p-8 text-center">
              <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground mb-1">No messages</p>
              <p className="text-sm text-muted-foreground">Start a conversation with a friend</p>
            </div>
          </div>
        </div>

        {/* Clubs */}
        <div className="chess-card p-5 mt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Trophy className="w-5 h-5 text-primary" />
              <h2 className="font-heading font-semibold text-lg text-foreground">Popular Clubs</h2>
            </div>
            <Button variant="outline" size="sm">Browse All</Button>
          </div>
          <div className="space-y-3">
            {clubs.map((club) => (
              <div key={club.name} className="bg-secondary rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">{club.name}</h3>
                    <p className="text-sm text-muted-foreground">{club.members} members</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-primary">{club.activity}</span>
                  <Button variant="game" size="sm">Join</Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Connect;
