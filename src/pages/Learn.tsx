import { Puzzle, BookOpen, Brain, Target, Trophy, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';

const lessons = [
  { title: 'Chess Basics', description: 'Learn how pieces move', icon: BookOpen, level: 'Beginner' },
  { title: 'Tactics Training', description: 'Forks, pins, and skewers', icon: Target, level: 'Intermediate' },
  { title: 'Opening Principles', description: 'Control the center', icon: Brain, level: 'Intermediate' },
  { title: 'Endgame Mastery', description: 'Convert your advantage', icon: Trophy, level: 'Advanced' },
];

const Learn = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-heading font-bold text-3xl text-foreground mb-2">Learn Chess</h1>
        <p className="text-muted-foreground mb-8">Improve your game with lessons, puzzles, and training tools.</p>

        {/* Daily Puzzle */}
        <div className="chess-card p-6 mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-xl bg-yellow-500/20 flex items-center justify-center">
              <Puzzle className="w-8 h-8 text-yellow-500" />
            </div>
            <div>
              <h2 className="font-heading font-semibold text-xl text-foreground">Daily Puzzle</h2>
              <p className="text-sm text-muted-foreground">Solve today's tactical challenge</p>
            </div>
          </div>
          <div className="bg-secondary rounded-lg p-8 text-center mb-4">
            <Lightbulb className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">Puzzle feature coming soon!</p>
            <p className="text-sm text-muted-foreground mt-1">Practice tactics with unlimited puzzles</p>
          </div>
          <Button variant="glow" className="w-full">Start Solving</Button>
        </div>

        {/* Lessons Grid */}
        <h2 className="font-heading font-semibold text-xl text-foreground mb-4">Lessons</h2>
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          {lessons.map((lesson) => (
            <div key={lesson.title} className="chess-card p-5 hover:border-primary transition-colors cursor-pointer group">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                  <lesson.icon className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-heading font-semibold text-foreground group-hover:text-primary transition-colors">
                      {lesson.title}
                    </h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      lesson.level === 'Beginner' ? 'bg-green-500/20 text-green-500' :
                      lesson.level === 'Intermediate' ? 'bg-yellow-500/20 text-yellow-500' :
                      'bg-red-500/20 text-red-500'
                    }`}>
                      {lesson.level}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{lesson.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Training Tools */}
        <h2 className="font-heading font-semibold text-xl text-foreground mb-4">Training Tools</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="chess-card p-5 text-center">
            <Brain className="w-8 h-8 text-primary mx-auto mb-3" />
            <h3 className="font-heading font-semibold text-foreground mb-1">Vision Trainer</h3>
            <p className="text-sm text-muted-foreground">Improve board awareness</p>
          </div>
          <div className="chess-card p-5 text-center">
            <Target className="w-8 h-8 text-primary mx-auto mb-3" />
            <h3 className="font-heading font-semibold text-foreground mb-1">Puzzle Rush</h3>
            <p className="text-sm text-muted-foreground">Solve puzzles against time</p>
          </div>
          <div className="chess-card p-5 text-center">
            <BookOpen className="w-8 h-8 text-primary mx-auto mb-3" />
            <h3 className="font-heading font-semibold text-foreground mb-1">Opening Explorer</h3>
            <p className="text-sm text-muted-foreground">Master popular openings</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Learn;
