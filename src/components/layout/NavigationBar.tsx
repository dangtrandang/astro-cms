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
                  <div
                    className={`absolute left-1/2 -translate-x-1/2 top-full mt-2 w-[90px] h-auto pointer-events-none transition-all duration-300 ease-out ${
                      isActive
                        ? 'opacity-100 translate-y-0 scale-100'
                        : 'opacity-0 translate-y-1 scale-90'
                    }`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="2.86 352.9 714.28 45.81"
                      className="w-full h-auto text-[#d28080]"
                      fill="currentColor"
                    >
                      <defs>
                        <clipPath id={`arrow-clip-${i}`}>
                          <path
                            d="M 2.855469 352.113281 L 716.855469 352.113281 L 716.855469 399 L 2.855469 399 Z M 2.855469 352.113281"
                            clipRule="nonzero"
                          />
                        </clipPath>
                      </defs>
                      <g clipPath={`url(#arrow-clip-${i})`}>
                        <path
                          d="M 278.488281 363.277344 C 277.054688 362.050781 274.703125 362.050781 273.269531 363.277344 L 261.222656 373.574219 C 259.789062 374.800781 259.789062 376.808594 261.222656 378.035156 L 273.269531 388.328125 C 274.703125 389.558594 277.054688 389.558594 278.488281 388.328125 L 290.539062 378.035156 C 291.972656 376.808594 291.972656 374.800781 290.539062 373.574219 Z M 364.4375 354.464844 C 361.996094 352.375 357.992188 352.375 355.546875 354.464844 L 335.03125 372.003906 C 332.589844 374.097656 332.589844 377.515625 335.03125 379.609375 L 355.546875 397.136719 C 357.992188 399.230469 361.996094 399.230469 364.4375 397.136719 L 384.964844 379.609375 C 387.410156 377.515625 387.410156 374.097656 384.964844 372.003906 Z M 242.351562 369.195312 C 238.703125 369.195312 235.746094 372.152344 235.746094 375.800781 C 235.746094 379.453125 238.703125 382.410156 242.351562 382.410156 C 246.003906 382.410156 248.960938 379.453125 248.960938 375.800781 C 248.960938 372.152344 246.003906 369.195312 242.351562 369.195312 Z M 309.40625 369.195312 C 305.757812 369.195312 302.796875 372.152344 302.796875 375.800781 C 302.796875 379.453125 305.757812 382.410156 309.40625 382.410156 C 313.058594 382.410156 316.015625 379.453125 316.015625 375.800781 C 316.015625 372.152344 313.058594 369.195312 309.40625 369.195312 Z M 214.085938 371.09375 C 211.484375 371.09375 209.375 373.199219 209.375 375.800781 C 209.375 378.40625 211.484375 380.515625 214.085938 380.515625 C 216.6875 380.515625 218.796875 378.40625 218.796875 375.800781 C 218.796875 373.199219 216.6875 371.09375 214.085938 371.09375 Z M 2.855469 375.800781 L 190.113281 380.175781 L 185.734375 375.800781 L 190.113281 371.429688 Z M 446.726562 363.277344 C 445.289062 362.050781 442.9375 362.050781 441.503906 363.277344 L 429.457031 373.570312 C 428.019531 374.800781 428.019531 376.808594 429.457031 378.035156 L 441.503906 388.328125 C 442.9375 389.558594 445.289062 389.558594 446.726562 388.328125 L 458.769531 378.035156 C 460.207031 376.808594 460.207031 374.800781 458.769531 373.570312 Z M 477.644531 369.195312 C 473.992188 369.195312 471.035156 372.152344 471.035156 375.800781 C 471.035156 379.453125 473.992188 382.410156 477.644531 382.410156 C 481.289062 382.410156 484.246094 379.453125 484.246094 375.800781 C 484.246094 372.152344 481.289062 369.195312 477.644531 369.195312 Z M 410.585938 369.195312 C 406.9375 369.195312 403.976562 372.152344 403.976562 375.800781 C 403.976562 379.453125 406.9375 382.410156 410.585938 382.410156 C 414.238281 382.410156 417.195312 379.453125 417.195312 375.800781 C 417.195312 372.152344 414.238281 369.195312 410.585938 369.195312 Z M 505.914062 371.09375 C 503.304688 371.09375 501.195312 373.199219 501.195312 375.800781 C 501.195312 378.402344 503.304688 380.515625 505.914062 380.515625 C 508.511719 380.515625 510.621094 378.402344 510.621094 375.800781 C 510.621094 373.199219 508.511719 371.09375 505.914062 371.09375 Z M 717.136719 375.800781 L 529.882812 371.429688 L 534.257812 375.800781 L 529.882812 380.175781 Z M 717.136719 375.800781"
                        />
                      </g>
                    </svg>
                  </div>
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
                  <span className="relative inline-block">
                    {link.title}
                    <span
                      className={`absolute left-0 top-full mt-1 w-[110px] h-auto pointer-events-none transition-all duration-300 ease-out block ${
                        isActive
                          ? 'opacity-100 translate-y-0 scale-100'
                          : 'opacity-0 translate-y-1 scale-90'
                      }`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="2.86 352.9 714.28 45.81"
                        className="w-full h-auto text-[#d28080]"
                        fill="currentColor"
                      >
                        <defs>
                          <clipPath id={`mobile-arrow-clip-${i}`}>
                            <path
                              d="M 2.855469 352.113281 L 716.855469 352.113281 L 716.855469 399 L 2.855469 399 Z M 2.855469 352.113281"
                              clipRule="nonzero"
                            />
                          </clipPath>
                        </defs>
                        <g clipPath={`url(#mobile-arrow-clip-${i})`}>
                          <path
                            d="M 278.488281 363.277344 C 277.054688 362.050781 274.703125 362.050781 273.269531 363.277344 L 261.222656 373.574219 C 259.789062 374.800781 259.789062 376.808594 261.222656 378.035156 L 273.269531 388.328125 C 274.703125 389.558594 277.054688 389.558594 278.488281 388.328125 L 290.539062 378.035156 C 291.972656 376.808594 291.972656 374.800781 290.539062 373.574219 Z M 364.4375 354.464844 C 361.996094 352.375 357.992188 352.375 355.546875 354.464844 L 335.03125 372.003906 C 332.589844 374.097656 332.589844 377.515625 335.03125 379.609375 L 355.546875 397.136719 C 357.992188 399.230469 361.996094 399.230469 364.4375 397.136719 L 384.964844 379.609375 C 387.410156 377.515625 387.410156 374.097656 384.964844 372.003906 Z M 242.351562 369.195312 C 238.703125 369.195312 235.746094 372.152344 235.746094 375.800781 C 235.746094 379.453125 238.703125 382.410156 242.351562 382.410156 C 246.003906 382.410156 248.960938 379.453125 248.960938 375.800781 C 248.960938 372.152344 246.003906 369.195312 242.351562 369.195312 Z M 309.40625 369.195312 C 305.757812 369.195312 302.796875 372.152344 302.796875 375.800781 C 302.796875 379.453125 305.757812 382.410156 309.40625 382.410156 C 313.058594 382.410156 316.015625 379.453125 316.015625 375.800781 C 316.015625 372.152344 313.058594 369.195312 309.40625 369.195312 Z M 214.085938 371.09375 C 211.484375 371.09375 209.375 373.199219 209.375 375.800781 C 209.375 378.40625 211.484375 380.515625 214.085938 380.515625 C 216.6875 380.515625 218.796875 378.40625 218.796875 375.800781 C 218.796875 373.199219 216.6875 371.09375 214.085938 371.09375 Z M 2.855469 375.800781 L 190.113281 380.175781 L 185.734375 375.800781 L 190.113281 371.429688 Z M 446.726562 363.277344 C 445.289062 362.050781 442.9375 362.050781 441.503906 363.277344 L 429.457031 373.570312 C 428.019531 374.800781 428.019531 376.808594 429.457031 378.035156 L 441.503906 388.328125 C 442.9375 389.558594 445.289062 389.558594 446.726562 388.328125 L 458.769531 378.035156 C 460.207031 376.808594 460.207031 374.800781 458.769531 373.570312 Z M 477.644531 369.195312 C 473.992188 369.195312 471.035156 372.152344 471.035156 375.800781 C 471.035156 379.453125 473.992188 382.410156 477.644531 382.410156 C 481.289062 382.410156 484.246094 379.453125 484.246094 375.800781 C 484.246094 372.152344 481.289062 369.195312 477.644531 369.195312 Z M 410.585938 369.195312 C 406.9375 369.195312 403.976562 372.152344 403.976562 375.800781 C 403.976562 379.453125 406.9375 382.410156 410.585938 382.410156 C 414.238281 382.410156 417.195312 379.453125 417.195312 375.800781 C 417.195312 372.152344 414.238281 369.195312 410.585938 369.195312 Z M 505.914062 371.09375 C 503.304688 371.09375 501.195312 373.199219 501.195312 375.800781 C 501.195312 378.402344 503.304688 380.515625 505.914062 380.515625 C 508.511719 380.515625 510.621094 378.402344 510.621094 375.800781 C 510.621094 373.199219 508.511719 371.09375 505.914062 371.09375 Z M 717.136719 375.800781 L 529.882812 371.429688 L 534.257812 375.800781 L 529.882812 380.175781 Z M 717.136719 375.800781"
                          />
                        </g>
                      </svg>
                    </span>
                  </span>
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
