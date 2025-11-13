# Frontend Guideline Document

This document outlines the frontend architecture, design principles, and technologies used in the "Idea Capture Hub" Next.js project. It’s written in everyday language so anyone can understand how the frontend is set up, how components work together, and what tools and practices keep the UI maintainable, scalable, and user-friendly.

## 1. Frontend Architecture

### 1.1 Overview
- **Framework:** Next.js (App Router) for both pages and API routes in one codebase.  
- **Library:** React for building UI components.  
- **UI Kit:** shadcn/ui — a collection of accessible, customizable React components.  
- **Styling:** Tailwind CSS (utility-first CSS framework).  

### 1.2 How It Supports Scalability, Maintainability, and Performance
- **Folder-based routing and co-located API routes:** Keeps related code together (e.g., UI and data logic for `/dashboard`).  
- **Component-driven approach:** Small, focused pieces of UI that can be reused throughout the app.  
- **TypeScript + Drizzle ORM (backend):** Ensures type safety across the stack, reducing runtime errors.  
- **Tailwind’s JIT engine:** Generates only the CSS you use, keeping the bundle small and fast.  
- **Server-Side Rendering (SSR) & Client Components:** Delivers fast first-load performance and interactive experiences.

## 2. Design Principles

### 2.1 Key Principles
- **Usability:** Intuitive forms with clear labels, error messages, and success feedback.  
- **Accessibility:** Semantic HTML, proper `aria-` attributes, keyboard navigation, and focus indicators.  
- **Responsiveness:** Fluid layouts and utility classes in Tailwind ensure the UI works on any device.  
- **Consistency:** Shared design tokens (colors, spacing, typography) and component library enforce a uniform look and feel.

### 2.2 Application of Principles
- **Forms:** Each input has a label, placeholder text, and client-side validation.  
- **Dark Mode:** Toggle switch that flips color tokens, maintaining contrast and readability.  
- **Interactive Elements:** Buttons and links have hover, focus, and disabled states clearly defined.  
- **Feedback:** Toast notifications (success/error) inform the user of save actions and AI suggestions.

## 3. Styling and Theming

### 3.1 Styling Approach
- **Methodology:** Utility-first via Tailwind CSS—avoid custom CSS files whenever possible.  
- **Component Styling:** shadcn/ui components come pre-styled; override styles using Tailwind’s responsive and state‐based variants.

### 3.2 Theming
- **Dark & Light Mode:** Tailwind’s `dark:` variant toggles between themes.  
- **Theme Switcher:** A React context tracks user preference and applies the `class="dark"` on `<html>`.  

### 3.3 Visual Style
- **Overall Style:** Modern flat design with subtle glassmorphism on card backgrounds (light blur and semi-transparent surfaces).  
- **Color Palette:**  
  • Primary: #3B82F6 (Blue-600)  
  • Secondary: #F59E0B (Amber-500)  
  • Accent: #10B981 (Emerald-500)  
  • Background Light: #F9FAFB  
  • Background Dark: #1F2937  
  • Surface Light: rgba(255, 255, 255, 0.75)  
  • Surface Dark: rgba(31, 41, 55, 0.75)  
  • Border: #E5E7EB  
  • Text Light: #111827  
  • Text Dark: #F3F4F6  

### 3.4 Typography
- **Font Family:** Inter (system-backed, clean, highly readable).  
- **Headings:** Use `font-bold` with size scale (`text-2xl`, `text-xl`).  
- **Body Text:** `font-normal` with `text-base` for paragraphs and `text-sm` for captions.

## 4. Component Structure

### 4.1 Organization
- **`/components/ui/`** – Base UI elements from shadcn/ui (Button, Input, Card).  
- **`/components/`** – App-specific components (IdeaForm, IdeaList).  
- **Naming:** Each component in its own file (e.g., `idea-form.tsx`) and folder if it has sub-components or styles.

### 4.2 Reusability and Maintainability
- **Single Responsibility:** Components do one thing (e.g., IdeaForm handles only the input form).  
- **Props and Events:** Use props to pass data and callback functions for actions (e.g., `onSave`, `onSuggest`).  
- **Composition:** Build complex UI by combining simpler components (e.g., Card wrapping Input and Button).

## 5. State Management

### 5.1 Local State
- **React Hooks:** `useState` and `useEffect` for form inputs, suggestion lists, loading and error states.

### 5.2 Shared State
- **Context API (optional):** If multiple components need shared theme or auth data, a simple React Context stores and provides it.  
- **Data Fetching / Caching:** Fetch ideas and suggestions via built-in `fetch` calls in `useEffect` or consider SWR/React Query for caching and revalidation.

## 6. Routing and Navigation

### 6.1 Routing
- **Next.js App Router:** Folder structure under `/app` defines routes automatically.  
  • `app/page.tsx` → `/`  
  • `app/dashboard/page.tsx` → `/dashboard`  
  • `app/api/ideas/route.ts` → `/api/ideas`  
  • `app/api/ai/suggest/route.ts` → `/api/ai/suggest`

### 6.2 Navigation
- **`next/link`:** Wrap `<Link>` around buttons or text to navigate without full reloads.  
- **Protected Routes:** Dashboard page checks auth status (via session cookie) and redirects to sign-in if unauthenticated.

## 7. Performance Optimization

- **Code Splitting:** Next.js automatically splits code per route and component; use `dynamic()` for rarely used components.  
- **Lazy Loading:** Dynamically import heavy components (e.g., charts or AI suggestion modals).  
- **Image Optimization:** Use `next/image` for responsive, optimized images.  
- **Asset Optimization:** Leverage Tailwind JIT and purge unused CSS in production.  
- **Caching Headers:** Configure API and asset caching headers for static assets and API responses.

## 8. Testing and Quality Assurance

### 8.1 Testing Strategies
- **Unit Tests:** Vitest or Jest combined with React Testing Library to test components (e.g., form validation, button clicks).  
- **Integration Tests:** Test API routes (ideas CRUD, AI suggestions) with supertest or custom HTTP clients.  
- **End-to-End Tests:** Playwright or Cypress to simulate user flows: sign in, fill form, request suggestions, save idea, view list.

### 8.2 Tooling
- **Linters:** ESLint with TypeScript plugin.  
- **Formatter:** Prettier for consistent code style.  
- **Pre-commit Hooks:** Husky + lint-staged to run linting and tests before commits.

## 9. Conclusion and Overall Frontend Summary

The "Idea Capture Hub" frontend is built on a modern stack that prioritizes developer productivity, user experience, and performance. Using Next.js with the App Router, React, shadcn/ui, and Tailwind CSS, we achieve a scalable and maintainable structure. Key design principles—usability, accessibility, responsiveness, and consistency—are baked into every component.  

State is managed simply with React hooks, while routing and API integration are handled by Next.js conventions. Performance optimizations like code splitting, image optimization, and CSS purging ensure fast load times. A robust testing strategy and toolchain maintain code quality as the app grows.  

This guideline should give any frontend developer—or even a non-technical stakeholder—a clear roadmap to understand, extend, or maintain the UI of the project with confidence.