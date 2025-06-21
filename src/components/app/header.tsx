"use client";

import { BookMarked, Mic, Pencil } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/writing', label: 'Writing', icon: Pencil },
  { href: '/speaking', label: 'Speaking', icon: Mic },
];

export default function AppHeader() {
  const pathname = usePathname();

  return (
    <header className="py-6 text-center border-b border-border/40 bg-card/50 sticky top-0 z-10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center gap-3 mb-4">
            <BookMarked className="w-10 h-10 text-primary" />
            <h1 className="text-4xl md:text-5xl font-bold font-headline tracking-tight text-primary">
                IELTS Ace
            </h1>
        </div>
        <nav className="flex justify-center">
          <div className="flex items-center gap-2 rounded-full bg-muted p-1">
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 justify-center rounded-full px-4 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-background/70"
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </header>
  );
}
