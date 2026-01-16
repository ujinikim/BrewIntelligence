'use client';

import { Coffee } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#F6F5F3] font-sans text-[#1F1815]">
      {/* Navigation / Header - Stumptown 'Warm Editorial' Theme */}
      <header className="sticky top-0 z-10 bg-[#F6F5F3]/90 backdrop-blur-md border-b border-[#e5e5e5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <Coffee className="text-[#1F1815] h-6 w-6" />
              <span className="font-serif font-bold text-2xl text-[#1F1815] tracking-tight">
                Brew<span className="font-light">Intelligence</span>
              </span>
            </Link>
            <div className="flex items-center gap-8">
               <Link 
                 href="/" 
                 className={`text-sm font-medium tracking-wide uppercase transition-colors ${
                   pathname === '/' ? 'text-[#1F1815] font-bold' : 'text-[#1F1815]/60 hover:text-[#1F1815]'
                 }`}
               >
                 Dashboard
               </Link>
               <Link 
                 href="/explorer" 
                 className={`text-sm font-medium tracking-wide uppercase transition-colors ${
                   pathname === '/explorer' ? 'text-[#D4A373] font-bold' : 'text-[#1F1815]/60 hover:text-[#D4A373]'
                 }`}
               >
                 Explorer
               </Link>
              <button className="bg-[#1F1815] text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-black transition-colors hidden md:block">
                v1.0.0
              </button>
            </div>
          </div>
        </div>
      </header>


      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
