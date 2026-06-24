import { defineMiddleware } from 'astro:middleware';
import { AUTH_COOKIE_NAME } from '@/lib/auth-cookie';

interface AuthLocals {
  user: { id: string; email?: string; first_name?: string; last_name?: string; avatar?: string | { id: string } | null; provider?: string | null; external_identifier?: string | null };
  contact: { id: string; phone?: string; first_name?: string; last_name?: string } | null;
  token: string;
}

const PROTECTED_ROUTES = ['/tai-khoan', '/login', '/dang-ky', '/sso-callback'];
const PUBLIC_AUTH_ROUTES = ['/login', '/dang-ky'];
const DIRECTUS_URL = import.meta.env.PUBLIC_DIRECTUS_URL as string;
const ADMIN_TOKEN = import.meta.env.DIRECTUS_SERVER_TOKEN as string;
const SITE_URL = import.meta.env.PUBLIC_SITE_URL || 'https://dev.hongngochuyenhoc.com';

const userFetch = (token: string, path: string) =>
  fetch(`${DIRECTUS_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });

const adminFetch = (path: string) =>
  fetch(`${DIRECTUS_URL}${path}`, {
    headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
    cache: 'no-store',
  });

export const onRequest = defineMiddleware(async (context, next) => {
  const { url, request, cookies } = context;
  const locals = context.locals as AuthLocals;
  const { pathname } = new URL(url);

  // ── Markdown Negotiation: Accept: text/markdown → return markdown ──
  const accept = request.headers.get('accept') || '';
  if (accept.includes('text/markdown')) {
    return getMarkdownResponse(pathname, SITE_URL);
  }

  // ── Auth middleware (existing) ──
  const isProtected = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
  if (!isProtected) return addLinkHeaders(await next(), pathname);

  if (pathname === '/sso-callback') return next();

  const token = cookies.get(AUTH_COOKIE_NAME)?.value;
  const isPublicAuthRoute = PUBLIC_AUTH_ROUTES.includes(pathname);

  if (!token) {
    if (isPublicAuthRoute) return next();
    return context.redirect('/login');
  }

  try {
    const meRes = await userFetch(token, '/users/me?fields=id,email,first_name,last_name,avatar');
    if (!meRes.ok) {
      console.error('[middleware] /users/me failed:', meRes.status, await meRes.text().catch(() => ''));
      cookies.delete(AUTH_COOKIE_NAME, { path: '/' });
      return context.redirect('/login');
    }
    const meData = await meRes.json();
    const userId = meData?.data?.id;
    if (!userId) {
      console.error('[middleware] /users/me returned no data');
      cookies.delete(AUTH_COOKIE_NAME, { path: '/' });
      return context.redirect('/login');
    }

    const adminUserRes = await adminFetch(`/users/${userId}?fields=id,email,first_name,last_name,avatar,provider,external_identifier`);
    if (!adminUserRes.ok) {
      console.error('[middleware] admin /users/:id failed:', adminUserRes.status, await adminUserRes.text().catch(() => ''));
      cookies.delete(AUTH_COOKIE_NAME, { path: '/' });
      return context.redirect('/login');
    }
    const adminUserData = await adminUserRes.json();
    const user = adminUserData?.data;
    if (!user) {
      console.error('[middleware] admin /users/:id returned no data');
      cookies.delete(AUTH_COOKIE_NAME, { path: '/' });
      return context.redirect('/login');
    }

    let contact: any = null;
    try {
      const contactFilter = encodeURIComponent(JSON.stringify({ user: { _eq: user.id } }));
      const cRes = await adminFetch(`/items/contacts?fields=id,phone,first_name,last_name&filter=${contactFilter}&limit=1`);
      if (cRes.ok) {
        const cData = await cRes.json().catch(() => null);
        contact = cData?.data?.[0] ?? null;
      }
    } catch (cErr) {
      console.error('[middleware] contacts fetch error:', cErr);
    }

    locals.user = user;
    locals.contact = contact;
    locals.token = token;

    if (isPublicAuthRoute) {
      return context.redirect('/tai-khoan');
    }

    const response = await next();
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    return addLinkHeaders(response, pathname);
  } catch (err) {
    console.error('[middleware] auth check failed:', err);
    cookies.delete(AUTH_COOKIE_NAME, { path: '/' });
    return context.redirect('/login');
  }
});

/**
 * Add Link response headers for agent discovery (RFC 8288)
 * Applied to ALL pages, with homepage getting extra rel types.
 */
function addLinkHeaders(response: Response, pathname: string): Response {
  const links: string[] = [
    `</.well-known/api-catalog>; rel="api-catalog"`,
    `</.well-known/mcp.json>; rel="mcp"`,
    `</robots.txt>; rel="robots"`,
    `</auth.md>; rel="describedby"`,
  ];

  if (pathname === '/') {
    links.push(`</.well-known/oauth-authorization-server>; rel="oauth-authorization-server"`);
    links.push(`</.well-known/agent-skills/index.json>; rel="service-doc"`);
  }

  response.headers.set('Link', links.join(', '));
  return response;
}

/**
 * Return markdown response with required headers for agent consumption
 */
function getMarkdownResponse(pathname: string, siteUrl: string): Response {
  const content = generateMarkdownForPath(pathname, siteUrl);
  const tokenCount = String(Math.ceil(content.length / 4));

  return new Response(content, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'x-markdown-tokens': tokenCount,
      'Cache-Control': 'public, max-age=3600',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

/**
 * Generate markdown content for agent consumption at a given path
 */
function generateMarkdownForPath(pathname: string, siteUrl: string): string {
  const title = pathname === '/' ? 'Hồng Ngọc Huyền Học' : `Page ${pathname}`;
  return `# ${title}

This is an agent-friendly markdown representation of ${siteUrl}${pathname}.

## Available Resources

- [Homepage](${siteUrl}/)
- [About](${siteUrl}/gioi-thieu)
- [Contact](${siteUrl}/lien-he)
- [Blog](${siteUrl}/blog)
- [Privacy Policy](${siteUrl}/chinh-sach-bao-mat)
- [Terms of Service](${siteUrl}/dieu-khoan-dich-vu)
- [Work With Me](${siteUrl}/work-with-me)

## API Endpoints

- \`GET /api/site-data\` — Global site configuration, navigation, metadata
- \`GET /api/blog-archive-posts\` — Paginated blog posts
- \`GET /api/recent-posts\` — Recent blog posts
- \`GET /api/search?query=...\` — Search across pages and posts

## Discovery Endpoints

- \`/.well-known/api-catalog\` — API catalog (RFC 9727)
- \`/.well-known/oauth-authorization-server\` — OAuth metadata (RFC 8414)
- \`/.well-known/openid-configuration\` — OpenID Connect discovery
- \`/.well-known/oauth-protected-resource\` — Protected resource metadata (RFC 9728)
- \`/.well-known/mcp.json\` — MCP server info
- \`/.well-known/mcp/server-card.json\` — MCP Server Card
- \`/.well-known/agent-skills/index.json\` — Agent skills index

## Authentication

- Token endpoint: \`POST https://cms.hongngochuyenhoc.com/auth/login\`
- Register: \`POST https://cms.hongngochuyenhoc.com/auth/register\`
- Public content is accessible without authentication.
- Protected areas: /tai-khoan, /api/auth/*`;
}


/**
 * Generate markdown content for agent consumption
 */
function getMarkdownForPath(pathname: string, siteUrl: string): string {
  const title = pathname === '/' ? 'Hồng Ngọc Huyền Học' : `Page ${pathname}`;
  return `# ${title}

This is an agent-friendly markdown representation of ${siteUrl}${pathname}.

## Available Resources

- [Homepage](${siteUrl}/)
- [About](${siteUrl}/gioi-thieu)
- [Contact](${siteUrl}/lien-he)
- [Blog](${siteUrl}/blog)

## API Endpoints

- \`GET /api/site-data\` — Global site configuration, navigation, metadata
- \`GET /api/blog-archive-posts\` — Paginated blog posts
- \`GET /api/recent-posts\` — Recent blog posts
- \`GET /api/search?query=...\` — Search across pages and posts

## Authentication

- Token endpoint: \`POST https://cms.hongngochuyenhoc.com/auth/login\`
- Public content is accessible without authentication.
- Protected areas: /tai-khoan, /api/auth/*`;
}
