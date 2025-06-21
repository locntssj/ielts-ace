import { BookMarked } from 'lucide-react';

export default function AppHeader() {
  return (
    <header className="py-8 text-center border-b border-border/40 bg-card/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center gap-3 mb-2">
            <BookMarked className="w-10 h-10 text-primary" />
            <h1 className="text-4xl md:text-5xl font-bold font-headline tracking-tight text-primary">
                IELTS Ace
            </h1>
        </div>
        <p className="max-w-2xl mx-auto text-muted-foreground">
          Get instant, detailed feedback on your IELTS Writing essays with the power of AI.
        </p>
      </div>
    </header>
  );
}
