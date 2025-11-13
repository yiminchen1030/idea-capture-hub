# Project Requirements Document (PRD)

## 1. Project Overview

The **AI-Assisted Idea Recording Document** is a web application built on top of the “Idea Capture Hub” Next.js starter template. It provides entrepreneurs and creative professionals with a secure, user-specific environment to record, organize, and refine business ideas. Users can enter details about a Product, Customer, and Business Model in a guided form, then invoke an AI assistant to generate contextual suggestions that help flesh out or pivot their business plans.

This project exists to streamline the early stages of product development. By combining a modern, secure authentication system with a type-safe database and an AI-powered brainstorming assistant, it ensures user data privacy while accelerating the ideation process. Key success criteria include: seamless user onboarding, reliable storage and retrieval of ideas, relevant AI suggestions in under 2 seconds, and a polished, responsive UI.

## 2. In-Scope vs. Out-of-Scope

**In-Scope (MVP, Phase 1):**
- Email/password authentication (sign up, sign in, sign out)
- Protected user dashboard
- Idea submission form with fields: Product, Customer, Business Model
- AI suggestion button to fetch business model ideas
- API routes for creating, reading, updating, deleting (CRUD) ideas
- Idea list display on the dashboard
- Dark/light theme toggle
- PostgreSQL database with Drizzle ORM schema for `ideas`
- Deployment configuration (Docker, Vercel)

**Out-of-Scope (Phase 2+):**
- Social logins (Google, GitHub, etc.)
- Real-time collaboration or idea sharing between users
- Analytics/dashboard metrics (idea counts, AI usage stats)
- Mobile-specific native apps
- AI model fine-tuning or multi-model support
- Role-based permissions or admin panels

## 3. User Flow

A new user arrives on the landing page and signs up with an email and password. Upon verification, they are redirected to a protected dashboard. The dashboard features a sidebar with navigation links (e.g., “My Ideas,” “Settings”) and a main content area showing an empty Idea Submission card by default.

To record a new idea, the user fills in the “Product” and “Customer” fields. Clicking into the “Business Model” textarea reveals a “Get Suggestions” button. When clicked, the frontend calls the AI suggestions endpoint, displays a loading spinner, and then shows a list of generated business model options. The user selects or edits a suggestion, then clicks “Save.” The idea is persisted in the database and immediately appears in the Idea List below the form.

## 4. Core Features

- **Authentication**: Secure sign-up, sign-in, and sign-out flows using `better-auth`, session cookies, and password hashing.
- **Protected Dashboard**: Accessible only to authenticated users, with server-side redirect if unauthenticated.
- **Idea Submission Form**: Fields for Product, Customer, Business Model built with `shadcn/ui` components (Input, Textarea, Button).
- **AI Suggestions**: `/api/ai/suggest` POST endpoint that constructs a prompt from Product + Customer, calls OpenAI GPT-4, and returns a list of business model suggestions.
- **Idea CRUD API**: `/api/ideas` routes for POST (create), GET (list), PUT/PATCH (update), DELETE (remove) ideas, all validated with Zod.
- **Idea List Display**: Component that fetches `/api/ideas` and shows cards with idea details and edit/delete actions.
- **Theming**: Dark/light mode toggle using Tailwind’s theming support.
- **Deployment Config**: Dockerfile and Vercel settings for seamless CI/CD.

## 5. Tech Stack & Tools

- **Frontend**:
  - Next.js (App Router)
  - React (useState, useEffect)
  - shadcn/ui component library
  - Tailwind CSS for styling
  - Zod for client-side schema validation

- **Backend**:
  - Next.js API Routes (co-located under `/app/api`)
  - better-auth for authentication and session management
  - PostgreSQL database
  - Drizzle ORM for type-safe data models
  - Zod for request validation
  - OpenAI Node.js client for AI calls (GPT-4)

- **Deployment & Tooling**:
  - Docker and Docker Compose
  - Vercel deployment
  - Environment variables (`.env`) for secrets (OPENAI_API_KEY, DATABASE_URL)
  - VS Code with Tailwind CSS IntelliSense, Drizzle plugin

## 6. Non-Functional Requirements

- **Performance**: 
  - Page load time < 2s on 3G network emulation
  - AI endpoint response < 500ms (excluding external API latency)
- **Security**:
  - HTTPS enforced in production
  - Secure HTTP-only cookies for sessions
  - Input validation to prevent SQL injection and XSS
- **Usability**:
  - WCAG 2.1 AA accessibility compliance
  - Mobile-responsive design for screen widths 320px–1920px
- **Reliability**:
  - 99.9% uptime for core services
  - Graceful error fallback UI for AI failures
- **Compliance**:
  - GDPR-ready: user data deletion endpoint

## 7. Constraints & Assumptions

- **Constraints**:
  - Must use Next.js App Router (no custom Express server)
  - Rely on OpenAI GPT-4 API availability and quota limits
  - PostgreSQL must be accessible in all environments

- **Assumptions**:
  - Users have modern browsers with JavaScript enabled
  - Environment variables are securely managed
  - Single-tenant architecture (no multi-org support online)

## 8. Known Issues & Potential Pitfalls

- **API Rate Limits**: OpenAI may throttle requests. Mitigation: implement exponential backoff and local caching for repeated prompts.
- **Long AI Latency**: AI calls can be slow. Mitigation: show skeleton loaders and timeout after 10s with a user message.
- **Schema Drift**: Database schema changes require careful migrations. Mitigation: use Drizzle migrations and version control.
- **Auth Edge Cases**: Session expiry and refresh flows need testing. Mitigation: add end-to-end tests for login/logout scenarios.
- **CORS Errors**: If front and back are separated, ensure proper CORS headers on API routes.

---

This PRD provides a clear, unambiguous blueprint for the AI-Assisted Idea Recording Document application. It covers all aspects needed for subsequent technical documents and implementation steps.