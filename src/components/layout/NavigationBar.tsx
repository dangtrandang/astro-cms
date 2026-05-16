'use client';

import { forwardRef, useEffect, useState } from 'react';
import { LogIn, UserPlus, Menu, X } from 'lucide-react';

interface NavigationBarProps {
  navigation?: {
    id: string;
    items?: any[];
  };
  globals: {
    logo_on_light_bg?: string;
    logo_on_dark_bg?: string;
  };
  variant?: 'default' | 'overlay';
}

const getHref = (item?: { page?: { permalink?: string | null }; url?: string }) =>
  item?.page?.permalink || item?.url || '#';

const NavigationBar = forwardRef<HTMLElement, NavigationBarProps>(({ navigation, globals, variant = 'default' }, ref) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const directusURL = import.meta.env.PUBLIC_DIRECTUS_URL;

  const logoUrl = globals?.logo_on_dark_bg
    ? `${directusURL}/assets/${globals.logo_on_dark_bg}`
    : globals?.logo_on_light_bg
      ? `${directusURL}/assets/${globals.logo_on_light_bg}`
      : '/images/logo.svg';

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMenuOpen(false);
      }
    };
    const handlePopstate = () => setMenuOpen(false);
    window.addEventListener('resize', handleResize);
    window.addEventListener('popstate', handlePopstate);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('popstate', handlePopstate);
    };
  }, []);

  const isOverlay = variant === 'overlay';

  return (
    <>
      <header
        ref={ref}
        className={
          isOverlay
            ? 'absolute top-0 left-0 right-0 z-[60] bg-transparent text-[#2d3a2a]'
            : 'sticky top-0 z-[60] border-b border-white/20 bg-[#f2d1d1]/70 backdrop-blur-md text-[#2d3a2a]'
        }
      >
        <nav className="flex items-center justify-between px-4 sm:px-6 md:px-10 py-4 sm:py-6">
          {/* Logo */}
          <a href="/" className="flex shrink-0 items-center">
            <img src={logoUrl} alt="Logo" className="block h-8 sm:h-9 w-auto max-w-none" />
          </a>

          {/* Desktop pill nav */}
          <div className="hidden lg:flex items-center gap-1 bg-white/70 backdrop-blur-md rounded-full pl-6 pr-1 py-1 shadow-sm border border-white/60">
            {(navigation?.items || []).map((link: any, i: number) => (
              <a
                key={link.id || i}
                href={getHref(link)}
                className={`text-sm px-3 py-2 rounded-full transition-colors hover:bg-[#f5e1e0] ${i === 0
                  ? 'font-semibold text-[#1f2a1d]'
                  : 'font-medium text-[#4b5b47] hover:text-[#1f2a1d]'
                  }`}
              >
                {link.title}
              </a>
            ))}
            <button className="ml-2 bg-[#1f2a1d] hover:bg-[#850e35] active:bg-[#850e35] text-white text-sm font-medium px-5 py-2.5 rounded-full transition-colors">
              Try it Live
            </button>
          </div>

          {/* Right side: auth links + hamburger */}
          <div className="flex items-center gap-3 sm:gap-6 text-[#2d3a2a]">
            <a
              href="#signup"
              className="hidden sm:flex items-center gap-2 text-sm font-medium hover:opacity-80 transition-opacity"
            >
              <UserPlus className="w-4 h-4" />
              Sign Me Up!
            </a>
            <a
              href="#login"
              className="hidden sm:flex items-center gap-2 text-sm font-medium hover:opacity-80 transition-opacity"
            >
              <LogIn className="w-4 h-4" />
              Enter
            </a>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="lg:hidden relative flex items-center justify-center w-10 h-10 rounded-full bg-white/70 backdrop-blur-md border border-white/60 text-[#1f2a1d] transition-all duration-300 hover:bg-white/90"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
            >
              <Menu
                className={`w-5 h-5 absolute transition-all duration-300 ${menuOpen ? 'opacity-0 rotate-90 scale-50' : 'opacity-100 rotate-0 scale-100'
                  }`}
              />
              <X
                className={`w-5 h-5 absolute transition-all duration-300 ${menuOpen ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-50'
                  }`}
              />
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile menu overlay — outside <header> stacking context */}
      <div
        className={`lg:hidden fixed inset-0 z-[70] transition-opacity duration-300 ${menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
        onClick={() => setMenuOpen(false)}
      >
        <div className="absolute inset-0 bg-[#1f2a1d]/40 backdrop-blur-sm" />
      </div>

      {/* Mobile menu drawer — outside <header> stacking context */}
      <div
        className={`lg:hidden fixed top-0 right-0 bottom-0 z-[70] w-[85%] max-w-sm bg-white/95 backdrop-blur-xl shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${menuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
      >
        <div className="flex flex-col h-full pt-24 px-8 pb-8">
          <div className="flex flex-col gap-1">
            {(navigation?.items || []).map((link: any, i: number) => (
              <a
                key={link.id || i}
                href={getHref(link)}
                onClick={() => setMenuOpen(false)}
                className={`text-2xl font-semibold text-[#1f2a1d] py-4 border-b border-[#1f2a1d]/10 transition-all duration-500 ${menuOpen ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'
                  }`}
                style={{ transitionDelay: menuOpen ? `${150 + i * 70}ms` : '0ms' }}
              >
                {link.title}
              </a>
            ))}
          </div>

          <div
            className={`mt-8 flex flex-col gap-4 transition-all duration-500 ${menuOpen ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'
              }`}
            style={{ transitionDelay: menuOpen ? '400ms' : '0ms' }}
          >
            <a
              href="#signup"
              className="flex items-center gap-2 text-sm font-medium text-[#2d3a2a] sm:hidden"
            >
              <UserPlus className="w-4 h-4" />
              Sign Me Up!
            </a>
            <a
              href="#login"
              className="flex items-center gap-2 text-sm font-medium text-[#2d3a2a] sm:hidden"
            >
              <LogIn className="w-4 h-4" />
              Enter
            </a>
            <button className="mt-2 bg-[#1f2a1d] hover:bg-[#2a3827] text-white text-sm font-semibold px-5 py-3 rounded-full transition-colors">
              Try it Live
            </button>
          </div>
        </div>
      </div>
    </>
  );
});

NavigationBar.displayName = 'NavigationBar';
export default NavigationBar;
