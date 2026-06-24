# Auth.md — Hồng Ngọc Huyền Học Agent Authentication

This document describes how AI agents can authenticate with the Hồng Ngọc Huyền Học API.

## OAuth 2.0 / OpenID Connect

This site currently supports session-based authentication for registered users.

- **Issuer:** `https://cms.hongngochuyenhoc.com`
- **Authentication:** Directus User API credentials
- **Token endpoint:** POST `https://cms.hongngochuyenhoc.com/auth/login`

## Public Access

Most content on this site (pages, blog posts, media) is publicly accessible without authentication.

## Protected Resources

- `/tai-khoan/` — User account dashboard (requires authentication)
- `/api/auth/*` — Authentication API endpoints
- `/api/submit-form` — Form submissions (reCAPTCHA-protected)

## MCP Integration

This site does not currently expose an MCP server endpoint.
