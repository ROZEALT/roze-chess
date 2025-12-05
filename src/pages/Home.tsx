import { Link } from 'react-router-dom';
import { Play, Puzzle, Trophy, Users, Zap, Clock, Bot, Swords } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const quickPlayOptions = [
  { label: 'Bullet', time: '1 min', icon: Zap, color: 'text-yellow-500' },
  { label: 'Blitz', time: '3 min', icon: Zap, color: 'text-orange-500' },
  { label: 'Rapid', time: '10 min', icon: Clock, color: 'text-primary' },
  { label: 'Daily', time: '1 day', icon: Clock, color: 'text-blue-500' },
];

const Home = () => {
  const { user, profile } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="chess-card p-8 mb-8 text-center">
        <h1 className="font-heading font-bold text-4xl md:text-5xl text-foreground mb-4">
          {user ? `Welcome back, ${profile?.username || 'Player'}!` : 'Play Chess Online'}
        </h1>
        <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
          Challenge players worldwide, solve puzzles, and improve your game with our comprehensive chess platform.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link to="/play">
            <Button variant="glow" size="lg" className="gap-2">
              <Play className="w-5 h-5" />
              Play Now
            </Button>
          </Link>
          <Link to="/learn">
            <Button variant="game" size="lg" className="gap-2">
              <Puzzle className="w-5 h-5" />
              Solve Puzzles
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Play */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {quickPlayOptions.map((option) => (
          <Link key={option.label} to="/play">
            <div className="chess-card p-6 hover:border-primary transition-colors cursor-pointer group">
              <option.icon className={`w-8 h-8 ${option.color} mb-3`} />
              <h3 className="font-heading font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
                {option.label}
              </h3>
              <p className="text-sm text-muted-foreground">{option.time}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Stats & Features */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="chess-card p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <Bot className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-heading font-semibold text-foreground">Play vs Bots</h3>
              <p className="text-sm text-muted-foreground">All skill levels</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Practice against AI opponents from beginner to grandmaster level.
          </p>
        </div>

        <div className="chess-card p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
              <Puzzle className="w-6 h-6 text-yellow-500" />
            </div>
            <div>
              <h3 className="font-heading font-semibold text-foreground">Daily Puzzles</h3>
              <p className="text-sm text-muted-foreground">Sharpen tactics</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Solve unlimited puzzles and improve your tactical vision.
          </p>
        </div>

        <div className="chess-card p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <Trophy className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <h3 className="font-heading font-semibold text-foreground">Tournaments</h3>
              <p className="text-sm text-muted-foreground">Compete & win</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Join tournaments and climb the leaderboard rankings.
          </p>
        </div>
      </div>

      {/* User Stats */}
      {user && profile && (
        <div className="chess-card p-6">
          <h2 className="font-heading font-semibold text-xl text-foreground mb-4">Your Stats</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-secondary rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-primary">{profile.rating_rapid}</p>
              <p className="text-sm text-muted-foreground">Rapid Rating</p>
            </div>
            <div className="bg-secondary rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-foreground">{profile.games_played}</p>
              <p className="text-sm text-muted-foreground">Games Played</p>
            </div>
            <div className="bg-secondary rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-green-500">{profile.games_won}</p>
              <p className="text-sm text-muted-foreground">Wins</p>
            </div>
            <div className="bg-secondary rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-foreground">
                {profile.games_played > 0 
                  ? Math.round((profile.games_won / profile.games_played) * 100) 
                  : 0}%
              </p>
              <p className="text-sm text-muted-foreground">Win Rate</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
