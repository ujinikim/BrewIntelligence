'use client';

import { useState, useRef, useEffect } from 'react';
import { Coffee, Gauge, Telescope, Library, Compass, FlaskConical, ChevronUp } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/utils/cn';

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [expOpen, setExpOpen] = useState(false);
  const [pipelineDate, setPipelineDate] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
        mobileDropdownRef.current && !mobileDropdownRef.current.contains(e.target as Node)
      ) {
        setExpOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown on route change
  useEffect(() => {
    setExpOpen(false);
  }, [pathname]);

  // Fetch pipeline last-run date
  useEffect(() => {
    fetch('/api/status')
      .then(res => res.json())
      .then(d => {
        if (d.lastUpdated) {
          setPipelineDate(
            new Date(d.lastUpdated).toLocaleDateString('en-US', {
              month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
            })
          );
        }
      })
      .catch(() => { });
  }, []);

  const mainNavItems = [
    { label: 'Dashboard', href: '/', icon: Gauge },
    { label: 'Insights', href: '/insights', icon: Telescope },
    { label: 'Reviews', href: '/reviews', icon: Library },
  ];

  const experimentalItems = [
    { label: 'AI Explorer', href: '/explorer', icon: Compass, description: 'Semantic flavor search' },
    { label: 'Alchemist Lab', href: '/alchemist', icon: FlaskConical, description: 'Blend builder & simulator' },
  ];

  const isExperimentalActive = experimentalItems.some(item => pathname === item.href);

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
              {mainNavItems.map((item) => {
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

              {/* Experimental Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setExpOpen(!expOpen)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-sm font-bold tracking-tight transition-all relative overflow-hidden group flex items-center gap-2",
                    isExperimentalActive
                      ? "text-[#1F1815] bg-stone-100/80 shadow-sm"
                      : "text-stone-500 hover:text-[#1F1815] hover:bg-stone-100/50"
                  )}
                >
                  <FlaskConical size={16} className={cn("transition-colors", isExperimentalActive ? "text-purple-500" : "text-stone-400 group-hover:text-purple-500")} />
                  Experimental
                  <span className="px-1.5 py-0.5 text-[8px] font-black uppercase tracking-widest bg-purple-100 text-purple-600 rounded-md border border-purple-200/50 leading-none">
                    Beta
                  </span>
                  <ChevronUp size={14} className={cn(
                    "text-stone-400 transition-transform duration-200",
                    expOpen ? "rotate-0" : "rotate-180"
                  )} />
                  {isExperimentalActive && (
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-purple-500 rounded-full" />
                  )}
                </button>

                {/* Desktop Dropdown Menu */}
                {expOpen && (
                  <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-stone-200/80 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                    <div className="px-4 py-3 bg-purple-50/50 border-b border-purple-100/50">
                      <p className="text-[10px] font-black text-purple-500 uppercase tracking-[0.2em]">Experimental Features</p>
                      <p className="text-[11px] text-stone-400 mt-0.5">These features are in active development.</p>
                    </div>
                    {experimentalItems.map((item) => {
                      const isActive = pathname === item.href;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={cn(
                            "flex items-start gap-3 px-4 py-3 transition-colors",
                            isActive
                              ? "bg-purple-50/80"
                              : "hover:bg-stone-50"
                          )}
                        >
                          <div className={cn(
                            "p-2 rounded-xl shrink-0 mt-0.5",
                            isActive ? "bg-purple-100 text-purple-600" : "bg-stone-100 text-stone-400"
                          )}>
                            <item.icon size={16} />
                          </div>
                          <div>
                            <p className={cn(
                              "text-sm font-bold",
                              isActive ? "text-purple-700" : "text-stone-700"
                            )}>
                              {item.label}
                            </p>
                            <p className="text-[11px] text-stone-400 mt-0.5">{item.description}</p>
                          </div>
                          {isActive && (
                            <div className="ml-auto self-center w-1.5 h-1.5 rounded-full bg-purple-500" />
                          )}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            </nav>

            {/* Pipeline Status */}
            <div className="hidden sm:flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200/50 rounded-full">
                <div className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest">Online</span>
                {pipelineDate && (
                  <>
                    <div className="w-px h-3 bg-emerald-200" />
                    <span className="text-[10px] font-mono text-emerald-600/70">{pipelineDate}</span>
                  </>
                )}
              </div>
              <span className="px-2.5 py-1 bg-stone-100 text-stone-400 rounded-lg text-[9px] font-bold uppercase tracking-widest border border-stone-200/50">
                v1.3
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden glass border-t border-stone-200/60 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
        {/* Mobile Experimental Dropdown (expands upward) */}
        {expOpen && (
          <div
            ref={mobileDropdownRef}
            className="absolute bottom-full left-0 right-0 bg-white border-t border-stone-200/60 shadow-[0_-8px_30px_rgba(0,0,0,0.1)] animate-in fade-in slide-in-from-bottom-2 duration-200"
          >
            <div className="px-5 py-3 bg-purple-50/50 border-b border-purple-100/50">
              <p className="text-[10px] font-black text-purple-500 uppercase tracking-[0.2em]">Experimental Features</p>
            </div>
            {experimentalItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-5 py-4 border-b border-stone-100 last:border-0 transition-colors",
                    isActive ? "bg-purple-50/80" : "active:bg-stone-50"
                  )}
                >
                  <div className={cn(
                    "p-2 rounded-xl",
                    isActive ? "bg-purple-100 text-purple-600" : "bg-stone-100 text-stone-400"
                  )}>
                    <item.icon size={18} />
                  </div>
                  <div className="flex-1">
                    <p className={cn(
                      "text-sm font-bold",
                      isActive ? "text-purple-700" : "text-stone-700"
                    )}>
                      {item.label}
                    </p>
                    <p className="text-[11px] text-stone-400">{item.description}</p>
                  </div>
                  {isActive && (
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                  )}
                </Link>
              );
            })}
          </div>
        )}

        <div className="flex items-center justify-around h-16 px-2">
          {mainNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all min-w-[4rem] relative",
                  isActive
                    ? "text-stone-900"
                    : "text-stone-400 active:scale-95"
                )}
              >
                <item.icon size={20} className={cn(
                  "transition-colors",
                  isActive ? "text-primary" : "text-stone-400"
                )} />
                <span className={cn(
                  "text-[10px] font-bold tracking-wide",
                  isActive ? "text-stone-900" : "text-stone-400"
                )}>
                  {item.label}
                </span>
                {isActive && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full" />
                )}
              </Link>
            );
          })}

          {/* Mobile Experimental Button */}
          <button
            onClick={() => setExpOpen(!expOpen)}
            className={cn(
              "flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all min-w-[4rem] relative",
              isExperimentalActive
                ? "text-stone-900"
                : "text-stone-400 active:scale-95"
            )}
          >
            <div className="relative">
              <FlaskConical size={20} className={cn(
                "transition-colors",
                isExperimentalActive ? "text-purple-500" : "text-stone-400"
              )} />
              <div className="absolute -top-1 -right-1.5 w-2 h-2 bg-purple-500 rounded-full" />
            </div>
            <span className={cn(
              "text-[10px] font-bold tracking-wide",
              isExperimentalActive ? "text-stone-900" : "text-stone-400"
            )}>
              Labs
            </span>
            {isExperimentalActive && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-purple-500 rounded-full" />
            )}
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-24 md:pb-10">
        <div className="page-enter">
          {children}
        </div>
      </main>

      {/* Simple Footer */}
      <footer className="relative z-10 py-12 border-t border-stone-200/50 mt-20 mb-16 md:mb-0">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="mt-4 text-sm text-stone-500">
            © 2026 BrewIntelligence. Powered by AI and Specialty Passion.
          </p>
          <p className="mt-3 text-xs text-stone-400">
            Data respectfully aggregated from <a href="https://www.coffeereview.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary transition-colors">CoffeeReview.com</a>. All prices displayed in USD.
          </p>
        </div>
      </footer>
    </div>
  );
}
