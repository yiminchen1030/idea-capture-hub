# Security Guidelines for Idea Capture Hub

This document provides comprehensive security guidelines tailored for the "Idea Capture Hub" Next.js full-stack starter template and its extension into the "AI-assisted Idea Recording Document" application. It aligns with established security principles to ensure robust, resilient, and maintainable protection throughout your development lifecycle.

---

## 1. Overview & Threat Model

**Purpose:** Protect user data and AI interactions in the Idea Capture Hub, a private idea management tool with AI-powered business model suggestions.

**Primary Assets:**
- User credentials and sessions
- Usergenerated ideas (product, customer, business model)
- AI service API keys and responses
- PostgreSQL database containing sensitive PII

**Key Threats:**
- Unauthorized access to user dashboards or data
- Injection attacks via form endpoints or AI prompt parameters
- Exposure or leakage of AI API credentials
- CSRF, XSS, clickjacking against the dashboard UI
- Man-in-the-middle on API calls (to AI service or database)
- Dependency vulnerabilities in Node.js, Next.js, and ORMs

---

## 2. Core Security Principles

1. Security by Design: Embed controls early in UI, API routes, and infra.
2. Least Privilege: Grant minimal permissions to database users, API credentials, and hosting roles.
3. Defense in Depth: Combine network, application, and data protection layers.
4. Input Validation & Output Encoding: Treat all user input as untrusted; sanitize and encode accordingly.
5. Fail Securely: Default to deny on errors; avoid leaking stack traces or internal details.
6. Secure Defaults: Enable secure Next.js headers, strict CORS, and locked-down Docker settings.
7. Keep Security Simple: Favor well-supported libraries (Zod, Drizzle ORM) and declarative configurations.

---

## 3. Authentication & Access Control

- **Library Choice:** Continue using `better-auth` (or migrate to NextAuth.js) with strong session management:
  - Set `HttpOnly`, `Secure`, `SameSite=Strict` on session cookies.
  - Implement idle and absolute session timeouts.
  - Rotate session identifiers after privilege changes (e.g., MFA enablement).
- **Password Storage:** Use bcrypt or Argon2 with per-user salts; enforce minimum length (e.g., 12 chars) and complexity.
- **Multi-Factor Authentication (MFA):** Provide optional TOTP or SMS/Email-based second factors for high-sensitivity accounts.
- **RBAC:** Define roles (e.g., `user`, `admin`) in your Drizzle schema; enforce server-side checks in every API route:
  ```ts
  if (session.user.role !== 'user') throw new NextResponse('Unauthorized', { status: 403 });
  ```
- **Authorization Checks:** For `/api/ideas` endpoints, validate that `idea.userId === session.user.id` before read/update/delete.

---

## 4. Input Handling & Processing

- **Schema Validation:** Use Zod in every API route to parse and validate request bodies:
  ```ts
  const IdeaSchema = z.object({ product: z.string().min(1), customer: z.string().min(1), businessModel: z.string().min(1) });
  ```
- **Prevent Injection:** Drizzle ORM with parameterized queries prevents SQL injection. Do not interpolate raw strings in query builders.
- **Sanitize AI Prompts:** Strip control characters and limit prompt length to avoid prompt-injection or resource exhaustion.
- **Output Encoding:** When rendering user content, rely on Reactescaped outputs. If using `dangerouslySetInnerHTML`, sanitize via DOMPurify.
- **File Uploads (if added):** Validate MIME types, set size limits, store outside the web root, and scan for malware.

---

## 5. Data Protection & Privacy

- **Transport Encryption:** Enforce HTTPS everywhere (Next.js `redirect` to TLS, HSTS header with `max-age=63072000; includeSubDomains; preload`).
- **At-Rest Encryption:** Rely on managed PostgreSQL encryption or disk-level encryption.
- **Secret Management:** Store AI API keys and database credentials in environment variables or a vault (e.g., AWS Secrets Manager). Do _not_ commit `.env` files.
- **Least-Privilege DB User:** Create a dedicated database user with only CRUD rights on `ideas` and `users` tables; no superuser or schema modification privileges.
- **Masking & Logging:** Redact PII (user emails, idea text) in logs. Use a structured logger (e.g., Pino) configured to omit sensitive fields.

---

## 6. API & Service Security

- **Route Protection:** Apply middleware in `middleware.ts` to enforce authentication on `/dashboard` and all `/api/` routes.
- **Rate Limiting:** Use a serverless-friendly rate limiter (e.g., Upstash + Redis) to throttle `/api/ai/suggest` and login attempts.
- **CORS:** In `next.config.js`, restrict allowed origins to your front-end host and trusted domains only.
- **CSRF Protection:** Implement the synchronizer token pattern (e.g., `@nextjs/csrf` or `next-csrf`) for state-changing POST/PUT/DELETE requests.
- **Use Correct Verbs:** GET for reads, POST for creates and AI queries, PUT/PATCH for updates, DELETE for removals.
- **API Versioning:** Namespace critical endpoints (e.g., `/api/v1/ideas`) to allow safe evolution.

---

## 7. Web Application Security Hygiene

- **Security Headers:** Configure with `next-secure-headers` or custom `headers()` in Next.js:
  - `Content-Security-Policy` to restrict scripts, styles, and frame sources.
  - `X-Frame-Options: DENY` to prevent clickjacking.
  - `X-Content-Type-Options: nosniff`.
  - `Referrer-Policy: strict-origin-when-cross-origin`.
- **Subresource Integrity:** Add SRI hashes for any third-party scripts loaded via CDN.
- **Client-Side Storage:** Avoid storing tokens or PII in `localStorage`; rely on secure, HttpOnly cookies.

---

## 8. Infrastructure & Deployment Security

- **Container Hardening:**
  - Use minimal base images (e.g., Alpine-based Node.js) with only required packages.
  - Drop Linux capabilities; run as non-root user inside the container.
- **TLS Configuration:** Ensure Vercel or your load balancer enforces TLS 1.2+ and strong cipher suites.
- **Environment Isolation:** Separate dev, staging, and production environments, each with distinct secrets and DB instances.
- **Disable Debug in Production:** Ensure `NEXT_PUBLIC_` environment flags and `process.env.NODE_ENV !== 'production'` checks disable verbose logging and dev tools.
- **Automated Updates:** Regularly rebuild Docker images when base images or dependencies release security patches.

---

## 9. Dependency Management

- **Use Lockfiles:** Commit `package-lock.json` or `yarn.lock` for reproducible builds.
- **Vulnerability Scanning:** Integrate SCA tools (e.g., GitHub Dependabot, Snyk) to auto-detect CVEs in direct and transitive dependencies.
- **Minimum Footprint:** Only install dependencies you actively use (prune test or build-only packages from production images).
- **Review Third-Party Modules:** Vet the security posture and maintenance activity of UI libraries, ORMs, and AI SDKs before adoption.

---

## 10. Monitoring & Incident Response

- **Logging & Alerting:** Centralize logs (e.g., in Datadog or Elastic) and alert on abnormal login patterns, rate limit triggers, or 5xx spikes.
- **Audit Trails:** Record CRUD operations on ideas with timestamps and user context.
- **Incident Plan:** Define procedures for key compromise (e.g., rotate AI service keys, force password resets).
- **Periodic Reviews:** Schedule quarterly security reviews of code, infra, and dependencies.

---

## Conclusion

By following these security guidelines—grounded in secure defaults, least privilege, and defense in depth—you will harden the Idea Capture Hub and its AI-assisted features against common threats. Security is an ongoing process; regularly revisit your controls as the codebase and threat landscape evolve.