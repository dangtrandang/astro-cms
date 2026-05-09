'use client';

import { forwardRef, useEffect, useState } from 'react';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { ChevronDown, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Container from '@/components/ui/Container';
import SearchModal from '@/components/ui/SearchModal';
import { setVisualEditingAttr as setAttr } from '@/lib/visualEditing';

interface NavigationChildItem {
  id: string;
  title: string;
  url?: string;
  page?: { permalink?: string | null };
}

interface NavigationItem {
  id: string;
  title: string;
  url?: string;
  page?: { permalink?: string | null };
  children?: NavigationChildItem[];
}

interface NavigationBarProps {
  navigation: {
    id: string;
    items: NavigationItem[];
  };
  globals: {
    logo_on_light_bg?: string;
    logo_on_dark_bg?: string;
  };
}

const CTA_LINK = '/contact';
const CTA_LABEL = 'Liên hệ';

const getHref = (item?: { page?: { permalink?: string | null }; url?: string }) => item?.page?.permalink || item?.url || '#';

const NavigationBar = forwardRef<HTMLElement, NavigationBarProps>(({ navigation, globals }, ref) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const directusURL = import.meta.env.PUBLIC_DIRECTUS_URL;

  const logoUrl = globals?.logo_on_light_bg
    ? `${directusURL}/assets/${globals.logo_on_light_bg}`
    : globals?.logo_on_dark_bg
      ? `${directusURL}/assets/${globals.logo_on_dark_bg}`
      : '/images/logo.svg';

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const toggleSection = (id: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false);
      }
    };

    const handleRouteChange = () => {
      setMobileMenuOpen(false);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('popstate', handleRouteChange);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);

  return (
    <header ref={ref} className="sticky top-0 z-[60] border-b border-white/10 bg-black text-white">
      <Container className="flex h-16 items-center gap-4 px-4 sm:px-6 lg:px-8">
        <a
          href="/"
          className="flex shrink-0 items-center border-0 outline-none ring-0 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0"
          onClick={closeMobileMenu}
        >
          <img src={logoUrl} alt="Logo" className="block h-9 w-auto max-w-none" />
        </a>

        <nav
          className="hidden min-w-0 flex-1 items-center justify-center md:flex"
          data-directus={
            navigation
              ? setAttr({
                collection: 'navigation',
                item: navigation.id,
                fields: ['items'],
                mode: 'modal',
              })
              : undefined
          }
        >
          <ul className="flex items-center gap-6 lg:gap-8">
            {navigation?.items?.map((section) => {
              const href = getHref(section);
              const hasChildren = Boolean(section.children?.length);

              return (
                <li key={section.id} className="group relative">
                  {hasChildren ? (
                    <>
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 border-0 bg-transparent p-0 text-sm font-medium text-white outline-none ring-0 transition-opacity hover:opacity-80 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0"
                      >
                        <span>{section.title}</span>
                        <ChevronDown className="h-4 w-4 transition-transform duration-200 group-hover:rotate-180" />
                      </button>

                      <div className="invisible absolute left-1/2 top-full z-20 mt-3 w-56 -translate-x-1/2 opacity-0 transition-all duration-150 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                        <div className="rounded-md border border-white/10 bg-black p-2 shadow-2xl">
                          <ul className="flex flex-col gap-1">
                            {section.children?.map((child) => (
                              <li key={child.id}>
                                <a
                                  href={getHref(child)}
                                  className="block rounded-md px-3 py-2 text-sm text-white outline-none transition-colors hover:bg-white/10 focus:outline-none"
                                  onClick={closeMobileMenu}
                                >
                                  {child.title}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </>
                  ) : (
                    <a
                      href={href}
                      className="inline-flex items-center border-0 p-0 text-sm font-medium text-white outline-none ring-0 transition-opacity hover:opacity-80 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0"
                      onClick={closeMobileMenu}
                    >
                      {section.title}
                    </a>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-3">
          <SearchModal />
          <a
            href={CTA_LINK}
            className="hidden items-center rounded-md bg-white px-4 py-2 text-sm font-medium text-black outline-none transition-colors hover:bg-white/90 focus:outline-none md:inline-flex"
          >
            {CTA_LABEL}
          </a>
          <Button
            variant="ghost"
            size="icon"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            className="border-0 text-white outline-none ring-0 hover:bg-white/10 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 md:hidden"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </Container>

      {mobileMenuOpen && (
        <div className="md:hidden">
          <button
            type="button"
            aria-label="Close menu overlay"
            className="fixed inset-0 z-[69] bg-black/40"
            onClick={closeMobileMenu}
          />
          <div className="fixed inset-y-0 right-0 z-[70] flex w-full max-w-sm flex-col overflow-y-auto bg-black p-6 text-white shadow-xl">
            <div className="mb-6 flex items-center justify-between gap-4">
              <span className="text-sm font-medium text-white/60">Menu</span>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Close menu"
                className="border-0 text-white outline-none ring-0 hover:bg-white/10 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0"
                onClick={closeMobileMenu}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <nav
              className="flex flex-1 flex-col gap-4"
              data-directus={
                navigation
                  ? setAttr({
                    collection: 'navigation',
                    item: navigation.id,
                    fields: ['items'],
                    mode: 'modal',
                  })
                  : undefined
              }
            >
              {navigation?.items?.map((section) => (
                <div key={section.id} className="border-b border-white/10 pb-4 last:border-b-0">
                  {section.children?.length ? (
                    <Collapsible open={openSections[section.id]} onOpenChange={() => toggleSection(section.id)}>
                      <CollapsibleTrigger className="flex w-full items-center justify-between border-0 bg-transparent text-left text-base font-medium text-white outline-none ring-0 transition-opacity hover:opacity-80 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0">
                        <span>{section.title}</span>
                        <ChevronDown
                          className={`h-4 w-4 transition-transform duration-200 ${openSections[section.id] ? 'rotate-180' : ''}`}
                        />
                      </CollapsibleTrigger>
                      <CollapsibleContent className="mt-3 flex flex-col gap-3 pl-4">
                        {section.children.map((child) => (
                          <a
                            key={child.id}
                            href={getHref(child)}
                            className="text-sm text-white/80 outline-none transition-colors hover:text-white focus:outline-none"
                            onClick={closeMobileMenu}
                          >
                            {child.title}
                          </a>
                        ))}
                      </CollapsibleContent>
                    </Collapsible>
                  ) : (
                    <a
                      href={getHref(section)}
                      className="text-base font-medium text-white outline-none transition-opacity hover:opacity-80 focus:outline-none"
                      onClick={closeMobileMenu}
                    >
                      {section.title}
                    </a>
                  )}
                </div>
              ))}
            </nav>

            <a
              href={CTA_LINK}
              className="mt-6 inline-flex w-full items-center justify-center rounded-md bg-white px-4 py-3 text-sm font-medium text-black outline-none transition-colors hover:bg-white/90 focus:outline-none"
              onClick={closeMobileMenu}
            >
              {CTA_LABEL}
            </a>
          </div>
        </div>
      )}
    </header>
  );
});

NavigationBar.displayName = 'NavigationBar';
export default NavigationBar;
