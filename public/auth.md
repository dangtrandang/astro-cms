# Auth.md — Hồng Ngọc Huyền Học Agent Authentication & Registration

This document describes how AI agents can discover, authenticate, and register with the Hồng Ngọc Huyền Học site.

## Agent Registration

Agents can register with this site to access authenticated resources.

- **Register URI:** `https://cms.hongngochuyenhoc.com/auth/register`
- **Supported identity types:** `email`, `password`
- **Credential types:** `bearer_token` (Directus session token)
- **Claim URI:** `https://cms.hongngochuyenhoc.com/users/me` — verify token and retrieve user profile
- **Revocation URI:** `https://dev.hongngochuyenhoc.com/api/auth/logout` — invalidate session

## OAuth 2.0 / OpenID Connect

This site uses Directus session-based authentication.

| Endpoint | URL |
|----------|-----|
| Authorization Server Metadata | `/.well-known/oauth-authorization-server` |
| OpenID Configuration | `/.well-known/openid-configuration` |
| Protected Resource Metadata | `/.well-known/oauth-protected-resource` |
| Token endpoint | `POST https://cms.hongngochuyenhoc.com/auth/login` |

## Public Access (No Auth Required)

| Resource | URL |
|----------|-----|
| Homepage | `/` |
| All CMS pages | `/[permalink]` |
| Blog | `/blog`, `/blog/[slug]` |
| API Catalog | `/.well-known/api-catalog` |
| Site Data API | `/api/site-data` |
| Blog Archive API | `/api/blog-archive-posts` |
| Search API | `/api/search?query=...` |

## Protected Resources (Auth Required)

| Resource | URL |
|----------|-----|
| Account dashboard | `/tai-khoan/` |
| Auth API | `/api/auth/*` |
| Form submissions | `/api/submit-form` (reCAPTCHA-protected) |

## MCP Integration

This site exposes an MCP Server Card at `/.well-known/mcp/server-card.json` for agent tool discovery.

## Discovery Endpoints

| Purpose | Well-Known Path |
|---------|----------------|
| API catalog | `/.well-known/api-catalog` |
| MCP server info | `/.well-known/mcp.json` |
| MCP server card | `/.well-known/mcp/server-card.json` |
| Agent skills | `/.well-known/agent-skills/index.json` |
| OAuth server | `/.well-known/oauth-authorization-server` |
| OpenID config | `/.well-known/openid-configuration` |
| Protected resource | `/.well-known/oauth-protected-resource` |
| HTTP message signatures | `/.well-known/http-message-signatures-directory` |
