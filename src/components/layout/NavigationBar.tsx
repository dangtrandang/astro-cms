'use client';

import { forwardRef, useEffect, useState } from 'react';
import { LogIn, Menu, MessageSquare, X } from 'lucide-react';

interface NavigationBarProps {
  navigation?: {
    id: string;
    items?: any[] | null;
  };
  globals: {
    logo_on_light_bg?: string;
    logo_on_dark_bg?: string;
  };
  variant?: 'default' | 'overlay';
  currentPathname?: string;
}

const getHref = (item?: { page?: { permalink?: string | null }; url?: string }) =>
  item?.page?.permalink || item?.url || '#';

const normalizePath = (value?: string) => {
  if (!value) return '/';
  const stripped = value.split('?')[0]?.split('#')[0] || '/';
  if (stripped === '/') return '/';
  return stripped.endsWith('/') ? stripped.slice(0, -1) : stripped;
};

const NavigationBar = forwardRef<HTMLElement, NavigationBarProps>(({ navigation, globals, variant = 'default', currentPathname = '/' }, ref) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<{ firstName: string; lastName: string; avatarUrl: string | null } | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [currentPath, setCurrentPath] = useState(() => normalizePath(currentPathname));
  const directusURL = import.meta.env.PUBLIC_DIRECTUS_URL;

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data: { authenticated: boolean; firstName?: string; lastName?: string; avatarUrl?: string | null }) => {
        if (data.authenticated) {
          setUser({ firstName: data.firstName || '', lastName: data.lastName || '', avatarUrl: data.avatarUrl || null });
        }
      })
      .catch(() => {})
      .finally(() => setAuthLoading(false));
  }, []);

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
    const syncPath = () => setCurrentPath(normalizePath(window.location.pathname));
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMenuOpen(false);
      }
    };
    const handlePopstate = () => {
      setMenuOpen(false);
      syncPath();
    };

    syncPath();
    window.addEventListener('resize', handleResize);
    window.addEventListener('popstate', handlePopstate);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('popstate', handlePopstate);
    };
  }, []);

  const isOverlay = variant === 'overlay';
  const navLinkTone = isOverlay ? 'text-[#4b3d39]/88 hover:text-[#d28080]' : 'text-[#5b4b45]/82 hover:text-[#d28080]';
  const loginButtonTone = isOverlay
    ? 'border border-[#2D2A28] bg-transparent text-[#2D2A28] hover:bg-white/16'
    : 'border border-[#d9c8bf] bg-white/58 text-[#4f403a] hover:bg-white/82';
  const primaryButtonTone = isOverlay
    ? 'bg-dusty-blue text-cream hover:bg-charcoal'
    : 'bg-dusty-blue text-cream hover:bg-charcoal';

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
        <nav className="grid grid-cols-[auto_1fr_auto] items-center gap-4 px-4 py-4 sm:px-6 sm:py-6 md:px-10 xl:px-14">
          <a href="/" className="flex shrink-0 items-center">
            <img src={logoUrl} alt="Logo" className="block h-8 w-auto max-w-none sm:h-9" />
          </a>

          <div className="hidden lg:flex items-center justify-center gap-7 xl:gap-9">
            {(navigation?.items || []).map((link: any, i: number) => {
              const href = getHref(link);
              const isActive = href.startsWith('/') && normalizePath(href) === currentPath;

              return (
                <a
                  key={link.id || i}
                  href={href}
                  className={`relative text-[18px] font-medium transition-colors duration-300 ${isActive ? 'text-[#d28080]' : navLinkTone}`}
                >
                  {link.title}
                  {isActive ? <span className="absolute left-0 top-full mt-2 h-[2px] w-full rounded-full bg-[#d28080]" /> : null}
                </a>
              );
            })}
          </div>

          <div className="flex items-center justify-end gap-3 sm:gap-4">
            <div className="hidden lg:flex items-center gap-3">
              {!authLoading && user ? (
                <a
                  href="/tai-khoan"
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium backdrop-blur-sm transition-colors ${loginButtonTone}`}
                >
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.firstName} className="h-7 w-7 rounded-full object-cover border border-white/60" />
                  ) : (
                    <div className="flex h-7 w-7 items-center justify-center rounded-full border border-white/60 bg-gradient-to-br from-[#c0395b] to-[#f1907c] text-xs font-bold text-white">
                      {(user.firstName || user.lastName || 'N').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span>Tài khoản</span>
                </a>
              ) : (
                <a
                  href="/login"
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium backdrop-blur-sm transition-colors ${loginButtonTone}`}
                >
                  <LogIn className="h-4 w-4" />
                  <span>Đăng nhập</span>
                </a>
              )}
              <a
                href="/lien-he"
                className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium shadow-sm transition-colors ${primaryButtonTone}`}
              >
                <MessageSquare className="h-4 w-4" />
                <span>Trò chuyện cùng Ngọc</span>
              </a>
            </div>

            <button
              onClick={() => setMenuOpen((v) => !v)}
              className={`relative flex h-10 w-10 items-center justify-center rounded-full backdrop-blur-md transition-all duration-300 lg:hidden ${isOverlay
                ? 'bg-white/18 text-[#3e312d] hover:bg-white/28'
                : 'bg-white/75 text-[#4f403a] hover:bg-white'
                }`}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
            >
              <Menu
                className={`absolute h-5 w-5 transition-all duration-300 ${menuOpen ? 'rotate-90 scale-50 opacity-0' : 'rotate-0 scale-100 opacity-100'
                  }`}
              />
              <X
                className={`absolute h-5 w-5 transition-all duration-300 ${menuOpen ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-50 opacity-0'
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
        <div className="absolute inset-0 bg-charcoal/40 backdrop-blur-sm" />
      </div>

      {/* Mobile menu drawer — outside <header> stacking context */}
      <div
        className={`fixed top-0 right-0 bottom-0 z-[70] w-[85%] max-w-sm transition-transform duration-500 ease-[transition-timing-function:cubic-bezier(0.22,1,0.36,1)] lg:hidden ${menuOpen ? 'translate-x-0' : 'translate-x-full'
          } ${isOverlay ? 'bg-[rgba(255,248,244,0.94)]' : 'bg-[rgba(255,250,247,0.97)]'} backdrop-blur-xl shadow-2xl`}
      >
        <div className="flex h-full flex-col px-8 pb-8 pt-24">
          <div className="flex flex-col gap-1">
            {(navigation?.items || []).map((link: any, i: number) => {
              const href = getHref(link);
              const isActive = href.startsWith('/') && normalizePath(href) === currentPath;

              return (
                <a
                  key={link.id || i}
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className={`py-4 text-2xl font-semibold transition-all duration-500 ${isActive ? 'text-[#d28080]' : 'text-[#3c312f]'} ${menuOpen ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'
                    }`}
                  style={{ transitionDelay: menuOpen ? `${150 + i * 70}ms` : '0ms' }}
                >
                  {link.title}
                </a>
              );
            })}
          </div>

          <div
            className={`mt-8 flex flex-col gap-4 transition-all duration-500 ${menuOpen ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'
              }`}
            style={{ transitionDelay: menuOpen ? '400ms' : '0ms' }}
          >
            {!authLoading && user ? (
              <a
                href="/tai-khoan"
                onClick={() => setMenuOpen(false)}
                className="inline-flex items-center gap-3 px-1 py-2 text-sm font-medium text-[#4f403a]"
              >
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.firstName} className="h-10 w-10 rounded-full object-cover border border-[#1f2a1d]/10" />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#c0395b] to-[#f1907c] text-base font-bold text-white">
                    {(user.firstName || user.lastName || 'N').charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="text-base">Tài khoản</span>
              </a>
            ) : (
              <a
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="inline-flex items-center gap-2 px-1 py-2 text-sm font-medium text-[#4f403a]"
              >
                <LogIn className="h-4 w-4" />
                <span>Đăng nhập</span>
              </a>
            )}
            <a
              href="/lien-he"
              onClick={() => setMenuOpen(false)}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-dusty-blue px-5 py-3.5 text-sm font-semibold text-cream shadow-sm transition-colors hover:bg-charcoal"
            >
              <MessageSquare className="h-4 w-4" />
              <span>Trò chuyện cùng Ngọc</span>
            </a>
          </div>
        </div>
      </div>
    </>
  );
});

NavigationBar.displayName = 'NavigationBar';
export default NavigationBar;
