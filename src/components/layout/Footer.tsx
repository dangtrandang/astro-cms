'use client';

import { forwardRef } from 'react';
import Container from '@/components/ui/Container';
import SocialIcon from '@/components/ui/SocialIcon';
import BackToTop from '@/components/ui/BackToTop';

interface SocialLink {
  service: string;
  url: string;
}

interface NavigationItem {
  id: string;
  title: string;
  url?: string | null;
  page?: { permalink?: string | null };
  children?: NavigationItem[];
}

interface FooterProps {
  navigation: { items: NavigationItem[] };
  globals: {
    logo_on_light_bg?: string | null;
    logo_on_dark_bg?: string | null;
    description?: string | null;
    social_links?: SocialLink[];
  };
}

function resolveHref(item: NavigationItem): string {
  return item.page?.permalink || item.url || '#';
}

const Footer = forwardRef<HTMLElement, FooterProps>(({ navigation, globals }, ref) => {
  const directusURL = import.meta.env.PUBLIC_DIRECTUS_URL;
  const lightLogoUrl = globals?.logo_on_light_bg ? `${directusURL}/assets/${globals.logo_on_light_bg}` : '/images/logo.svg';
  const darkLogoUrl = globals?.logo_on_dark_bg ? `${directusURL}/assets/${globals.logo_on_dark_bg}` : '';

  const items = navigation?.items || [];

  // Lấy các item cha (có children) làm nhóm link
  // Chỉ lấy tối đa 2 nhóm đầu tiên cho cột 2 và 3
  const linkGroups = items.filter((item) => item.children && item.children.length > 0).slice(0, 2);
  // Các item lẻ (không có children) hoặc item cha thừa
  const leftoverItems = items.filter(
    (item) => !item.children || item.children.length === 0 || !linkGroups.includes(item),
  );

  return (
    <footer ref={ref} className="bg-[#850E35] py-16 text-[#FCF5EE]">
      <Container className="text-[#FCF5EE]">
        {/* 4 cột: Logo | Nhóm link 1 | Nhóm link 2 | Newsletter */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[35%_20%_20%_25%] gap-10 mb-12">
          {/* Cột 1: Logo + Description + Social */}
          <div className="flex flex-col min-w-0">
            <a href="/" className="inline-block transition-opacity hover:opacity-70 mb-4">
              <img
                src={lightLogoUrl}
                alt="Logo"
                className={darkLogoUrl ? 'w-[120px] h-auto dark:hidden' : 'w-[120px] h-auto'}
              />
              {darkLogoUrl && (
                <img src={darkLogoUrl} alt="Logo (Dark Mode)" className="w-[120px] h-auto hidden dark:block" />
              )}
            </a>
            {globals?.description && (
              <p className="text-sm text-[#FCF5EE]/80 leading-relaxed mb-4">{globals.description}</p>
            )}
            {globals?.social_links && globals.social_links.length > 0 && (
              <div className="flex flex-wrap gap-3">
                {globals.social_links.map((social) => (
                  <a
                    key={social.service}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="size-9 rounded-full bg-[#FCF5EE]/10 inline-flex items-center justify-center transition-colors hover:bg-[#C6DCE4]/20"
                    aria-label={social.service}
                  >
                    <SocialIcon service={social.service} size={20} className="size-5 text-[#FCF5EE] hover:text-[#C6DCE4] transition-colors" />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Cột 2 & 3: Nhóm link từ item cha có children */}
          {linkGroups.length >= 1 && (
            <div className="flex flex-col min-w-0">
              <h4 className="text-[#FCF5EE] font-heading text-lg font-semibold mb-4">
                {linkGroups[0].title}
              </h4>
              <ul className="space-y-3">
                {linkGroups[0].children!.map((child) => (
                  <li key={child.id}>
                    <a
                      href={resolveHref(child)}
                      className="text-[#FCF5EE]/80 hover:text-[#C6DCE4] transition-colors text-sm"
                    >
                      {child.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {linkGroups.length >= 2 && (
            <div className="flex flex-col min-w-0">
              <h4 className="text-[#FCF5EE] font-heading text-lg font-semibold mb-4">
                {linkGroups[1].title}
              </h4>
              <ul className="space-y-3">
                {linkGroups[1].children!.map((child) => (
                  <li key={child.id}>
                    <a
                      href={resolveHref(child)}
                      className="text-[#FCF5EE]/80 hover:text-[#C6DCE4] transition-colors text-sm"
                    >
                      {child.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Nếu thiếu 1 nhóm link, dùng leftover items lấp vào cột thứ 3 */}
          {linkGroups.length < 2 && leftoverItems.length > 0 && (
            <div className="flex flex-col">
              <h4 className="text-[#FCF5EE] font-heading text-lg font-semibold mb-4">
                Links
              </h4>
              <ul className="space-y-3">
                {leftoverItems.map((item) => (
                  <li key={item.id}>
                    <a
                      href={resolveHref(item)}
                      className="text-[#FCF5EE]/80 hover:text-[#C6DCE4] transition-colors text-sm"
                    >
                      {item.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Cột 4: Newsletter (luôn ở vị trí cuối) */}
          <div className={`flex flex-col min-w-0 ${linkGroups.length < 2 && leftoverItems.length === 0 ? '' : ''}`}>
            <h4 className="text-[#FCF5EE] font-heading text-lg font-semibold mb-4">
              Đăng ký nhận tin
            </h4>
            <p className="text-sm text-[#FCF5EE]/70 mb-4">
              Nhận những bài viết mới nhất về huyền học, chiêm tinh và phong thủy.
            </p>
            <form className="flex flex-col gap-2" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="email@example.com"
                className="w-full px-4 py-2.5 rounded-lg bg-[#FCF5EE] text-gray-800 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C6DCE4]"
              />
              <button
                type="submit"
                className="w-full px-5 py-2.5 rounded-lg bg-[#C6DCE4] text-[#850E35] font-semibold text-sm hover:bg-[#b8d0d9] transition-colors"
              >
                Đăng ký
              </button>
            </form>
            <p className="text-xs text-[#FCF5EE]/50 mt-3">
              Bằng cách đăng ký, bạn đồng ý với{' '}
              <a href="/chinh-sach-bao-mat" className="underline hover:text-[#C6DCE4] transition-colors">
                Chính sách bảo mật
              </a>
              .
            </p>
          </div>
        </div>
      </Container>
      <BackToTop />
    </footer>
  );
});

Footer.displayName = 'Footer';
export default Footer;
