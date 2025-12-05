import { Crown } from 'lucide-react';

export const Header = () => {
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center shadow-lg">
            <Crown className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-heading font-bold text-xl text-foreground">ChessMaster</h1>
            <p className="text-xs text-muted-foreground">Play • Learn • Compete</p>
          </div>
        </div>
        
        <nav className="hidden md:flex items-center gap-6">
          <a href="#" className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">
            Play
          </a>
          <a href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Puzzles
          </a>
          <a href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Learn
          </a>
          <a href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Watch
          </a>
        </nav>
        
        <div className="flex items-center gap-2">
          <div className="chess-card px-3 py-1.5 flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Rating</span>
            <span className="font-heading font-bold text-primary">1200</span>
          </div>
        </div>
      </div>
    </header>
  );
};
