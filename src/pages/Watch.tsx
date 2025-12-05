import { Tv, Play, Users, Trophy, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

const liveEvents = [
  { title: 'World Championship 2024', viewers: '125K', status: 'LIVE' },
  { title: 'Titled Tuesday', viewers: '45K', status: 'LIVE' },
  { title: 'Speed Chess Championship', viewers: '32K', status: 'Starting Soon' },
];

const topGames = [
  { white: 'Magnus Carlsen', black: 'Hikaru Nakamura', rating: '2850 vs 2780', event: 'Blitz Battle' },
  { white: 'Fabiano Caruana', black: 'Ding Liren', rating: '2810 vs 2790', event: 'Rapid Match' },
  { white: 'Alireza Firouzja', black: 'Wesley So', rating: '2785 vs 2770', event: 'Arena Kings' },
];

const Watch = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="font-heading font-bold text-3xl text-foreground mb-2">Watch Chess</h1>
        <p className="text-muted-foreground mb-8">Live games, streams, and top player matches.</p>

        {/* Featured Stream */}
        <div className="chess-card p-6 mb-8">
          <div className="bg-secondary rounded-lg aspect-video flex items-center justify-center mb-4">
            <div className="text-center">
              <Tv className="w-16 h-16 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">Live streaming coming soon!</p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-heading font-semibold text-xl text-foreground">ChessTV</h2>
              <p className="text-sm text-muted-foreground">24/7 chess coverage and analysis</p>
            </div>
            <Button variant="glow">
              <Play className="w-4 h-4 mr-2" />
              Watch Now
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Live Events */}
          <div className="chess-card p-5">
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="w-5 h-5 text-primary" />
              <h2 className="font-heading font-semibold text-lg text-foreground">Live Events</h2>
            </div>
            <div className="space-y-3">
              {liveEvents.map((event) => (
                <div key={event.title} className="bg-secondary rounded-lg p-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-foreground">{event.title}</h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {event.viewers} watching
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    event.status === 'LIVE' 
                      ? 'bg-red-500/20 text-red-500' 
                      : 'bg-yellow-500/20 text-yellow-500'
                  }`}>
                    {event.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Games */}
          <div className="chess-card p-5">
            <div className="flex items-center gap-3 mb-4">
              <Trophy className="w-5 h-5 text-primary" />
              <h2 className="font-heading font-semibold text-lg text-foreground">Top Games</h2>
            </div>
            <div className="space-y-3">
              {topGames.map((game, i) => (
                <div key={i} className="bg-secondary rounded-lg p-4 cursor-pointer hover:bg-secondary/80 transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-foreground">{game.white}</span>
                    <span className="text-muted-foreground">vs</span>
                    <span className="font-medium text-foreground">{game.black}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{game.rating}</span>
                    <span className="text-primary">{game.event}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Watch;
