# Backend Structure Document for Idea Capture Hub

## 1. Backend Architecture

This section explains how the backend is organized and what design choices help keep it scalable, maintainable, and fast.

• Overall Structure:
  - Next.js App Router: Uses co-located API routes and UI code in one project. This keeps frontend and backend logic in the same codebase.  
  - Serverless Functions: Each API route runs as a separate serverless function on Vercel. This makes scaling up or down automatic.
  - MVC-Lite Pattern: Although not a strict Model-View-Controller, we separate concerns:
    1. Models defined via Drizzle ORM (database layer)
    2. Routes and controllers in Next.js API files  
    3. Views handled by React components in `app/`.

• Frameworks and Libraries:
  - Next.js (App Router) for page rendering, routing, and API endpoints
  - TypeScript for type safety across the entire stack
  - Drizzle ORM for database modeling and queries

• Scalability and Performance:
  - Serverless endpoints spin up on demand—no idle servers to pay for.
  - Automatic horizontal scaling by Vercel lets you handle traffic spikes.
  - Caching at the edge (via Vercel) reduces latency for static assets and GET requests.

• Maintainability:
  - Co-located code keeps related logic together (e.g., API route next to its page).
  - Type-safe models catch errors early during development.
  - Clear folder structure for routes, components, and database schemas.

## 2. Database Management

This section covers the database choice, how data is organized, and best practices for managing it.

• Database Technology:
  - PostgreSQL (relational SQL database)
  - Hosted via a managed cloud provider (e.g., AWS RDS or DigitalOcean Managed DB)

• ORM and Migrations:
  - Drizzle ORM for defining tables and running migrations in a type-safe way
  - Every schema change is tracked and applied with migration scripts

• Data Structure and Access:
  - Users and ideas linked by foreign keys, enforcing referential integrity
  - Queries written with Drizzle’s fluent API, which protects against SQL injection
  - Validation on the backend (using Zod) before data hits the database

• Data Management Practices:
  - Regular backups managed by the database provider
  - Strict access controls: only the backend service account can read/write data
  - Use of environment variables for database credentials (no secrets in code)

## 3. Database Schema

Below is a human-readable overview and the SQL definitions for the tables.

Users Table (already existing):
  • id: unique identifier for each user
  • email: user’s email (unique)  
  • hashed_password: securely stored password
  • created_at, updated_at: timestamps

Ideas Table (new):
  • id: unique identifier for each idea
  • user_id: reference to users.id  
  • product: short text describing the product idea
  • customer: text describing the target customer
  • business_model: text outlining the business model  
  • created_at, updated_at: timestamps

SQL Schema (PostgreSQL):

```sql
-- Users table (existing)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  hashed_password TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ideas table (new)
CREATE TABLE ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product TEXT NOT NULL,
  customer TEXT NOT NULL,
  business_model TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 4. API Design and Endpoints

We use RESTful API routes provided by Next.js. All endpoints live under `app/api/`.

1. Authentication Endpoints (provided by `better-auth`):
   • `POST /api/auth/signup` – register a new user  
   • `POST /api/auth/signin` – log in and create a session  
   • `POST /api/auth/signout` – end the user’s session

2. Ideas Endpoints (`/api/ideas/`):
   • `GET /api/ideas` – fetch all ideas for the current user
   • `POST /api/ideas` – create a new idea (body: product, customer, business_model)
   • `PUT /api/ideas/:id` – update an existing idea by its id
   • `DELETE /api/ideas/:id` – remove an idea by its id

3. AI Suggestion Endpoint (`/api/ai/suggest`):
   • `POST /api/ai/suggest` – send current product & customer context, receive a list of business model suggestions

Each endpoint:
  - Validates input with Zod
  - Checks the user’s session/authorization
  - Returns JSON with clear success or error fields

## 5. Hosting Solutions

We rely on modern cloud hosting to improve reliability, speed, and cost efficiency.

• Vercel for Next.js:
  - Serverless functions for API routes  
  - Global edge network for static assets (automatic CDN)  
  - Easy environment variable management  

• Docker (local development):
  - Ensures everyone on the team uses the same environment
  - Mirrors production behavior when running locally

Benefits:
  - Zero-maintenance servers: no OS updates or scaling worries
  - Pay only for what you use: serverless functions scale down to zero
  - Built-in SSL and HTTP/2 for secure, fast delivery

## 6. Infrastructure Components

These pieces work together under the hood to keep the backend fast and reliable.

• Load Balancing and Edge Caching:
  - Vercel automatically distributes traffic across edge locations
  - Static and cached GET requests served close to the user

• Database Hosting:
  - Managed PostgreSQL cluster with automatic failover and daily backups

• Caching Layer (optional enhancement):
  - In-memory cache (Redis) for heavy read operations (future addition)

• Container Registry:
  - Docker images published to a private registry for reproducible builds

## 7. Security Measures

We safeguard user data through multiple layers of protection.

• Authentication & Authorization:
  - `better-auth` handles secure sign-up, sign-in, and sessions  
  - All idea endpoints check the user’s session before proceeding

• Data Encryption:
  - HTTPS enforced for all traffic  
  - Database encryption at rest managed by the provider

• Input Validation:
  - Zod schemas verify request bodies before any database operation

• Secrets Management:
  - API keys and database credentials stored in environment variables  
  - No secrets checked into source control

• Rate Limiting (future):
  - Add rate limiting middleware to prevent brute-force attacks on AI endpoint

## 8. Monitoring and Maintenance

Ensuring uptime and quick issue resolution is critical.

• Logging & Error Tracking:
  - Vercel’s built-in logs for serverless functions  
  - Integrate Sentry or LogRocket for real-time error tracking

• Performance Monitoring:
  - Vercel Analytics to track response times and latency  
  - Database monitoring dashboard from the cloud provider

• Maintenance Practices:
  - Scheduled Drizzle migrations when updating schemas
  - Routine dependency updates (Dependabot or Renovate)  
  - Periodic security audits of NPM packages

## 9. Conclusion and Overall Backend Summary

In summary, the Idea Capture Hub’s backend uses a modern, serverless-friendly architecture built on Next.js and PostgreSQL. It pairs co-located API routes with type-safe database models to speed up development and reduce runtime errors. Hosting on Vercel ensures automatic scaling, edge performance, and cost efficiency. Security best practices—strong authentication, encrypted data, and input validation—protect user ideas at every step. Monitoring tools and migration strategies keep the service reliable and maintainable. Together, these components form a robust foundation for your AI-assisted idea recording application, ready to grow with your users’ needs.