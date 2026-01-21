'use client';

import { Coffee, Search, Database, Beaker, Map } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/utils/cn';

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { label: 'Dashboard', href: '/', icon: Map },
    { label: 'Reviews', href: '/reviews', icon: Database },
    { label: 'AI Explorer', href: '/explorer', icon: Search },
    { label: 'Alchemist Lab', href: '/alchemist', icon: Beaker },
  ];

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#1F1815]">
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-5%] right-[-5%] w-[30%] h-[30%] bg-accent/5 blur-[100px] rounded-full" />
      </div>

      {/* Modern Top Header */}
      <header className="sticky top-0 z-50 glass border-b border-stone-200/50 h-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex justify-between items-center h-full">
            {/* Logo */}
            <Link href="/" className="group flex items-center gap-3 transition-transform active:scale-95">
              <div className="bg-stone-800 p-2 rounded-xl text-white group-hover:rotate-12 transition-transform">
                <Coffee size={24} />
              </div>
              <span className="font-serif font-bold text-2xl tracking-tighter text-gradient">
                Brew<span className="font-light">Intelligence</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "px-4 py-2 rounded-xl text-sm font-bold tracking-tight transition-all relative overflow-hidden group",
                      isActive 
                        ? "text-[#1F1815] bg-stone-100/80 shadow-sm" 
                        : "text-stone-500 hover:text-[#1F1815] hover:bg-stone-100/50"
                    )}
                  >
                    <span className="relative z-10 flex items-center gap-2">
                        <item.icon size={16} className={cn("transition-colors", isActive ? "text-primary" : "text-stone-400 group-hover:text-primary")} />
                        {item.label}
                    </span>
                    {isActive && (
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-full" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Version Badge */}
            <div className="flex items-center gap-4">
               <span className="px-3 py-1 bg-stone-100 text-stone-500 rounded-lg text-[10px] font-bold uppercase tracking-widest border border-stone-200/50">
                 Alpha v1.2.0
               </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="page-enter">
            {children}
        </div>
      </main>

      {/* Simple Footer */}
      <footer className="relative z-10 py-12 border-t border-stone-200/50 mt-20">
          <div className="max-w-7xl mx-auto px-6 text-center">
              <p className="text-xs font-bold text-stone-400 uppercase tracking-[0.4em]">
                  The Future of Coffee Intelligence
              </p>
              <p className="mt-4 text-sm text-stone-500">
                  © 2026 BrewIntelligence. Powered by AI and Specialty Passion.
              </p>
          </div>
      </footer>
    </div>
  );
}
